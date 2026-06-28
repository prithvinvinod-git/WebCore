"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield } from "lucide-react"
import CreditsButton from "@/components/ui/credits-button"
import DocsLink from "@/components/ui/docs-link"

export default function LandingNav({ session }: { session: { uid: string } | null }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm transition-all duration-200 ease-out z-50 ${
        scrolled
          ? "top-[12px] w-[calc(100%-40px)] max-w-[1100px] rounded-xl border border-[#e5e5e5] shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
          : "top-0 w-[calc(100%)] rounded-none border-b border-[#e5e5e5]"
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield size={22} className="text-[#0a0a0a]" />
          <span className="font-medium text-base text-[#0a0a0a]">WebCore</span>
        </Link>
        <nav className="flex items-center gap-6">
          <DocsLink>Docs</DocsLink>
          <Link href="/pricing" className="text-sm font-medium text-[#7a7676] hover:text-[#0a0a0a] transition-colors">Pricing</Link>
          {session ? (
            <Link href="/dashboard" className="text-sm font-medium text-[#0a0a0a]">Dashboard</Link>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium text-[#0a0a0a]">Sign in</Link>
              <Link href="/auth/signup">
                <CreditsButton>Get started</CreditsButton>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
