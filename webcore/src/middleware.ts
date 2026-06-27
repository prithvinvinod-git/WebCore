import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const protectedPaths = ["/dashboard"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected) {
    const token = request.cookies.get("__session")?.value
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith("/auth/") && request.cookies.get("__session")?.value) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
