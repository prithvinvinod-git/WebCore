import type { ScanResult } from "@/types/scan"
import { SecurityScanner } from "@/scanner/modules/security"
import { SeoScanner } from "@/scanner/modules/seo"
import { AeoScanner } from "@/scanner/modules/aeo"
import { PerformanceScanner } from "@/scanner/modules/performance"
import { IndexingScanner } from "@/scanner/modules/indexing"
import { AIReadinessScanner } from "@/scanner/modules/ai-readiness"
import { DomainHealthScanner } from "@/scanner/modules/domain-health"
import { AccessibilityScanner } from "@/scanner/modules/accessibility"
import { getGrade } from "@/lib/constants"

interface ScanConfig {
  url: string
  modules?: string[]
}

export class ScanOrchestrator {
  async runFullScan(config: ScanConfig): Promise<ScanResult> {
    const startTime = Date.now()
    const { hostname } = new URL(config.url)

    const input = { url: config.url, hostname }

    const scanners = {
      security: new SecurityScanner(),
      seo: new SeoScanner(),
      aeo: new AeoScanner(),
      performance: new PerformanceScanner(),
      indexing: new IndexingScanner(),
      aiReadiness: new AIReadinessScanner(),
      domain: new DomainHealthScanner(),
      accessibility: new AccessibilityScanner(),
    }

    const settled = await Promise.allSettled([
      scanners.security.scan(input),
      scanners.seo.scan(input),
      scanners.aeo.scan(input),
      scanners.performance.scan(input),
      scanners.indexing.scan(input),
      scanners.aiReadiness.scan(input),
      scanners.domain.scan(input),
      scanners.accessibility.scan(input),
    ])

    const defaultModule = { score: 0, grade: "N/A", findings: [] }

    function extract<T>(result: PromiseSettledResult<T>, fallback: T): T {
      return result.status === "fulfilled" ? result.value : fallback
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const security: any = extract(settled[0], { ...defaultModule, headers: {}, tlsConfig: { valid: false, daysRemaining: 0, protocol: "", cipherStrength: "", hsts: false }, cves: [], secrets: [], baasFindings: [] })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seo: any = extract(settled[1], { ...defaultModule, indexability: {}, onPage: {}, technical: {}, structuredData: { types: [], validCount: 0, invalidCount: 0 }, cwvData: { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0 } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aeo: any = extract(settled[2], { ...defaultModule, crawlerAccess: [], extractability: {}, structuredDataDepth: {}, trustSignals: { citedBy: 0, contentFreshness: "", authorEeats: 0 }, engineMatrix: {} })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const performance: any = extract(settled[3], { ...defaultModule, lighthouse: { mobile: {}, desktop: {} } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const indexing: any = extract(settled[4], { ...defaultModule, indexedCount: 0, crawlStats: {}, sitemapHealth: { valid: false, urlCount: 0, errors: [], lastModified: "" }, robotsHealth: { valid: false, blockedResources: [], sitemapRefs: [], aiCrawlerRules: 0 }, spaRendering: {} })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiReadiness: any = extract(settled[5], { ...defaultModule, llmFriendly: {}, voiceReadiness: {}, aiCrawlerAnalytics: {}, machineReadability: {} })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const domain: any = extract(settled[6], { ...defaultModule, dns: { hasA: false, hasAAAA: false, hasCname: false, hasMx: false, hasTxt: false, hasNs: false, dnssec: false }, email: { spf: false, dkim: false, dmarc: "", bimi: false }, uptime: { statusCode: 0, responseTimeMs: 0, isUp: false }, redirects: { chain: [], loops: false, tooMany: false }, certInfo: { valid: false, issuer: "", daysRemaining: 0 } })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessibility: any = extract(settled[7], { ...defaultModule, wcagChecks: [], screenReader: { optimal: false, issuesFound: 0, allImagesLabelled: false, headingStructure: false, ariaLive: false, keyboardNavigable: false }, contrast: { passed: false, failingElements: [], recommendations: [], smallTextRatio: "", largeTextRatio: "" }, autoAudit: { passed: 0, failed: 0, total: 0 } })

    const scores = [security.score, seo.score, aeo.score, performance.score, indexing.score, aiReadiness.score, domain.score, accessibility.score]
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const grade = getGrade(overallScore)

    return {
      id: crypto.randomUUID(),
      url: config.url,
      status: "complete",
      createdAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      overallScore,
      overallGrade: grade.grade,
      security,
      seo,
      aeo,
      performance,
      indexing,
      aiReadiness,
      domain,
      accessibility,
    }
  }
}

export async function scanUrl(url: string): Promise<ScanResult> {
  const orchestrator = new ScanOrchestrator()
  return orchestrator.runFullScan({ url })
}
