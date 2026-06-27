"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, SITE_NAME } from "@/lib/constants"
import { Shield, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

export function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    await fetch("/api/v1/auth/session", { method: "DELETE" })
    router.push("/")
  }

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "JD"

  return (
    <nav className="border-b border-[#e5e5e5] bg-white">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield size={22} className="text-[#0a0a0a]" />
          <span className="font-inter text-base font-semibold text-[#0a0a0a]">{SITE_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                pathname === link.href || pathname.startsWith(link.href + "/")
                  ? "text-[#0a0a0a] bg-[#f5f5f5]"
                  : "text-[#737373] hover:text-[#0a0a0a]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center text-xs font-medium text-[#525252] hover:bg-[#e5e5e5] transition-colors"
              >
                {initials}
              </button>
              {open && (
                <div className="absolute right-0 top-9 w-48 bg-white border border-[#e5e5e5] rounded-xl shadow-lg p-1 z-50">
                  <div className="px-3 py-2 border-b border-[#e5e5e5]">
                    <p className="text-xs font-medium text-[#0a0a0a] truncate">{user.displayName || user.email}</p>
                    <p className="text-[10px] text-[#737373] truncate">{user.email}</p>
                  </div>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#525252] hover:bg-[#f5f5f5] rounded-lg">
                    <Settings size={12} />
                    Settings
                  </Link>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#dc2626] hover:bg-[#fef2f2] rounded-lg">
                    <LogOut size={12} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="text-sm font-medium text-[#0a0a0a] hover:text-[#525252]">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
