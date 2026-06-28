export const SITE_NAME = "WebCore"
export const SITE_TAGLINE = "Your Website's Complete Diagnostic Brain — Security, Visibility, Performance, AI Readiness."

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Scans", href: "/dashboard/history" },
  { label: "Monitor", href: "/dashboard/monitor" },
  { label: "Benchmark", href: "/dashboard/benchmark" },
  { label: "Settings", href: "/dashboard/settings" },
] as const

export const SCORE_GRADES = [
  { min: 90, grade: "A+", color: "text-pulse-green" },
  { min: 85, grade: "A", color: "text-pulse-green" },
  { min: 80, grade: "A-", color: "text-pulse-green" },
  { min: 75, grade: "B+", color: "text-circuit-blue" },
  { min: 70, grade: "B", color: "text-circuit-blue" },
  { min: 65, grade: "B-", color: "text-circuit-blue" },
  { min: 60, grade: "C+", color: "text-ember-orange" },
  { min: 50, grade: "C", color: "text-ember-orange" },
  { min: 40, grade: "D", color: "text-ember-orange" },
  { min: 0, grade: "F", color: "text-red-600" },
] as const

export function getGrade(score: number): { grade: string; color: string } {
  for (const g of SCORE_GRADES) {
    if (score >= g.min) return { grade: g.grade, color: g.color }
  }
  return { grade: "F", color: "text-red-600" }
}

export const AI_CRAWLERS = [
  "GPTBot",
  "Claude-Web",
  "Google-Extended",
  "CCBot",
  "PerplexityBot",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "Amazonbot",
] as const

export const ENGINE_NAMES = [
  "chatgpt",
  "claude",
  "perplexity",
  "google_ai",
  "copilot",
  "meta_ai",
  "mistral",
  "grok",
] as const

export const MODULE_LABELS: Record<string, string> = {
  security: "Security",
  seo: "SEO",
  aeo: "AEO",
  performance: "Performance",
  indexing: "Indexing",
  aiReadiness: "AI Readiness",
  domain: "Domain Health",
  accessibility: "Accessibility",
}
