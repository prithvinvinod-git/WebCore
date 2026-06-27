export interface ScanResult {
  id: string
  url: string
  status: "pending" | "running" | "complete" | "failed"
  createdAt: string
  durationMs: number
  overallScore: number
  overallGrade: string
  security: SecurityResult
  seo: SeoResult
  aeo: AeoResult
  performance: PerformanceResult
  indexing: IndexingResult
  aiReadiness: AIReadinessResult
  domain: DomainHealthResult
  accessibility: AccessibilityResult
}

export interface SecurityResult {
  score: number
  grade: string
  findings: Finding[]
  headers: Record<string, boolean>
  tlsConfig: TLSConfig
  cves: CVEItem[]
  secrets: SecretLeak[]
  baasFindings: BaaSFinding[]
}

export interface Finding {
  id: string
  category: string
  severity: "critical" | "high" | "medium" | "low" | "info"
  title: string
  description: string
  passed: boolean
  cvss?: number
  remediationPrompt?: string
}

export interface TLSConfig {
  valid: boolean
  daysRemaining: number
  protocol: string
  cipherStrength: string
  hsts: boolean
}

export interface CVEItem {
  id: string
  library: string
  version: string
  severity: "critical" | "high" | "medium" | "low"
  cvssScore: number
  description: string
}

export interface SecretLeak {
  type: string
  service: string
  file: string
  line: number
  riskLevel: "critical" | "high" | "medium" | "low"
  snippet: string
}

export interface BaaSFinding {
  service: string
  issue: string
  severity: string
  description: string
}

export interface SeoResult {
  score: number
  grade: string
  findings: Finding[]
  indexability: Record<string, unknown>
  onPage: Record<string, unknown>
  technical: Record<string, unknown>
  structuredData: StructuredDataInfo
  cwvData: CoreWebVitals
}

export interface StructuredDataInfo {
  types: string[]
  validCount: number
  invalidCount: number
}

export interface CoreWebVitals {
  lcp: number
  inp: number
  cls: number
  fcp: number
  ttfb: number
}

export interface AeoResult {
  score: number
  grade: string
  findings: Finding[]
  crawlerAccess: AICrawlerAccess[]
  extractability: Record<string, number>
  structuredDataDepth: Record<string, number>
  trustSignals: TrustSignals
  engineMatrix: Record<string, EngineScore>
}

export interface AICrawlerAccess {
  crawler: string
  allowed: boolean
  directive: string
}

export interface TrustSignals {
  citedBy: number
  contentFreshness: string
  authorEeats: number
}

export interface EngineScore {
  score: number
  recommendation: string
}

export interface PerformanceResult {
  score: number
  grade: string
  lighthouse: LighthouseData
  cruxFieldData?: CruxData
  findings: Finding[]
}

export interface LighthouseData {
  mobile: Record<string, number>
  desktop: Record<string, number>
}

export interface CruxData {
  origin?: Record<string, number>
  url?: Record<string, number>
}

export interface IndexingResult {
  score: number
  grade: string
  findings: Finding[]
  indexedCount: number
  crawlStats: Record<string, unknown>
  sitemapHealth: SitemapHealth
  robotsHealth: RobotsHealth
  spaRendering: Record<string, unknown>
}

export interface SitemapHealth {
  valid: boolean
  urlCount: number
  errors: string[]
  lastModified: string
}

export interface RobotsHealth {
  valid: boolean
  blockedResources: string[]
  sitemapRefs: string[]
  aiCrawlerRules: number
}

export interface AIReadinessResult {
  score: number
  grade: string
  findings: Finding[]
  llmFriendly: Record<string, number>
  voiceReadiness: Record<string, unknown>
  aiCrawlerAnalytics: Record<string, unknown>
  machineReadability: Record<string, number>
}

export interface DomainHealthResult {
  score: number
  grade: string
  dns: DNSCheck
  email: EmailSecurity
  uptime: UptimeInfo
  redirects: RedirectInfo
  certInfo: CertInfo
  findings: Finding[]
}

export interface DNSCheck {
  hasA: boolean
  hasAAAA: boolean
  hasCname: boolean
  hasMx: boolean
  hasTxt: boolean
  hasNs: boolean
  dnssec: boolean
}

export interface EmailSecurity {
  spf: boolean
  dkim: boolean
  dmarc: string
  bimi: boolean
}

export interface UptimeInfo {
  statusCode: number
  responseTimeMs: number
  isUp: boolean
}

export interface RedirectInfo {
  chain: string[]
  loops: boolean
  tooMany: boolean
}

export interface CertInfo {
  valid: boolean
  issuer: string
  daysRemaining: number
}

export interface WCAGCheck {
  category: string
  passed: number
  total: number
  score: number
  critical: number
}

export interface ScreenReaderCheck {
  optimal: boolean
  issuesFound: number
  allImagesLabelled: boolean
  headingStructure: boolean
  ariaLive: boolean
  keyboardNavigable: boolean
}

export interface ContrastCheck {
  passed: boolean
  failingElements: string[]
  recommendations: string[]
  smallTextRatio: string
  largeTextRatio: string
}

export interface AutoAudit {
  passed: number
  failed: number
  total: number
}

export interface AccessibilityResult {
  score: number
  grade: string
  findings: Finding[]
  wcagChecks: WCAGCheck[]
  screenReader: ScreenReaderCheck
  contrast: ContrastCheck
  autoAudit: AutoAudit
}

export interface MonitorConfig {
  scanId: string
  uptimeInterval: number
  scanSchedule: "daily" | "weekly"
  alertWebhooks: string[]
  emailNotifications: boolean
}

export interface BenchmarkResult {
  results: CompetitorResult[]
  averages: Record<string, number>
  totalCompared: number
}

export interface CompetitorResult {
  url: string
  scores: Record<string, number>
  overallScore: number
  overallGrade: string
}

export const ACCENT_COLORS: Record<string, string> = {
  security: "#ea580c",
  seo: "#16a34a",
  aeo: "#7c3aed",
  performance: "#3b82f6",
} as const

export const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-error-bg text-error-text",
  high: "bg-warning-bg text-warning-text",
  medium: "bg-smoke-50 text-smoke-600",
  low: "bg-smoke-50 text-smoke-400",
} as const
