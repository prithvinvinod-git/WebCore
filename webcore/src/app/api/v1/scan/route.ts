import { NextRequest, NextResponse } from "next/server"
import { scanUrl } from "@/scanner/pipeline/orchestrator"
import { createScan, getScan, getScans } from "@/lib/firestore-service"
import type { ScanResult } from "@/types/scan"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { url } = body

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 })
  }

  const session = request.cookies.get("__session")?.value
  let userId: string | undefined
  if (session) {
    try { userId = JSON.parse(session).email } catch { /* ignore */ }
  }

  const result = await scanUrl(url)
  result.id = crypto.randomUUID()
  result.createdAt = new Date().toISOString()

  try {
    await createScan(result, userId)
  } catch (e) {
    console.error("Firestore write failed:", e)
  }

  return NextResponse.json(result)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const limit = parseInt(searchParams.get("limit") || "10")

  const session = request.cookies.get("__session")?.value
  let userId: string | undefined
  if (session) {
    try { userId = JSON.parse(session).email } catch { /* ignore */ }
  }

  if (id) {
    const scan = await getScan(id)
    if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    return NextResponse.json(scan)
  }

  const scans = await getScans(limit, userId)
  return NextResponse.json({ scans })
}
