import type { SeoResult, Finding, StructuredDataInfo, CoreWebVitals } from "@/types/scan"
import { fetchUrl, checkRobotsTxt, checkSitemapXml } from "@/scanner/lib/http-client"
import type { CheerioAPI } from "cheerio"

interface ScanInput { url: string; hostname: string }

export class SeoScanner {
  private findings: Finding[] = []
  private score = 0
  private $: CheerioAPI | null = null
  private robotsTxt: string | null = null
  private sitemapXml: string | null = null

  async scan(input: ScanInput): Promise<SeoResult> {
    await this.runChecks(input)
    this.calculateScore()
    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      indexability: {
        robotsTxt: this.robotsTxt !== null,
        metaRobots: this.checkMetaRobots(),
        canonicals: this.countCanonicals(),
        blockedByLogin: this.checkLoginBlock(),
      },
      onPage: this.getOnPageData(),
      technical: this.getTechnicalData(),
      structuredData: this.getStructuredData(),
      cwvData: this.getCoreWebVitals(),
    }
  }

  private async runChecks(input: ScanInput) {
    const result = await fetchUrl(input.url).catch(() => null)
    if (!result || !result.$) {
      this.addFinding({ id: "seo-unreachable", category: "crawl", severity: "critical", title: "Site Unreachable", description: `Could not fetch ${input.url}.`, passed: false })
      return
    }
    this.$ = result.$
    this.robotsTxt = await checkRobotsTxt(input.hostname)
    this.sitemapXml = await checkSitemapXml(input.hostname)
    this.checkMetaTags()
    this.checkContentStructure()
    this.checkTechnicalSeo()
    this.checkStructuredData()
    this.checkCoreWebVitals()
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private checkMetaTags() {
    const $ = this.$
    if (!$) return

    const title = $("title").first().text().trim()
    if (title) {
      this.addFinding({
        id: "seo-title",
        category: "on-page",
        severity: title.length >= 30 && title.length <= 60 ? "low" : "high",
        title: "Page Title",
        description: `Title tag is ${title.length} characters: "${title.slice(0, 80)}${title.length > 80 ? "..." : ""}"`,
        passed: title.length >= 30 && title.length <= 60,
        remediationPrompt: title.length > 60 ? "Shorten title to 50-60 characters." : title.length < 30 ? "Make title at least 30 characters." : undefined,
      })
    } else {
      this.addFinding({ id: "seo-title-missing", category: "on-page", severity: "critical", title: "Missing Page Title", description: "No <title> tag found.", passed: false, remediationPrompt: "Add a descriptive <title> tag (50-60 characters)." })
    }

    const metaDesc = $('meta[name="description"]').attr("content") || ""
    this.addFinding({
      id: "seo-meta-desc",
      category: "on-page",
      severity: metaDesc.length >= 120 && metaDesc.length <= 160 ? "low" : metaDesc ? "medium" : "high",
      title: "Meta Description",
      description: metaDesc ? `${metaDesc.length} characters.` : "Missing meta description.",
      passed: metaDesc.length >= 120 && metaDesc.length <= 160,
      remediationPrompt: metaDesc ? undefined : "Add a meta description (120-160 characters).",
    })

    const canonical = $('link[rel="canonical"]').attr("href") || ""
    this.addFinding({
      id: "seo-canonical",
      category: "technical",
      severity: canonical ? "low" : "medium",
      title: "Canonical URL",
      description: canonical ? `Canonical: ${canonical}` : "No canonical URL set.",
      passed: !!canonical,
      remediationPrompt: !canonical ? "Add a <link rel='canonical'> tag to prevent duplicate content issues." : undefined,
    })

    const ogTitle = $('meta[property="og:title"]').attr("content") || ""
    this.addFinding({
      id: "seo-og-tags",
      category: "social",
      severity: ogTitle ? "low" : "medium",
      title: "Open Graph Tags",
      description: ogTitle ? "Open Graph tags present." : "No Open Graph tags found.",
      passed: !!ogTitle,
    })

    const viewport = $('meta[name="viewport"]').attr("content") || ""
    this.addFinding({
      id: "seo-viewport",
      category: "technical",
      severity: viewport ? "low" : "high",
      title: "Viewport Meta Tag",
      description: viewport ? "Mobile viewport configured." : "No viewport meta tag — page not optimized for mobile.",
      passed: !!viewport,
    })

    const lang = $("html").attr("lang") || ""
    this.addFinding({
      id: "seo-lang",
      category: "technical",
      severity: lang ? "low" : "medium",
      title: "Language Attribute",
      description: lang ? `Page language: ${lang}` : "No lang attribute on <html>.",
      passed: !!lang,
    })
  }

  private checkContentStructure() {
    const $ = this.$
    if (!$) return

    const h1s = $("h1").length
    this.addFinding({
      id: "seo-h1",
      category: "content",
      severity: h1s === 1 ? "low" : h1s > 1 ? "medium" : "high",
      title: "Heading Structure (H1)",
      description: h1s === 0 ? "No H1 tag found." : h1s > 1 ? `${h1s} H1 tags found — should have exactly one.` : "One H1 tag found — good.",
      passed: h1s === 1,
      remediationPrompt: h1s === 0 ? "Add exactly one <h1> tag describing the page content." : h1s > 1 ? "Use only one <h1> per page." : undefined,
    })

    const imgs = $("img").length
    const imgsWithAlt = $("img[alt]").length
    const imgsMissingAlt = imgs - imgsWithAlt
    this.addFinding({
      id: "seo-img-alt",
      category: "accessibility",
      severity: imgsMissingAlt > 0 ? "medium" : "low",
      title: "Image Alt Attributes",
      description: `${imgsWithAlt}/${imgs} images have alt text. ${imgsMissingAlt} missing.`,
      passed: imgsMissingAlt === 0,
      remediationPrompt: imgsMissingAlt > 0 ? `Add alt text to ${imgsMissingAlt} image(s).` : undefined,
    })

    const wordCount = ($("body").text() || "").split(/\s+/).filter(Boolean).length
    this.addFinding({
      id: "seo-word-count",
      category: "content",
      severity: wordCount >= 300 ? "low" : wordCount > 0 ? "medium" : "high",
      title: "Content Length",
      description: `${wordCount} words found on page.`,
      passed: wordCount >= 300,
      remediationPrompt: wordCount < 300 ? "Aim for at least 300 words per page for better SEO." : undefined,
    })
  }

  private checkTechnicalSeo() {
    const $ = this.$
    if (!$) return

    const hreflangs = $('link[rel="alternate"][hreflang]').length
    this.addFinding({
      id: "seo-hreflang",
      category: "international",
      severity: hreflangs > 0 ? "low" : "info",
      title: "Hreflang Tags",
      description: `${hreflangs} hreflang tag(s) found.`,
      passed: true,
    })

    const hasSchema = $('script[type="application/ld+json"]').length > 0
    this.addFinding({
      id: "seo-structured-data",
      category: "structured-data",
      severity: hasSchema ? "low" : "medium",
      title: "Structured Data (JSON-LD)",
      description: hasSchema ? "JSON-LD structured data found." : "No JSON-LD structured data detected.",
      passed: hasSchema,
    })
  }

  private checkStructuredData() {
    const $ = this.$
    if (!$) return
    const scripts = $('script[type="application/ld+json"]')
    const types: string[] = []
    scripts.each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}")
        const t = data["@type"]
        if (t) types.push(Array.isArray(t) ? t.join(", ") : t)
      } catch { /* ignore */ }
    })
  }

  private checkCoreWebVitals() {}

  private checkMetaRobots(): boolean {
    const $ = this.$
    if (!$) return true
    const robots = $('meta[name="robots"]').attr("content") || ""
    return !robots.includes("noindex")
  }

  private countCanonicals(): number {
    const $ = this.$
    if (!$) return 0
    return $('link[rel="canonical"]').length
  }

  private checkLoginBlock(): boolean { return false }

  private getOnPageData() {
    const $ = this.$
    if (!$) return { title: 0, metaDescription: false, h1: 0, h2: 0, imagesWithAlt: 0, imagesMissingAlt: 0 }
    return {
      title: $("title").first().text().trim().length,
      metaDescription: !!$('meta[name="description"]').attr("content"),
      h1: $("h1").length,
      h2: $("h2").length,
      imagesWithAlt: $("img[alt]").length,
      imagesMissingAlt: $("img").length - $("img[alt]").length,
    }
  }

  private getTechnicalData() {
    const $ = this.$
    if (!$) return { https: false, wwwRedirect: false, trailingSlash: false, languageDeclared: false }
    return {
      https: true,
      wwwRedirect: false,
      trailingSlash: false,
      languageDeclared: !!$("html").attr("lang"),
    }
  }

  private getStructuredData(): StructuredDataInfo {
    const $ = this.$
    if (!$) return { types: [], validCount: 0, invalidCount: 0 }
    const scripts = $('script[type="application/ld+json"]')
    const types: string[] = []
    let valid = 0, invalid = 0
    scripts.each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}")
        if (data["@type"]) types.push(data["@type"])
        valid++
      } catch { invalid++ }
    })
    return { types, validCount: valid, invalidCount: invalid }
  }

  private getCoreWebVitals(): CoreWebVitals {
    return { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0 }
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
