import { NextRequest, NextResponse } from "next/server"
import { createUser, updateUser } from "@/lib/firestore-service"
import { getSession } from "@/lib/session"

export const runtime = "nodejs"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ id: session.uid, email: session.email })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { uid, email, name, photoURL } = body
  if (!uid || !email) return NextResponse.json({ error: "uid and email required" }, { status: 400 })
  await createUser(uid, { email, name, photoURL })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  await updateUser(session.uid, body)
  return NextResponse.json({ success: true })
}

