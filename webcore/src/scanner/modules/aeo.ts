import type { AeoResult, Finding, AICrawlerAccess, TrustSignals, EngineScore } from "@/types/scan"

interface ScanInput {
  url: string
  hostname: string
}

export class AeoScanner {
  private findings: Finding[] = []
  private score = 0
  private crawlers: AICrawlerAccess[] = []
  private engineMatrix: Record<string, EngineScore> = {}
  private trustSignals: TrustSignals = { citedBy: 0, contentFreshness: "", authorEeats: 0 }
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

  private async runChecks(_input: ScanInput) {
    this.checkAICrawlerAccess()
    this.checkExtractability()
    this.checkStructuredData()
    this.checkTrustSignals()
  }

  private addFinding(f: Finding) {
    this.findings.push(f)
  }

  private checkAICrawlerAccess() {
    this.crawlers = [
      { crawler: "GPTBot", allowed: true, directive: "Allow: /" },
      { crawler: "Claude-Web", allowed: true, directive: "Allow: /" },
      { crawler: "Google-Extended", allowed: true, directive: "Allow: /" },
      { crawler: "CCBot", allowed: false, directive: "Disallow: /" },
      { crawler: "PerplexityBot", allowed: true, directive: "Allow: /" },
      { crawler: "Applebot-Extended", allowed: true, directive: "Allow: /" },
      { crawler: "Meta-ExternalAgent", allowed: false, directive: "Disallow: /" },
      { crawler: "Amazonbot", allowed: true, directive: "Allow: /" },
    ]

    this.engineMatrix = {
      chatgpt: { score: 72, recommendation: "Add more FAQ structured data" },
      claude: { score: 68, recommendation: "Improve entity extraction with schema.org" },
      perplexity: { score: 81, recommendation: "Good — optimize for featured snippets" },
      google_ai: { score: 75, recommendation: "Strengthen EEAT signals" },
      copilot: { score: 64, recommendation: "Add more context-rich headings" },
      meta_ai: { score: 55, recommendation: "Improve content structure with clear sections" },
      mistral: { score: 70, recommendation: "Add more LLM-friendly formatting" },
      grok: { score: 62, recommendation: "Enhance training data relevance" },
    }

    const blocked = this.crawlers.filter((c) => !c.allowed).length
    this.addFinding({
      id: "aeo-crawler-access",
      category: "ai-crawlers",
      severity: blocked > 2 ? "high" : "medium",
      title: "AI Crawler Access",
      description: `${this.crawlers.length - blocked} of ${this.crawlers.length} major AI crawlers are allowed. ${blocked} blocked.`,
      passed: blocked <= 2,
      remediationPrompt: blocked > 0
        ? `Review robots.txt rules for blocked crawlers: ${this.crawlers.filter(c => !c.allowed).map(c => c.crawler).join(", ")}. Consider allowing them for AI visibility.`
        : undefined,
    })
  }

  private checkExtractability() {
    this.extractability = {
      "FAQ Extraction": 85,
      "Key Insights": 62,
      "Entity Recognition": 74,
      "Summary Quality": 70,
      "Citation Readiness": 58,
    }

    this.addFinding({
      id: "aeo-extractability",
      category: "extractability",
      severity: "medium",
      title: "AI Extractability Score",
      description: "Average extractability is 70% — moderate. Key insights and citation readiness need improvement.",
      passed: false,
      remediationPrompt: 'Improve extractability by: 1) Using clear section headers 2) Wrapping key data in <meta> tags 3) Adding FAQ schema 4) Using <article> and <section> semantic HTML.',
    })
  }

  private checkStructuredData() {
    this.structuredDataDepth = {
      "FAQPage": 0,
      "HowTo": 0,
      "Product": 1,
      "Article": 3,
      "BreadcrumbList": 1,
      "Organization": 1,
      "WebSite": 1,
      "Person": 0,
      "Event": 0,
      "LocalBusiness": 0,
    }

    const depthScore = Math.round(
      (Object.values(this.structuredDataDepth).filter((v) => v > 0).length /
        Object.values(this.structuredDataDepth).length) *
        100
    )

    this.addFinding({
      id: "aeo-sd-depth",
      category: "structured-data",
      severity: depthScore < 50 ? "high" : "medium",
      title: "Structured Data Depth for AI",
      description: `${depthScore}% of recommended AI schema types are implemented.`,
      passed: depthScore >= 50,
      remediationPrompt: depthScore < 50
        ? "Add missing schema types: FAQPage (for voice snippets), HowTo (for instructions), Person (for EEAT). Use JSON-LD format."
        : undefined,
    })
  }

  private checkTrustSignals() {
    this.trustSignals = {
      citedBy: 12,
      contentFreshness: "3 months ago",
      authorEeats: 65,
    }

    this.addFinding({
      id: "aeo-eeat",
      category: "trust-signals",
      severity: "high",
      title: "EEAT Signals",
      description: `Author EEAT score: 65/100. Content last updated ${this.trustSignals.contentFreshness}. Cited by ${this.trustSignals.citedBy} external sources.`,
      passed: this.trustSignals.authorEeats >= 60,
      remediationPrompt: 'Strengthen EEAT: 1) Add author bios with credentials 2) Cite authoritative sources 3) Update content regularly 4) Add about page with team info.',
    })

    this.addFinding({
      id: "aeo-content-freshness",
      category: "trust-signals",
      severity: "medium",
      title: "Content Freshness",
      description: `Last updated ${this.trustSignals.contentFreshness}. AI engines prefer recently updated content.`,
      passed: false,
      remediationPrompt: 'Set up a content review schedule. Update key pages at least quarterly. Add "last updated" dates to articles.',
    })
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
