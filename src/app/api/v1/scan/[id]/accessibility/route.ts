import { NextRequest, NextResponse } from "next/server"
import { AccessibilityScanner } from "@/scanner/modules/accessibility"
import { getScan } from "@/lib/firestore-service"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const scan = await getScan(id)
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })

  const scanner = new AccessibilityScanner()
  const result = await scanner.scan({ url: scan.url, hostname: new URL(scan.url).hostname })

  return NextResponse.json(result)
}
