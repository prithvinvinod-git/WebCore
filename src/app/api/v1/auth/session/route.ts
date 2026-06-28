import { NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/firestore-service"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const uid = body.uid || body.email
  const response = NextResponse.json({ success: true })
  const session = {
    uid,
    email: body.email,
    provider: body.provider || "email",
    name: body.name || "",
  }
  response.cookies.set("__session", JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  try {
    await createUser(uid, { email: body.email, name: body.name, photoURL: body.photoURL })
  } catch {
    // user doc already exists or will be created on next login
  }
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set("__session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" })
  return response
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get("__session")?.value
  if (!session) return NextResponse.json({ user: null })
  try {
    return NextResponse.json({ user: JSON.parse(session) })
  } catch {
    return NextResponse.json({ user: null })
  }
}
