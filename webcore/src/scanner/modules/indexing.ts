import type { IndexingResult, Finding, SitemapHealth, RobotsHealth } from "@/types/scan"
import { fetchUrl, checkRobotsTxt, checkSitemapXml } from "@/scanner/lib/http-client"
import type { CheerioAPI } from "cheerio"

interface ScanInput { url: string; hostname: string }

export class IndexingScanner {
  private findings: Finding[] = []
  private score = 0
  private $: CheerioAPI | null = null
  private html = ""
  private robotsContent: string | null = null
  private sitemapContent: string | null = null
  private robotsHealth: RobotsHealth = { valid: false, blockedResources: [], sitemapRefs: [], aiCrawlerRules: 0 }
  private sitemapHealth: SitemapHealth = { valid: false, urlCount: 0, errors: [], lastModified: "" }

  async scan(input: ScanInput): Promise<IndexingResult> {
    const [result, robots, sitemap] = await Promise.all([
      fetchUrl(input.url).catch(() => null),
      checkRobotsTxt(input.hostname).catch(() => null),
      checkSitemapXml(input.hostname).catch(() => null),
    ])

    if (result && result.$) {
      this.$ = result.$
      this.html = result.html
    }
    this.robotsContent = robots
    this.sitemapContent = sitemap

    this.runChecks(input)
    this.calculateScore()

    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      indexedCount: this.inferIndexedCount(),
      crawlStats: this.getCrawlStats(),
      sitemapHealth: this.sitemapHealth,
      robotsHealth: this.robotsHealth,
      spaRendering: this.detectSpaMode(),
    }
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private runChecks(_input: ScanInput) {
    this.checkRobotsTxt()
    this.checkSitemap()
    this.checkMetaRobots()
    this.checkCanonical()
    this.checkHreflang()
    this.detectFramework()
  }

  private checkRobotsTxt() {
    const content = this.robotsContent
    if (!content) {
      this.robotsHealth = { valid: false, blockedResources: [], sitemapRefs: [], aiCrawlerRules: 0 }
      this.addFinding({ id: "idx-robots-missing", category: "crawlability", severity: "high", title: "robots.txt Missing", description: "No robots.txt found — crawlers have no guidance.", passed: false, remediationPrompt: "Create robots.txt with User-agent: * and Allow: /" })
      return
    }

    const lines = content.split("\n")
    const disallows: string[] = []
    const sitemaps: string[] = []
    const aiRules: string[] = []
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase()
      if (trimmed.startsWith("disallow:")) disallows.push(line.trim())
      if (trimmed.startsWith("sitemap:")) sitemaps.push(line.trim())
      if (/user-agent:\s*(gptbot|claude|perplexity|google-extended|ccbot)/.test(trimmed)) aiRules.push(line.trim())
    }

    this.robotsHealth = {
      valid: true,
      blockedResources: disallows.map((d) => d.replace(/^disallow:\s*/i, "")).filter(Boolean),
      sitemapRefs: sitemaps.map((s) => s.replace(/^sitemap:\s*/i, "")),
      aiCrawlerRules: aiRules.length,
    }

    this.addFinding({
      id: "idx-robots-valid",
      category: "crawlability",
      severity: "low",
      title: "robots.txt Found",
      description: `robots.txt present with ${disallows.length} disallow rule(s) and ${sitemaps.length} sitemap reference(s).`,
      passed: true,
    })
    if (disallows.length > 5) {
      this.addFinding({
        id: "idx-robots-blocked",
        category: "crawlability",
        severity: "medium",
        title: "Crawl Budget Warning",
        description: `${disallows.length} disallowed paths — may limit crawl coverage.`,
        passed: false,
      })
    }
  }

  private checkSitemap() {
    if (!this.sitemapContent) {
      this.sitemapHealth = { valid: false, urlCount: 0, errors: ["No sitemap found"], lastModified: "" }
      this.addFinding({ id: "idx-sitemap-missing", category: "sitemap", severity: "high", title: "XML Sitemap Missing", description: "No sitemap.xml detected — search engines may miss pages.", passed: false, remediationPrompt: "Generate and submit an XML sitemap via Google Search Console." })
      return
    }

    const urlCount = (this.sitemapContent.match(/<loc>/g) || []).length
    const dateMatch = this.sitemapContent.match(/<lastmod>([^<]+)<\/lastmod>/i)
    const errors: string[] = []
    if (urlCount === 0) errors.push("No URLs in sitemap")
    if (this.sitemapContent.includes("sitemapindex")) errors.push("Nested sitemap index detected")

    this.sitemapHealth = {
      valid: urlCount > 0,
      urlCount,
      errors,
      lastModified: dateMatch ? dateMatch[1] : "",
    }

    this.addFinding({
      id: "idx-sitemap-found",
      category: "sitemap",
      severity: urlCount > 0 ? "low" : "high",
      title: "XML Sitemap",
      description: `Sitemap found with ${urlCount} URL(s).`,
      passed: urlCount > 0,
    })
  }

  private checkMetaRobots() {
    const $ = this.$
    if (!$) return
    const robotsMeta = $('meta[name="robots"]').attr("content") || ""
    const googleMeta = $('meta[name="googlebot"]').attr("content") || ""

    const noindex = robotsMeta.includes("noindex") || googleMeta.includes("noindex")
    const nofollow = robotsMeta.includes("nofollow") || googleMeta.includes("nofollow")

    if (noindex || nofollow) {
      this.addFinding({
        id: "idx-meta-robots",
        category: "indexability",
        severity: "high",
        title: "Meta Robots Restriction",
        description: `${noindex ? "noindex" : ""} ${nofollow ? "nofollow" : ""} detected — page may not be indexed.`,
        passed: false,
        remediationPrompt: noindex ? "Remove noindex directive to allow indexing." : undefined,
      })
    } else {
      this.addFinding({
        id: "idx-meta-robots-ok",
        category: "indexability",
        severity: "info",
        title: "Meta Robots",
        description: "No indexing restrictions via meta robots.",
        passed: true,
      })
    }
  }

  private checkCanonical() {
    const $ = this.$
    if (!$) return
    const canonicals = $('link[rel="canonical"]')
    if (canonicals.length > 1) {
      this.addFinding({ id: "idx-canonical-multiple", category: "technical", severity: "medium", title: "Multiple Canonical URLs", description: `${canonicals.length} canonical tags found — only one should exist.`, passed: false })
    } else if (canonicals.length === 0) {
      this.addFinding({ id: "idx-canonical-missing", category: "technical", severity: "medium", title: "No Canonical URL", description: "Canonical URL not set — duplicate content risk.", passed: false, remediationPrompt: "Add <link rel='canonical'> pointing to the preferred URL." })
    }
  }

  private checkHreflang() {
    const $ = this.$
    if (!$) return
    const hreflangs = $('link[rel="alternate"][hreflang]')
    if (hreflangs.length > 0) {
      const langs = new Set<string>()
      hreflangs.each((_, el) => { const l = $(el).attr("hreflang"); if (l) langs.add(l) })
      this.addFinding({
        id: "idx-hreflang",
        category: "international",
        severity: "low",
        title: "Hreflang Tags",
        description: `${hreflangs.length} hreflang tag(s) for ${langs.size} language(s).`,
        passed: true,
      })
    }
  }

  private detectFramework() {
    const $ = this.$
    if (!$) return
    const html = this.html
    let framework = "Unknown / Static HTML"
    let ssr = false

    if (html.includes("__NEXT_DATA__")) { framework = "Next.js"; ssr = true }
    else if (html.includes("nuxt")) { framework = "Nuxt.js"; ssr = true }
    else if (html.includes("__NUXT__")) { framework = "Nuxt.js/Vue"; ssr = true }
    else if (html.includes("react") && html.includes("root")) { framework = "React (CSR likely)"; ssr = false }
    else if (html.includes("ng-version")) { framework = "Angular"; ssr = false }
    else if (html.includes("gatsby")) { framework = "Gatsby"; ssr = true }

    this.addFinding({
      id: "idx-framework",
      category: "technology",
      severity: "info",
      title: "Framework Detection",
      description: `Detected: ${framework}. ${ssr ? "SSR/SSG friendly for indexing." : "CSR may require special indexing setup."}`,
      passed: ssr,
      remediationPrompt: !ssr ? "Consider SSR/SSG for better search engine indexing of dynamic content." : undefined,
    })
  }

  private inferIndexedCount(): number {
    return this.sitemapHealth.urlCount > 0 ? this.sitemapHealth.urlCount : 0
  }

  private getCrawlStats() {
    return {
      pagesCrawled: this.inferIndexedCount(),
      crawlDepth: 0,
      orphanPages: 0,
      avgResponseTime: 0,
    }
  }

  private detectSpaMode() {
    const $ = this.$
    if (!$) return { spaMode: false, preRendered: true, dynamicRoutes: 0, staticRoutes: 0 }
    const isSpa = !this.html.includes("__NEXT_DATA__") && this.html.includes('<div id="root">') || false
    return {
      spaMode: isSpa,
      preRendered: !isSpa,
      dynamicRoutes: 0,
      staticRoutes: this.sitemapHealth.urlCount,
    }
  }

  private calculateScore() {
    const passed = this.findings.filter((f) => f.passed).length
    const total = this.findings.length || 1
    this.score = Math.round((passed / total) * 100)
  }

  private getGrade(score: number): string {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    return "D"
  }
}
