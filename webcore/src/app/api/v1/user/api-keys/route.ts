import { NextRequest, NextResponse } from "next/server"
import { createApiKey, getApiKeys, deleteApiKey } from "@/lib/firestore-service"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email } = JSON.parse(session)
  const keys = await getApiKeys(email)
  return NextResponse.json({ keys })
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email } = JSON.parse(session)
  const { name } = await request.json()
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 })
  const key = await createApiKey(email, name)
  return NextResponse.json({ key })
}

export async function DELETE(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email } = JSON.parse(session)
  const { keyId } = await request.json()
  if (!keyId) return NextResponse.json({ error: "keyId required" }, { status: 400 })
  await deleteApiKey(email, keyId)
  return NextResponse.json({ success: true })
}
