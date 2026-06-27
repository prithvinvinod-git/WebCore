import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const response = NextResponse.json({ success: true })
  response.cookies.set("__session", JSON.stringify({ email: body.email, provider: body.provider || "email", name: body.name || "" }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
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
