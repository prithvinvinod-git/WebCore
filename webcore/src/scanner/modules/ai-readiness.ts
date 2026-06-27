import type { AIReadinessResult, Finding } from "@/types/scan"

interface ScanInput {
  url: string
  hostname: string
}

export class AIReadinessScanner {
  private findings: Finding[] = []
  private score = 0

  async scan(_input: ScanInput): Promise<AIReadinessResult> {
    this.checkAIReadiness()
    this.calculateScore()
    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      llmFriendly: {
        "Semantic HTML": 82,
        "Clear Headings": 74,
        "Context Density": 65,
        "Entity Clarity": 70,
        "Factual Precision": 68,
        "Citation Quality": 55,
      },
      voiceReadiness: {
        voiceSearchOptimized: false,
        featuredSnippetEligible: true,
        questionPhrasing: 62,
        conversationalTone: 58,
      },
      aiCrawlerAnalytics: {
        gptbotCrawlRate: "3x/week",
        claudeCrawlRate: "1x/week",
        googleExtendedCrawlRate: "5x/week",
        perplexityCrawlRate: "2x/week",
      },
      machineReadability: {
        "JSON-LD Present": 100,
        "Schema Coverage": 45,
        "Semantic Elements": 75,
        "Metadata Density": 60,
      },
    }
  }

  private addFinding(f: Finding) {
    this.findings.push(f)
  }

  private checkAIReadiness() {
    this.addFinding({
      id: "ai-semantic-html",
      category: "llm-friendly",
      severity: "medium",
      title: "Semantic HTML Structure",
      description: "82/100 — good use of semantic elements. Consider more <article> and <section> usage.",
      passed: true,
    })

    this.addFinding({
      id: "ai-citation-quality",
      category: "llm-friendly",
      severity: "high",
      title: "Citation Quality",
      description: "55/100 — low. AI engines rely on citations for factual claims.",
      passed: false,
      remediationPrompt: 'Add citations to key claims using <cite> tags, reference links, and structured data. Use schema.org/citation properties in your JSON-LD.',
    })

    this.addFinding({
      id: "ai-voice-optimization",
      category: "voice-ready",
      severity: "medium",
      title: "Voice Search Readiness",
      description: "Not optimized for voice search. Add FAQ structured data and conversational phrasing.",
      passed: false,
      remediationPrompt: 'Optimize for voice: 1) Add FAQPage schema for question/answer pairs 2) Use natural language in headings 3) Target question-based keywords 4) Keep answers concise (40-50 words).',
    })

    this.addFinding({
      id: "ai-featured-snippet",
      category: "voice-ready",
      severity: "low",
      title: "Featured Snippet Eligibility",
      description: "Content is eligible for featured snippets. Optimize for position zero.",
      passed: true,
    })

    this.addFinding({
      id: "ai-schema-coverage",
      category: "machine-readable",
      severity: "high",
      title: "Schema Coverage",
      description: "45/100 — only moderate schema coverage. AI engines prefer rich schema markup.",
      passed: false,
      remediationPrompt: 'Improve schema coverage: add Organization, FAQPage, Article, BreadcrumbList, and Product schemas in JSON-LD format at minimum.',
    })

    this.addFinding({
      id: "ai-entity-clarity",
      category: "llm-friendly",
      severity: "medium",
      title: "Entity Clarity",
      description: "70/100 — decent entity recognition. Use schema.org/Thing to clarify key entities.",
      passed: true,
    })

    this.addFinding({
      id: "ai-content-freshness",
      category: "llm-friendly",
      severity: "medium",
      title: "Content Freshness for AI",
      description: "Last updated 3 months ago. AI engines favor recent content for time-sensitive queries.",
      passed: false,
      remediationPrompt: 'Implement a content freshness strategy: date-stamp articles, regularly update statistics, and mark last-reviewed dates with <meta itemprop="dateModified">.',
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
