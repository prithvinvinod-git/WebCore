import { NextRequest, NextResponse } from "next/server"
import { getScans } from "@/lib/firestore-service"
import { getUserId } from "@/lib/session"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") || "100")
  const userId = await getUserId()

  let scans
  try {
    scans = await getScans(limit, userId)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("getScans failed (trying fallback):", msg)
    try {
      scans = await getScans(limit, undefined)
    } catch (e2: unknown) {
      const msg2 = e2 instanceof Error ? e2.message : String(e2)
      console.error("getScans fallback also failed:", msg2)
      return NextResponse.json({ scans: [], total: 0, error: msg2 })
    }
  }

  return NextResponse.json({ scans, total: scans.length })
}

