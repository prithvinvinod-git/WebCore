import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"

export const runtime = "nodejs"

export async function GET() {
  const status: Record<string, unknown> = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  }

  try {
    await db.collection("health").doc("check").get()
    status.firestore = "connected"
  } catch {
    status.firestore = "disconnected"
    status.status = "degraded"
  }

  return NextResponse.json(status)
}

