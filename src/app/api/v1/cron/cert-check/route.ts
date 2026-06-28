import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { scanUrl } from "@/scanner/pipeline/orchestrator"

export const runtime = "nodejs"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET() {
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

    return NextResponse.json({
      ok: true,
      checked: scansSnapshot.size,
      expiringSoon: expiring,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

