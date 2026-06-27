import { NextRequest, NextResponse } from "next/server"
import { getMonitors, createMonitor, deleteMonitor, updateMonitor } from "@/lib/firestore-service"
import type { MonitorConfig } from "@/types/scan"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  let userId: string | undefined
  if (session) {
    try { userId = JSON.parse(session).email } catch { /* ignore */ }
  }
  const monitors = await getMonitors(userId)
  return NextResponse.json({ monitors })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { scanId, url, uptimeInterval, scanSchedule, emailNotifications, alertWebhooks } = body

  if (!scanId) {
    return NextResponse.json({ error: "scanId is required" }, { status: 400 })
  }

  const session = request.cookies.get("__session")?.value
  let userId: string | undefined
  if (session) {
    try { userId = JSON.parse(session).email } catch { /* ignore */ }
  }

  const config: MonitorConfig & { scanId: string; userId?: string } = {
    scanId,
    uptimeInterval: uptimeInterval || 300,
    scanSchedule: scanSchedule || "weekly",
    emailNotifications: emailNotifications || false,
    alertWebhooks: alertWebhooks || [],
    userId,
  }

  const monitor = await createMonitor(config)
  return NextResponse.json(monitor, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  await deleteMonitor(id)
  return NextResponse.json({ deleted: true })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
  await updateMonitor(id, data)
  return NextResponse.json({ success: true })
}
