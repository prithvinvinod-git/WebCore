import { NextRequest, NextResponse } from "next/server"
import { scanUrl } from "@/scanner/pipeline/orchestrator"
import { createScan, getScan, getScans } from "@/lib/firestore-service"
import { getUserId } from "@/lib/session"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 })
    }

    const userId = await getUserId()

    const result = await scanUrl(url)
    result.id = crypto.randomUUID()
    result.createdAt = new Date().toISOString()

    try {
      await createScan(result, userId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error("Firestore write failed:", msg)
      return NextResponse.json({ error: "Scan completed but database save failed: " + msg }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("POST /api/v1/scan error:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const limit = parseInt(searchParams.get("limit") || "100")

  const userId = await getUserId()

  if (id) {
    const scan = await getScan(id)
    if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    return NextResponse.json(scan)
  }

  let scans: import("@/types/scan").ScanResult[] = []
  try {
    scans = await getScans(limit, userId)
  } catch (e: unknown) {
    console.error("getScans failed (trying fallback):", e instanceof Error ? e.message : String(e))
    try {
      scans = await getScans(limit, undefined)
    } catch {
      scans = []
    }
  }
  return NextResponse.json({ scans })
}
