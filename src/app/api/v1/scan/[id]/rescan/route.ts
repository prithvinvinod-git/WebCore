import { NextRequest, NextResponse } from "next/server"
import { scanUrl } from "@/scanner/pipeline/orchestrator"
import { createScan } from "@/lib/firestore-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const url = body.url

  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

  const result = await scanUrl(url)
  result.id = id
  result.createdAt = new Date().toISOString()

  try {
    await createScan(result)
  } catch (e) {
    console.error("Firestore write failed during rescan:", e)
  }

  return NextResponse.json(result)
}
