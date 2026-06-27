import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Globe, Search, BarChart3, BookOpen, CreditCard } from "lucide-react"

const features = [
  {
    icon: Shield,
    label: "Security Audit",
    desc: "150+ security checks, TLS config, CVE scanning, secret leak detection",
    accent: "text-[#ea580c]",
  },
  {
    icon: Search,
    label: "SEO & AEO",
    desc: "80+ SEO checks, 60+ AEO checks, AI crawler analysis, structured data",
    accent: "text-[#16a34a]",
  },
  {
    icon: Globe,
    label: "Domain Health",
    desc: "DNS, email security, SSL certs, uptime monitoring, redirect chains",
    accent: "text-[#7c3aed]",
  },
  {
    icon: BarChart3,
    label: "AI Readiness",
    desc: "LLM-friendliness, voice search readiness, machine readability scoring",
    accent: "text-[#3b82f6]",
  },
]

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

        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-[#e5e5e5] bg-white p-5"
              >
                <f.icon size={20} className={f.accent} />
                <h3 className="text-sm font-semibold text-[#0a0a0a] mt-3">
                  {f.label}
                </h3>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
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
