import { NextRequest, NextResponse } from "next/server"
import { ScanOrchestrator } from "@/scanner/pipeline/orchestrator"

interface CompetitorResult {
  url: string
  scores: Record<string, number>
  overallScore: number
  overallGrade: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body as { urls: string[] }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: "Array of urls is required" }, { status: 400 })
    }

    if (urls.length > 10) {
      return NextResponse.json({ error: "Maximum 10 URLs allowed" }, { status: 400 })
    }

    for (const url of urls) {
      try { new URL(url) } catch {
        return NextResponse.json({ error: `Invalid URL: ${url}` }, { status: 400 })
      }
    }

    const orchestrator = new ScanOrchestrator()
    const results = await Promise.all(
      urls.map(async (url) => {
        const result = await orchestrator.runFullScan({ url })
        return {
          url: result.url,
          scores: {
            security: result.security.score,
            seo: result.seo.score,
            aeo: result.aeo.score,
            performance: result.performance.score,
            indexing: result.indexing.score,
            aiReadiness: result.aiReadiness.score,
            domain: result.domain.score,
            accessibility: result.accessibility.score,
          },
          overallScore: result.overallScore,
          overallGrade: result.overallGrade,
        } satisfies CompetitorResult
      })
    )

    results.sort((a, b) => b.overallScore - a.overallScore)

    const averages: Record<string, number> = {}
    const keys = Object.keys(results[0].scores) as (keyof typeof results[0]['scores'])[]
    for (const key of keys) {
      averages[key] = Math.round(results.reduce((sum, r) => sum + r.scores[key], 0) / results.length)
    }

    return NextResponse.json({ results, averages, totalCompared: results.length })
  } catch (error) {
    console.error("Benchmark failed:", error)
    return NextResponse.json({ error: "Benchmark failed", details: String(error) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send a POST with { urls: string[] } to benchmark up to 10 URLs",
    example: { urls: ["https://example.com", "https://competitor.com"] },
  })
}
