import { NextRequest, NextResponse } from "next/server"
import { createApiKey, getApiKeys, deleteApiKey } from "@/lib/firestore-service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const keys = await getApiKeys(session.uid)
  return NextResponse.json({ keys })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
  const key = await createApiKey(session.uid, name)
  return NextResponse.json({ key })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { keyId } = await request.json()
  if (!keyId) return NextResponse.json({ error: "keyId required" }, { status: 400 })
  await deleteApiKey(session.uid, keyId)
  return NextResponse.json({ success: true })
}

