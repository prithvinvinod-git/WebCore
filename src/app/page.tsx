import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Scan } from "lucide-react"
import { Features } from "@/components/blocks/features-8"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={22} className="text-[#0a0a0a]" />
            <span className="font-medium text-base text-[#0a0a0a]">WebCore</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/docs" className="text-sm font-medium text-[#7a7676] hover:text-[#0a0a0a] transition-colors">Docs</Link>
            <Link href="/pricing" className="text-sm font-medium text-[#7a7676] hover:text-[#0a0a0a] transition-colors">Pricing</Link>
            <Link href="/auth/login" className="text-sm font-medium text-[#0a0a0a]">Sign in</Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-[1200px] mx-auto px-6 py-20 sm:py-32 text-center min-h-screen flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e5e5] bg-white px-3 py-1 text-xs font-medium text-[#7a7676] mx-auto mb-6">
            <Scan size={12} className="text-[#896f88]" />
            Website Diagnostic Platform
          </div>
          <h1 className="text-heading sm:text-heading-lg font-medium tracking-tight text-[#0a0a0a] max-w-3xl mx-auto leading-[1.15]">
            Your Website&apos;s Complete
            <br />
            Diagnostic Brain
          </h1>
          <p className="text-base sm:text-lg text-[#7a7676] max-w-2xl mx-auto mt-4 leading-relaxed">
            Security, Visibility, Performance, AI Readiness — all in one scan.
            Enter any URL and get a comprehensive diagnostic report in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dashboard/new">
              <Button size="lg">Scan Your Website</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-16 mx-auto max-w-4xl w-full rounded-xl border border-[#e5e5e5] bg-[#f5f5f5] overflow-hidden shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px]">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#e5e5e5] bg-white">
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="size-2 rounded-full bg-[#e5e5e5]" />
              <span className="ml-2 text-xs text-[#7a7676] font-mono">dashboard.webcore.dev</span>
            </div>
            <div className="p-6 sm:p-10 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
              <div className="text-center">
                <Shield size={32} className="mx-auto text-[#d4d4d4]" strokeWidth={1} />
                <p className="mt-3 text-sm text-[#a3a3a3] font-medium">Dashboard Preview</p>
                <p className="mt-1 text-xs text-[#c4c4c4]">Comprehensive scan results at a glance</p>
              </div>
            </div>
          </div>
        </section>

        <Features />
      </main>

      <Footer />
    </div>
  )
}
