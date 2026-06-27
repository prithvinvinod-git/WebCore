import { NextRequest, NextResponse } from "next/server"
import { getScan, deleteScan } from "@/lib/firestore-service"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scan = await getScan(id)
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })
  return NextResponse.json(scan)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteScan(id)
  return NextResponse.json({ success: true })
}
