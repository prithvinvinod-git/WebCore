import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { getMonitors, createScan } from "@/lib/firestore-service"
import { scanUrl } from "@/scanner/pipeline/orchestrator"

export const runtime = "nodejs"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET() {
  const results: Record<string, unknown> = {
    health: null,
    dailyRescans: null,
    weeklyRescans: null,
    certCheck: null,
  }

  try {
    await db.collection("health").doc("check").get()
    results.health = "ok"
  } catch {
    results.health = "failed"
  }

  try {
    const monitors = await getMonitors()
    const dailyMonitors = monitors.filter(
      (m) => (m as Record<string, unknown>).scanSchedule === "daily"
    )
    const dailyResults: Array<{ monitorId: string; scanId: string; url: string }> = []
    for (const monitor of dailyMonitors) {
      try {
        const m = monitor as unknown as { url: string; userId: string; id: string }
        const result = await scanUrl(m.url)
        await createScan(result, m.userId)
        dailyResults.push({ monitorId: m.id, scanId: result.id, url: m.url })
      } catch {
        continue
      }
    }
    results.dailyRescans = { scanned: dailyResults.length, total: dailyMonitors.length }
  } catch (error) {
    results.dailyRescans = { error: String(error) }
  }

  const isMonday = new Date().getDay() === 1
  if (isMonday) {
    try {
      const monitors = await getMonitors()
      const weeklyMonitors = monitors.filter(
        (m) => (m as Record<string, unknown>).scanSchedule === "weekly"
      )
      const weeklyResults: Array<{ monitorId: string; scanId: string; url: string }> = []
      for (const monitor of weeklyMonitors) {
        try {
          const m = monitor as unknown as { url: string; userId: string; id: string }
          const result = await scanUrl(m.url)
          await createScan(result, m.userId)
          weeklyResults.push({ monitorId: m.id, scanId: result.id, url: m.url })
        } catch {
          continue
        }
      }
      results.weeklyRescans = { scanned: weeklyResults.length, total: weeklyMonitors.length }
    } catch (error) {
      results.weeklyRescans = { error: String(error) }
    }
  } else {
    results.weeklyRescans = "skipped (not Monday)"
  }

  try {
    const scansSnapshot = await db.collection("scans")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get()

    const expiring: Array<{ url: string; daysRemaining: number }> = []
    for (const doc of scansSnapshot.docs) {
      const data = doc.data()
      const domainResult = data.domain
      if (domainResult?.certInfo?.daysRemaining != null && domainResult.certInfo.daysRemaining < 30) {
        expiring.push({
          url: data.url,
          daysRemaining: domainResult.certInfo.daysRemaining,
        })
      }
    }
    results.certCheck = { checked: scansSnapshot.size, expiringSoon: expiring }
  } catch (error) {
    results.certCheck = { error: String(error) }
  }

  return NextResponse.json({ ok: true, results })
}

