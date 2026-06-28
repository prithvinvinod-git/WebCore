import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { Features } from "@/components/blocks/features-8"

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="border-b border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={22} className="text-[#0a0a0a]" />
            <span className="font-semibold text-base">WebCore</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-sm text-[#737373] hover:text-[#0a0a0a]">Docs</Link>
            <Link href="/pricing" className="text-sm text-[#737373] hover:text-[#0a0a0a]">Pricing</Link>
            <Link href="/auth/login" className="text-sm font-medium text-[#0a0a0a]">Sign in</Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-[1200px] mx-auto px-6 py-20 sm:py-32 text-center">
          <h1 className="text-heading sm:text-heading-lg font-semibold tracking-tight text-[#0a0a0a] max-w-3xl mx-auto leading-[1.1]">
            Your Website&apos;s Complete
            <br />
            Diagnostic Brain
          </h1>
          <p className="text-lg text-[#737373] max-w-2xl mx-auto mt-4 leading-relaxed">
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
        </section>

        <Features />
      </main>

      <footer className="border-t border-[#e5e5e5]">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex items-center justify-between text-xs text-[#737373]">
          <span>&copy; {new Date().getFullYear()} WebCore</span>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-[#0a0a0a]">Docs</Link>
            <Link href="/pricing" className="hover:text-[#0a0a0a]">Pricing</Link>
            <Link href="/auth/login" className="hover:text-[#0a0a0a]">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
