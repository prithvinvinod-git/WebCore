import { NextRequest, NextResponse } from "next/server"
import { getScanFindings, getScan } from "@/lib/firestore-service"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scan = await getScan(id)
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })
  const findings = await getScanFindings(id)
  return NextResponse.json(findings)
}
