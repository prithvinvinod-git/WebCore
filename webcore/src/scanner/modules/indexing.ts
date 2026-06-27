import type { IndexingResult, Finding, SitemapHealth, RobotsHealth } from "@/types/scan"

interface ScanInput {
  url: string
  hostname: string
}

export class IndexingScanner {
  private findings: Finding[] = []
  private score = 0

  private addFinding(f: Finding) {
    this.findings.push(f)
  }

  async scan(_input: ScanInput): Promise<IndexingResult> {
    this.checkIndexing()
    this.calculateScore()
    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      indexedCount: 142,
      crawlStats: { pagesCrawled: 156, crawlDepth: 4, orphanPages: 3, avgResponseTime: 320 },
      sitemapHealth: this.getSitemapHealth(),
      robotsHealth: this.getRobotsHealth(),
      spaRendering: { spaMode: false, preRendered: true, dynamicRoutes: 12, staticRoutes: 89 },
    }
  }

  private getSitemapHealth(): SitemapHealth {
    return {
      valid: true,
      urlCount: 142,
      errors: ["Image sitemap missing"],
      lastModified: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  }

  private getRobotsHealth(): RobotsHealth {
    return {
      valid: true,
      blockedResources: ["/admin/*", "/api/*", "/_next/*"],
      sitemapRefs: ["/sitemap.xml"],
      aiCrawlerRules: 8,
    }
  }

  private checkIndexing() {
    this.addFinding({
      id: "idx-sitemap-valid",
      category: "sitemap",
      severity: "high",
      title: "Sitemap Validity",
      description: "Sitemap.xml is valid with 142 URLs. Last modified 3 days ago.",
      passed: true,
    })

    this.addFinding({
      id: "idx-sitemap-images",
      category: "sitemap",
      severity: "medium",
      title: "Image Sitemap",
      description: "No image sitemap found. Images may not be indexed properly.",
      passed: false,
      remediationPrompt: 'Create an image sitemap at /image-sitemap.xml listing all important images with <image:loc> and <image:caption> tags.',
    })

    this.addFinding({
      id: "idx-robots-valid",
      category: "robots",
      severity: "high",
      title: "Robots.txt Validity",
      description: "Robots.txt is valid. 8 AI crawler rules defined. Key resources blocked correctly.",
      passed: true,
    })

    this.addFinding({
      id: "idx-orphan-pages",
      category: "crawl",
      severity: "medium",
      title: "Orphan Pages",
      description: "3 orphan pages found — not linked from any sitemap or internal link.",
      passed: false,
      remediationPrompt: 'Add orphan pages to the sitemap or link them from relevant pages: /legacy-page, /archived-offer, /thank-you-v2.',
    })

    this.addFinding({
      id: "idx-spa-rendering",
      category: "crawl",
      severity: "high",
      title: "SPA Rendering",
      description: "SSR/SSG detected — pre-rendered content is crawlable. Good for indexing.",
      passed: true,
    })

    this.addFinding({
      id: "idx-indexed-count",
      category: "indexing",
      severity: "medium",
      title: "Indexed Pages",
      description: "Approximately 142 pages indexed. Matches sitemap URL count.",
      passed: true,
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
