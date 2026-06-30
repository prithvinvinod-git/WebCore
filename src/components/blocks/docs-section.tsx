import { Shield, Search, Zap, Brain, ArrowRight, Check, Globe, Lock, Gauge, BarChart3, Cpu, Layers, Code, Cloud, Eye, FileText } from "lucide-react"

const fadeInUp = "opacity-0 animate-fade-in-up"

const features = [
  {
    icon: Lock,
    title: "150+ Security Checks",
    desc: "CVE scanning, TLS config, secret leak detection, headers audit, and more.",
    color: "text-[#ea580c]",
    bg: "bg-[#ea580c]/10"
  },
  {
    icon: Globe,
    title: "Domain Health",
    desc: "DNS records, email security, SSL certs, redirect chains, domain age.",
    color: "text-[#3b82f6]",
    bg: "bg-[#3b82f6]/10"
  },
  {
    icon: Search,
    title: "SEO & AEO",
    desc: "80+ SEO checks, 60+ AEO checks, AI crawler analysis, voice search readiness.",
    color: "text-[#16a34a]",
    bg: "bg-[#16a34a]/10"
  },
  {
    icon: Gauge,
    title: "Performance",
    desc: "Core Web Vitals, load time breakdown, optimization scores, resource analysis.",
    color: "text-[#ea580c]",
    bg: "bg-[#ea580c]/10"
  },
  {
    icon: Brain,
    title: "AI Readiness",
    desc: "LLM-friendliness, structured data, machine readability, semantic markup.",
    color: "text-[#7c3aed]",
    bg: "bg-[#7c3aed]/10"
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    desc: "Comprehensive PDF/JSON reports, historical trends, comparison tools.",
    color: "text-[#06b6d4]",
    bg: "bg-[#06b6d4]/10"
  }
]

const steps = [
  {
    step: "01",
    title: "Enter URL",
    desc: "Paste any website URL into the scanner. No sign-up required for basic scans.",
    icon: FileText
  },
  {
    step: "02",
    title: "Deep Scan",
    desc: "Our engine runs 300+ checks across security, performance, SEO, domain health, and AI readiness.",
    icon: Cpu
  },
  {
    step: "03",
    title: "Get Report",
    desc: "Receive a comprehensive diagnostic report with actionable recommendations and scores.",
    icon: Eye
  },
  {
    step: "04",
    title: "Monitor & Improve",
    desc: "Set up monitoring to track changes over time, compare with competitors, and export reports.",
    icon: BarChart3
  }
]

const techItems = [
  { icon: Code, label: "Next.js 15", desc: "App Router, Server Components, API routes" },
  { icon: Layers, label: "React 19", desc: "Server & client components, hooks" },
  { icon: Cloud, label: "Firebase", desc: "Auth, Firestore, hosting" },
  { icon: Shield, label: "Scanner Engine", desc: "Custom Node.js scanner, 300+ checks" },
  { icon: Zap, label: "Tailwind CSS v4", desc: "Utility-first styling, design tokens" },
  { icon: Globe, label: "Vercel", desc: "Deployment, serverless functions, cron jobs" },
]

export function DocsSection() {
  return (
    <section id="docs" className="py-20 md:py-32 bg-white dark:bg-black">
      <div className="mx-auto max-w-6xl px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0a0a0a] dark:text-white tracking-tight opacity-0 animate-fade-in-up [animation-delay:0.1s]">
            Everything You Need to Know
          </h2>
          <p className="mt-3 text-[#7a7676] dark:text-neutral-400 text-base sm:text-lg leading-relaxed opacity-0 animate-fade-in-up [animation-delay:0.2s]">
            WebCore is a comprehensive website diagnostic platform. Here&apos;s how it works and what powers it.
          </p>
        </div>

        {/* Features */}
        <div className="mb-24">
          <h3 className="text-xl font-semibold text-[#0a0a0a] dark:text-white mb-8 flex items-center gap-2 opacity-0 animate-fade-in-up">
            <Check size={20} className="text-[#16a34a]" />
            Features
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`rounded-xl border border-[#e5e5e5] dark:border-neutral-800 p-5 hover:border-[#d0d0d0] dark:hover:border-neutral-700 transition-colors ${fadeInUp}`}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <div className={`size-10 rounded-lg ${f.bg} flex items-center justify-center mb-3`}>
                  <f.icon size={18} className={f.color} />
                </div>
                <h4 className="font-semibold text-[#0a0a0a] dark:text-white text-sm">{f.title}</h4>
                <p className="text-xs text-[#7a7676] dark:text-neutral-400 mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h3 className="text-xl font-semibold text-[#0a0a0a] dark:text-white mb-8 flex items-center gap-2 opacity-0 animate-fade-in-up">
            <Cpu size={20} className="text-[#7c3aed]" />
            How It Works
          </h3>
          <div className="relative">
            <div className="absolute left-[23px] top-0 bottom-0 w-px bg-[#e5e5e5] dark:bg-neutral-800 hidden sm:block" />
            <div className="space-y-8">
              {steps.map((s, i) => (
                <div key={s.step} className={`relative flex items-start gap-5 ${fadeInUp}`} style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                  <div className="relative z-10 size-[46px] shrink-0 rounded-full border border-[#e5e5e5] dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center justify-center">
                    <span className="text-xs font-bold text-[#7c3aed]">{s.step}</span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <s.icon size={16} className="text-[#7a7676] dark:text-neutral-400" />
                      <h4 className="font-semibold text-[#0a0a0a] dark:text-white text-sm">{s.title}</h4>
                    </div>
                    <p className="text-xs text-[#7a7676] dark:text-neutral-400 mt-1 leading-relaxed max-w-lg">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="text-xl font-semibold text-[#0a0a0a] dark:text-white mb-8 flex items-center gap-2 opacity-0 animate-fade-in-up">
            <Layers size={20} className="text-[#06b6d4]" />
            Tech Stack
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techItems.map((t, i) => (
              <div
                key={t.label}
                className={`rounded-xl border border-[#e5e5e5] dark:border-neutral-800 p-4 flex items-start gap-3 hover:border-[#d0d0d0] dark:hover:border-neutral-700 transition-colors ${fadeInUp}`}
                style={{ animationDelay: `${0.1 + i * 0.05}s` }}
              >
                <div className="size-9 rounded-lg bg-[#f5f5f5] dark:bg-neutral-800 flex items-center justify-center shrink-0">
                  <t.icon size={16} className="text-[#0a0a0a] dark:text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#0a0a0a] dark:text-white text-sm">{t.label}</h4>
                  <p className="text-xs text-[#7a7676] dark:text-neutral-400 mt-0.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className={`mt-16 text-center ${fadeInUp}`} style={{ animationDelay: '0.6s' }}>
          <p className="text-sm text-[#7a7676] dark:text-neutral-400 mb-4">Ready to scan your website?</p>
          <a
            href="/dashboard/new"
            className="inline-flex items-center gap-2 bg-[#8A2BE2] hover:bg-[#7B2D8E] text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Get Started
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  )
}
