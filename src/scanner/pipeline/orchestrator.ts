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

    const results = await Promise.all([
      scanners.security.scan(input),
      scanners.seo.scan(input),
      scanners.aeo.scan(input),
      scanners.performance.scan(input),
      scanners.indexing.scan(input),
      scanners.aiReadiness.scan(input),
      scanners.domain.scan(input),
      scanners.accessibility.scan(input),
    ])

    const [security, seo, aeo, performance, indexing, aiReadiness, domain, accessibility] = results

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
