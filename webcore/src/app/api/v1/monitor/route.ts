import { NextRequest, NextResponse } from "next/server"
import { getMonitors, createMonitor, deleteMonitor } from "@/lib/firestore-service"
import type { MonitorConfig } from "@/types/scan"

export async function GET() {
  const monitors = await getMonitors()
  return NextResponse.json(monitors)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { scanId, url, uptimeInterval, scanSchedule, emailNotifications, alertWebhooks } = body

  if (!scanId || !url) {
    return NextResponse.json({ error: "scanId and url are required" }, { status: 400 })
  }

  const config: MonitorConfig & { scanId: string } = {
    scanId,
    uptimeInterval: uptimeInterval || 300,
    scanSchedule: scanSchedule || "weekly",
    emailNotifications: emailNotifications || false,
    alertWebhooks: alertWebhooks || [],
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
