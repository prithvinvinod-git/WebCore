import { NextResponse } from "next/server"
import { getMonitors, createScan } from "@/lib/firestore-service"
import { scanUrl } from "@/scanner/pipeline/orchestrator"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const monitors = await getMonitors()
    const weeklyMonitors = monitors.filter(
      (m) => (m as Record<string, unknown>).scanSchedule === "weekly"
    )
    const results: Array<{ monitorId: string; scanId: string; url: string }> = []
    for (const monitor of weeklyMonitors) {
      try {
        const m = monitor as unknown as { url: string; userId: string; id: string }
        const result = await scanUrl(m.url)
        await createScan(result, m.userId)
        results.push({ monitorId: m.id, scanId: result.id, url: m.url })
      } catch {
        continue
      }
    }
    return NextResponse.json({ ok: true, scanned: results.length, total: weeklyMonitors.length })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
