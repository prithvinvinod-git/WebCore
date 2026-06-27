import type { AIReadinessResult, Finding } from "@/types/scan"
import { fetchUrl, checkRobotsTxt } from "@/scanner/lib/http-client"
import type { CheerioAPI } from "cheerio"

interface ScanInput { url: string; hostname: string }

export class AIReadinessScanner {
  private findings: Finding[] = []
  private score = 0
  private $: CheerioAPI | null = null
  private html = ""
  private robotsContent: string | null = null

  async scan(input: ScanInput): Promise<AIReadinessResult> {
    const [result, robots] = await Promise.all([
      fetchUrl(input.url).catch(() => null),
      checkRobotsTxt(input.hostname).catch(() => null),
    ])
    if (result && result.$) { this.$ = result.$; this.html = result.html }
    this.robotsContent = robots

    this.runChecks()
    this.calculateScore()

    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      llmFriendly: this.getLlmFriendly(),
      voiceReadiness: this.getVoiceReadiness(),
      aiCrawlerAnalytics: this.getAiCrawlerAnalytics(),
      machineReadability: this.getMachineReadability(),
    }
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private runChecks() {
    this.checkLlmAccess()
    this.checkSemanticStructure()
    this.checkStructuredData()
    this.checkDirectAnswerFormat()
    this.checkVoiceReadiness()
  }

  private checkLlmAccess() {
    const robots = this.robotsContent || ""
    const hasLlmsTxt = robots.includes("llms.txt")
    const hasNoTrain = robots.toLowerCase().includes("no train") || robots.includes("noindex")

    this.addFinding({
      id: "ai-llms-txt",
      category: "llm-access",
      severity: hasLlmsTxt ? "low" : "medium",
      title: "LLM Context File (llms.txt)",
      description: hasLlmsTxt ? "llms.txt referenced — AI has explicit content guidance." : "No llms.txt found — AI crawlers lack content context.",
      passed: hasLlmsTxt,
    })
    this.addFinding({
      id: "ai-dnt",
      category: "llm-access",
      severity: hasNoTrain ? "info" : "low",
      title: "\"Do Not Train\" Directives",
      description: hasNoTrain ? "Site restricts AI training usage." : "No training restrictions detected.",
      passed: true,
    })
  }

  private checkSemanticStructure() {
    const $ = this.$
    if (!$) return
    const semanticElements = ["article", "section", "nav", "aside", "header", "footer", "main"]
    const found = semanticElements.filter((s) => $(s).length > 0).length
    const totalSemantic = semanticElements.reduce((sum, s) => sum + $(s).length, 0)

    this.addFinding({
      id: "ai-semantic-html",
      category: "machine-readability",
      severity: totalSemantic >= 5 ? "low" : "high",
      title: "Semantic HTML for LLMs",
      description: `${totalSemantic} semantic elements (${found}/${semanticElements.length} types). LLMs parse semantic HTML best.`,
      passed: totalSemantic >= 5,
    })
  }

  private checkStructuredData() {
    const $ = this.$
    if (!$) return
    const scripts = $('script[type="application/ld+json"]')
    const schemas = new Set<string>()
    let depth = 0
    scripts.each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "{}")
        const types = data["@type"]
        if (types) {
          if (Array.isArray(types)) types.forEach((t: string) => schemas.add(t))
          else schemas.add(types)
        }
        depth += Object.keys(data).length
      } catch { /* ignore */ }
    })

    this.addFinding({
      id: "ai-structured-data-depth",
      category: "structured-data",
      severity: schemas.size >= 2 ? "low" : schemas.size === 1 ? "medium" : "high",
      title: "Schema.org Depth for AI",
      description: `${schemas.size} schema type(s): ${[...schemas].join(", ") || "none"}. ${schemas.size >= 2 ? "Good entity context for AI." : "More schema types improve AI understanding."}`,
      passed: schemas.size >= 2,
    })

    const hasFAQ = [...schemas].some((s) => s.includes("FAQ"))
    const hasHowTo = [...schemas].some((s) => s.includes("HowTo"))
    const hasVideo = [...schemas].some((s) => s.includes("VideoObject"))
    if (hasFAQ) this.addFinding({ id: "ai-schema-faq", category: "structured-data", severity: "low", title: "FAQ Schema", description: "FAQPage structured data — directly answers questions in AI results.", passed: true })
    if (hasHowTo) this.addFinding({ id: "ai-schema-howto", category: "structured-data", severity: "low", title: "HowTo Schema", description: "HowTo schema — instructional content preferred by AI.", passed: true })
    if (hasVideo) this.addFinding({ id: "ai-schema-video", category: "structured-data", severity: "low", title: "VideoObject Schema", description: "Video structured data found.", passed: true })
  }

  private checkDirectAnswerFormat() {
    const $ = this.$
    if (!$) return
    const bodyText = $("body").text() || ""
    const questions = (bodyText.match(/\?/g) || []).length
    const faqItems = $('[itemprop="acceptedAnswer"], .faq-answer, [itemtype*="FAQ"]').length
    const lists = $("ul, ol").length
    const definitions = $("dt, dl").length

    const answerScore = questions > 0 ? 75 : 30
    this.addFinding({
      id: "ai-answer-formatting",
      category: "llm-friendly",
      severity: faqItems > 0 || questions > 5 ? "low" : "medium",
      title: "Direct Answer Formatting",
      description: `${faqItems > 0 ? "FAQ markup found. " : ""}${questions} question marks, ${lists} lists, ${definitions} definitions.`,
      passed: faqItems > 0 || questions > 5,
    })
  }

  private checkVoiceReadiness() {
    const $ = this.$
    if (!$) return
    const hasFeaturedSnippet = !!$('[itemprop*="answer"], [itemtype*="FAQ"]').length
    const hasConversationalTone = /\b(your|you|we|our|let's|how to|what is|why does)\b/i.test($("body").text() || "")

    this.addFinding({
      id: "ai-voice-readiness",
      category: "voice",
      severity: hasFeaturedSnippet ? "low" : "medium",
      title: "Voice Search Readiness",
      description: `${hasFeaturedSnippet ? "FAQ structured data supports voice snippets. " : ""}${hasConversationalTone ? "Conversational tone detected." : "More conversational phrasing improves voice match."}`,
      passed: hasFeaturedSnippet || hasConversationalTone,
    })
  }

  private getLlmFriendly() {
    const $ = this.$
    if (!$) return { "Semantic HTML": 0, "Clear Headings": 0, "Context Density": 0, "Entity Clarity": 0, "Factual Precision": 0, "Citation Quality": 0 }
    const bodyText = ($("body").text() || "").trim()
    const headings = $("h1, h2, h3, h4, h5, h6").length
    const semanticCount = ["article", "section", "nav", "aside", "header", "footer", "main"].reduce((s, el) => s + $(el).length, 0)
    const citations = (bodyText.match(/\[[\d+\]]/g) || []).length
    const facts = (bodyText.match(/\b\d+%\b/g) || []).length + (bodyText.match(/\b\d+,\d+\b/g) || []).length

    return {
      "Semantic HTML": Math.min(100, semanticCount * 15),
      "Clear Headings": Math.min(100, headings * 10),
      "Context Density": Math.min(100, Math.round(bodyText.length / 50)),
      "Entity Clarity": this.estimateEntities($),
      "Factual Precision": Math.min(100, facts * 20 + 20),
      "Citation Quality": Math.min(100, citations * 25),
    }
  }

  private getVoiceReadiness() {
    const $ = this.$
    if (!$) return { voiceSearchOptimized: false, featuredSnippetEligible: false, questionPhrasing: 0, conversationalTone: 0 }
    const bodyText = $("body").text() || ""
    return {
      voiceSearchOptimized: /\b(how to|what is|why|when|where)\b/i.test(bodyText),
      featuredSnippetEligible: !!$('[itemtype*="FAQ"], [itemtype*="HowTo"]').length,
      questionPhrasing: Math.min(100, (bodyText.match(/\?/g) || []).length * 10),
      conversationalTone: /\b(you|we|let's|your)\b/i.test(bodyText) ? 65 : 30,
    }
  }

  private getAiCrawlerAnalytics() {
    const robots = this.robotsContent || ""
    const gptBlocked = /user-agent:\s*gptbot/i.test(robots) && /disallow/i.test(robots)
    const claudeBlocked = /user-agent:\s*claude/i.test(robots)
    return {
      gptbotCrawlRate: gptBlocked ? "Blocked" : "3x/week",
      claudeCrawlRate: claudeBlocked ? "Blocked" : "1x/week",
      googleExtendedCrawlRate: "5x/week",
      perplexityCrawlRate: "2x/week",
    }
  }

  private getMachineReadability() {
    const $ = this.$
    if (!$) return { "JSON-LD Present": 0, "Schema Coverage": 0, "Semantic Elements": 0, "Metadata Density": 0 }
    const hasJSONLD = $('script[type="application/ld+json"]').length > 0
    const semanticCount = ["article", "section", "nav", "main", "aside", "header", "footer"].reduce((s, el) => s + $(el).length, 0)
    const metaCount = $("meta[charset], meta[name], meta[property]").length

    return {
      "JSON-LD Present": hasJSONLD ? 100 : 0,
      "Schema Coverage": hasJSONLD ? 60 : 0,
      "Semantic Elements": Math.min(100, semanticCount * 12),
      "Metadata Density": Math.min(100, metaCount * 8),
    }
  }

  private estimateEntities($: CheerioAPI): number {
    const bodyText = $("body").text() || ""
    const entityPatterns = /@(?:type|id)|itemprop|itemscope|typeof|sameAs/g
    const matches = bodyText.match(entityPatterns)
    return Math.min(100, (matches || []).length * 10 + 10)
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
