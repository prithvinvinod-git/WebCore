import { NextRequest, NextResponse } from "next/server"
import { getScans } from "@/lib/firestore-service"
import { getUserId } from "@/lib/session"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "100")
  const userId = await getUserId()
  const scans = await getScans(limit, userId)
  return NextResponse.json({ scans, total: scans.length })
}
