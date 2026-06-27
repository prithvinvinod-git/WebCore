"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV_LINKS, SITE_NAME } from "@/lib/constants"
import { Shield } from "lucide-react"

export function Nav() {
  const pathname = usePathname()

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
          <button className="w-7 h-7 rounded-full bg-[#f5f5f5] flex items-center justify-center text-xs font-medium text-[#525252]">
            JD
          </button>
        </div>
      </div>
    </nav>
  )
}
