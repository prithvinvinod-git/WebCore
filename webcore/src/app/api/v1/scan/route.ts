import { NextRequest, NextResponse } from "next/server"
import { ScanOrchestrator } from "@/scanner/pipeline/orchestrator"
import { createScan, getScans, getScan } from "@/lib/firestore-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, modules } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const orchestrator = new ScanOrchestrator()
    const result = await orchestrator.runFullScan({ url, modules })

    await createScan(result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error("Scan failed:", error)
    return NextResponse.json(
      { error: "Scan failed to complete", details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100)
  const id = searchParams.get("id")

  if (id) {
    const scan = await getScan(id)
    if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    return NextResponse.json(scan)
  }

  const scans = await getScans(limit)
  return NextResponse.json(scans)
}
