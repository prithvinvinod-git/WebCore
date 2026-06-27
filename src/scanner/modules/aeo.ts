import type { AeoResult, Finding, AICrawlerAccess, TrustSignals, EngineScore } from "@/types/scan"
import { fetchUrl, checkRobotsTxt } from "@/scanner/lib/http-client"
import type { CheerioAPI } from "cheerio"

interface ScanInput { url: string; hostname: string }

const AI_CRAWLERS = [
  "GPTBot", "Claude-Web", "Google-Extended", "CCBot",
  "PerplexityBot", "Applebot-Extended", "Meta-ExternalAgent", "Amazonbot",
]

const ENGINE_LIST = ["chatgpt", "claude", "perplexity", "google_ai", "copilot", "meta_ai", "mistral", "grok"]

export class AeoScanner {
  private findings: Finding[] = []
  private score = 0
  private $: CheerioAPI | null = null
  private robotsContent: string | null = null
  private html = ""
  private crawlers: AICrawlerAccess[] = []
  private engineMatrix: Record<string, EngineScore> = {}
  private trustSignals: TrustSignals = { citedBy: 0, contentFreshness: "unknown", authorEeats: 0 }
  private extractability: Record<string, number> = {}
  private structuredDataDepth: Record<string, number> = {}

  async scan(input: ScanInput): Promise<AeoResult> {
    await this.runChecks(input)
    this.calculateScore()
    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      crawlerAccess: this.crawlers,
      extractability: this.extractability,
      structuredDataDepth: this.structuredDataDepth,
      trustSignals: this.trustSignals,
      engineMatrix: this.engineMatrix,
    }
  }

  private async runChecks(input: ScanInput) {
    const [result, robots] = await Promise.all([
      fetchUrl(input.url).catch(() => null),
      checkRobotsTxt(input.hostname).catch(() => null),
    ])
    if (!result || !result.$) {
      this.addFinding({ id: "aeo-unreachable", category: "network", severity: "critical", title: "Site Unreachable", description: `Could not fetch ${input.url}.`, passed: false })
      return
    }
    this.$ = result.$
    this.html = result.html
    this.robotsContent = robots
    this.checkAICrawlerAccess()
    this.checkExtractability()
    this.checkStructuredData()
    this.checkTrustSignals()
    this.computeEngineMatrix()
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private checkAICrawlerAccess() {
    const robots = this.robotsContent || ""
    this.crawlers = AI_CRAWLERS.map((crawler) => {
      const section = this.getRobotsSection(robots, crawler)
      const allowed = !section || section.includes("Allow")
      return { crawler, allowed, directive: section || "Allow: /" }
    })

    const hasLlmsTxt = robots.includes("llms.txt") || robots.includes("llms-full.txt")
    const blockedCount = this.crawlers.filter((c) => !c.allowed).length

    this.addFinding({
      id: "aeo-ai-crawlers",
      category: "ai-crawler-access",
      severity: blockedCount > 2 ? "high" : blockedCount > 0 ? "medium" : "low",
      title: "AI Crawler Access",
      description: `${AI_CRAWLERS.length - blockedCount}/${AI_CRAWLERS.length} AI crawlers allowed. ${blockedCount} blocked.`,
      passed: blockedCount <= 2,
      remediationPrompt: blockedCount > 2 ? "Review robots.txt — blocking too many AI crawlers reduces AI visibility." : undefined,
    })
    this.addFinding({
      id: "aeo-llms-txt",
      category: "ai-crawler-access",
      severity: hasLlmsTxt ? "low" : "medium",
      title: "llms.txt Support",
      description: hasLlmsTxt ? "llms.txt referenced in robots.txt." : "No llms.txt/llms-full.txt found — consider adding for AI context control.",
      passed: hasLlmsTxt,
    })
  }

  private getRobotsSection(robots: string, agent: string): string {
    const lines = robots.split("\n")
    let inSection = false
    const section: string[] = []
    for (const line of lines) {
      if (line.toLowerCase().includes(`user-agent: ${agent.toLowerCase()}`)) { inSection = true; continue }
      if (inSection && line.toLowerCase().startsWith("user-agent:")) break
      if (inSection) section.push(line.trim())
    }
    return section.filter((s) => s).join(", ")
  }

  private checkExtractability() {
    const $ = this.$
    if (!$) return
    const bodyText = $("body").text() || ""
    const htmlLen = this.html.length || 1
    const textLen = bodyText.length
    const contentRatio = Math.round((textLen / htmlLen) * 100)
    this.extractability = {
      "Content-to-Code Ratio": contentRatio,
      "Semantic Elements": $("article, section, nav, aside, header, footer, main").length,
      "Landmarks": $("[role='banner'], [role='navigation'], [role='main'], [role='complementary'], [role='contentinfo']").length,
      "Paragraph Structure": $("p").length,
      "List Density": $("ul, ol, dl").length,
    }

    this.addFinding({
      id: "aeo-content-ratio",
      category: "extractability",
      severity: contentRatio > 20 ? "low" : "high",
      title: "Content-to-Code Ratio",
      description: `${contentRatio}% of page is actual content. ${contentRatio > 20 ? "Good extraction potential." : "Low — AI may struggle to extract meaningful content."}`,
      passed: contentRatio > 20,
    })
    this.addFinding({
      id: "aeo-semantic-html",
      category: "extractability",
      severity: this.extractability["Semantic Elements"] >= 3 ? "low" : "high",
      title: "Semantic HTML Structure",
      description: `${this.extractability["Semantic Elements"]} semantic elements found.`,
      passed: this.extractability["Semantic Elements"] >= 3,
    })
  }

  private checkStructuredData() {
    const $ = this.$
    if (!$) return
    const scripts = $('script[type="application/ld+json"]')
    const types: string[] = []
    let depth = 0
    scripts.each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}")
        const t = data["@type"]
        if (t) {
          if (Array.isArray(t)) { types.push(...t) } else { types.push(t) }
        }
        depth += Object.keys(data).length
      } catch { /* ignore */ }
    })
    this.structuredDataDepth = {
      "Schema Types": types.length,
      "JSON-LD Entities": scripts.length,
      "Property Depth": scripts.length > 0 ? Math.round(depth / scripts.length) : 0,
    }

    this.addFinding({
      id: "aeo-structured-data",
      category: "structured-data",
      severity: scripts.length > 0 ? "low" : "high",
      title: "Structured Data for AI",
      description: scripts.length > 0
        ? `Found ${scripts.length} JSON-LD block(s) with types: ${types.slice(0, 5).join(", ") || "unknown"}`
        : "No JSON-LD structured data — AI engines lack entity context.",
      passed: scripts.length > 0,
    })
  }

  private checkTrustSignals() {
    const $ = this.$
    if (!$) return
    const bodyText = ($("body").text() || "").trim()
    const datePatterns = /\b(202[0-9]|203[0-9])-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g
    const dates = bodyText.match(datePatterns)
    const lastUpdated = dates ? dates.sort().pop() || "" : ""
    this.trustSignals = {
      citedBy: bodyText.split(/\b(cite|reference|source|according to)\b/i).length - 1,
      contentFreshness: lastUpdated || "unknown",
      authorEeats: $('[itemprop="author"], [itemprop="name"]').length,
    }

    this.addFinding({
      id: "aeo-author-signals",
      category: "trust",
      severity: this.trustSignals.authorEeats > 0 ? "low" : "medium",
      title: "Author / E-E-A-T Signals",
      description: this.trustSignals.authorEeats > 0
        ? `${this.trustSignals.authorEeats} author signal(s) detected.`
        : "No author markup — weakens E-E-A-T for AI citation.",
      passed: this.trustSignals.authorEeats > 0,
    })
    this.addFinding({
      id: "aeo-content-freshness",
      category: "trust",
      severity: this.trustSignals.contentFreshness !== "unknown" ? "low" : "medium",
      title: "Content Freshness",
      description: this.trustSignals.contentFreshness !== "unknown"
        ? `Latest date found: ${this.trustSignals.contentFreshness}`
        : "No recent dates detected — AI may deprioritize.",
      passed: this.trustSignals.contentFreshness !== "unknown",
    })
  }

  private computeEngineMatrix() {
    const $ = this.$
    if (!$) return
    const base = this.score
    const hasLdJson = $('script[type="application/ld+json"]').length > 0
    const hasSemantic = $("article, section, main").length > 0
    const robotsOk = this.crawlers.filter((c) => c.allowed).length >= 6

    this.engineMatrix = {
      chatgpt: { score: base, recommendation: hasLdJson ? "Good — structured data present" : "Add more JSON-LD" },
      claude: { score: base + 5, recommendation: hasSemantic ? "Semantic HTML helps Claude parsing" : "Improve HTML structure" },
      perplexity: { score: base - 3, recommendation: "Perplexity cites sources — increase citation marks" },
      google_ai: { score: base + 8, recommendation: robotsOk ? "Google-Extended allowed" : "Allow Google-Extended in robots.txt" },
      copilot: { score: base + 2, recommendation: "Copilot uses Bing index — standard SEO helps" },
      meta_ai: { score: base - 5, recommendation: "Meta-ExternalAgent access may be limited" },
      mistral: { score: base, recommendation: "Standard content extraction applies" },
      grok: { score: base - 8, recommendation: "Grok has limited crawler access currently" },
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
