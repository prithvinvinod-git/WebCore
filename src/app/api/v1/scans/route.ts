import { NextRequest, NextResponse } from "next/server"
import { getScans } from "@/lib/firestore-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "20")
  const userId = searchParams.get("userId") || undefined
  const scans = await getScans(limit, userId)
  return NextResponse.json({ scans, total: scans.length })
}
