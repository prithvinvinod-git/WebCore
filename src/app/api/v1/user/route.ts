import { NextRequest, NextResponse } from "next/server"
import { getUser, createUser, updateUser } from "@/lib/firestore-service"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email } = JSON.parse(session)
  return NextResponse.json({ id: email, email })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { uid, email, name } = body
  if (!uid || !email) return NextResponse.json({ error: "uid and email required" }, { status: 400 })
  await createUser(uid, { email, name })
  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { email } = JSON.parse(session)
  const body = await request.json()
  await updateUser(email, body)
  return NextResponse.json({ success: true })
}
