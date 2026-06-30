import Link from "next/link"
import { Shield, Book, Shield as ShieldIcon, Globe, Bot, Gauge, BarChart3, Eye, Activity } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

const sections = [
  {
    title: "Getting Started",
    items: [
      { label: "What is WebCore?", href: "#what-is" },
      { label: "Quick start guide", href: "#quick-start" },
      { label: "Understanding scores", href: "#scores" },
    ],
  },
  {
    title: "Modules",
    items: [
      { label: "Security (150+ checks)", href: "#security" },
      { label: "SEO (80+ checks)", href: "#seo" },
      { label: "AEO (60+ checks)", href: "#aeo" },
      { label: "Performance", href: "#performance" },
      { label: "Indexing", href: "#indexing" },
      { label: "AI Readiness", href: "#ai-readiness" },
      { label: "Domain Health", href: "#domain" },
      { label: "Accessibility", href: "#accessibility" },
    ],
  },
  {
    title: "Features",
    items: [
      { label: "AI Remediation", href: "#ai-remediation" },
      { label: "Competitor Benchmarking", href: "#benchmarking" },
      { label: "Historical Trending", href: "#trending" },
      { label: "Monitoring & Alerts", href: "#monitoring" },
      { label: "Report Export", href: "#export" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "Authentication", href: "#api-auth" },
      { label: "Scan endpoints", href: "#api-scans" },
      { label: "Monitor endpoints", href: "#api-monitors" },
      { label: "Benchmark endpoint", href: "#api-benchmark" },
    ],
  },
]

const moduleIcons: Record<string, React.ElementType> = {
  security: ShieldIcon,
  seo: Globe,
  aeo: Bot,
  performance: Gauge,
  indexing: Activity,
  "ai-readiness": BarChart3,
  domain: Eye,
  accessibility: Eye,
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <nav className="border-b border-[#e5e5e5] dark:border-neutral-800 bg-white dark:bg-black">
        <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield size={22} className="text-[#0a0a0a] dark:text-white" />
            <span className="font-inter text-base font-semibold text-[#0a0a0a] dark:text-white">WebCore</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm font-medium text-[#737373] dark:text-neutral-400">Documentation</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto px-6 py-12 flex gap-8">
        <nav className="w-56 shrink-0">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider mb-2">{section.title}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="block text-sm text-[#525252] dark:text-neutral-300 hover:text-[#0a0a0a] dark:hover:text-white py-0.5">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex-1 min-w-0 prose prose-sm max-w-none">
          <h1 className="text-2xl font-semibold text-[#0a0a0a] dark:text-white" id="what-is">What is WebCore?</h1>
          <p className="text-sm text-[#525252] dark:text-neutral-300 leading-relaxed">
            WebCore is a comprehensive website diagnostic platform that analyzes your site across 8 critical dimensions.
            Enter any URL and get an instant, in-depth report with actionable remediation steps.
          </p>

          <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mt-10" id="quick-start">Quick Start</h2>
          <p className="text-sm text-[#525252] dark:text-neutral-300 leading-relaxed">
            1. Create a WebCore account<br />
            2. Enter the URL you want to analyze<br />
            3. Select which diagnostic modules to run<br />
            4. View your results with scores, grades, and findings<br />
            5. Use AI Remediation to get step-by-step fixes<br />
            6. Set up monitoring for ongoing checks
          </p>

          <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mt-10" id="scores">Understanding Scores</h2>
          <p className="text-sm text-[#525252] dark:text-neutral-300 leading-relaxed">
            Each module scores from 0-100. Grades follow the standard scale: A (90-100), B (80-89), C (70-79), D (60-69), F (below 60).
            The overall score is a weighted average of all module scores.
          </p>

          <h2 className="text-lg font-semibold text-[#0a0a0a] dark:text-white mt-10" id="api-auth">API Authentication</h2>
          <p className="text-sm text-[#525252] dark:text-neutral-300 leading-relaxed">
            Use your API key in the <code className="text-[10px] bg-[#f5f5f5] dark:bg-neutral-800 px-1 py-0.5 rounded">x-api-key</code> header.
            Keys are managed in your Settings page.
          </p>
        </div>
      </div>
    </div>
  )
}
