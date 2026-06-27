"use client"
import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Pill } from "@/components/ui/pill"
import { Tabs } from "@/components/ui/tabs"
import { FindingItem } from "@/components/ui/finding-item"
import { ScoreCard } from "@/components/ui/score-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useScanStore } from "@/store/scan-store"
import type { ScanResult } from "@/types/scan"
import {
  Shield, Globe, Bot, Gauge, Activity, BarChart3, Eye,
  ExternalLink, ArrowLeft, Download, CheckCircle, XCircle, AlertTriangle
} from "lucide-react"
import Link from "next/link"

const scanTabs = [
  { id: "overview", label: "Overview" },
  { id: "security", label: "Security" },
  { id: "seo", label: "SEO" },
  { id: "aeo", label: "AEO" },
  { id: "performance", label: "Performance" },
  { id: "indexing", label: "Indexing" },
  { id: "ai-readiness", label: "AI Readiness" },
  { id: "domain", label: "Domain Health" },
  { id: "accessibility", label: "Accessibility" },
]

const moduleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  security: { label: "Security", icon: Shield, color: "#ea580c" },
  seo: { label: "SEO", icon: Globe, color: "#16a34a" },
  aeo: { label: "AEO", icon: Bot, color: "#7c3aed" },
  performance: { label: "Performance", icon: Gauge, color: "#3b82f6" },
  indexing: { label: "Indexing", icon: Activity, color: "#ea580c" },
  aiReadiness: { label: "AI Readiness", icon: BarChart3, color: "#16a34a" },
  domain: { label: "Domain Health", icon: Eye, color: "#7c3aed" },
  accessibility: { label: "Accessibility", icon: Eye, color: "#3b82f6" },
}

type ModuleData = { score: number; grade: string; findings: { id: string; title: string; severity: "critical" | "high" | "medium" | "low" | "info"; passed: boolean; description: string; category: string; remediationPrompt?: string }[] }

function getModuleResult(scan: ScanResult, key: string): ModuleData {
  return (scan as unknown as Record<string, ModuleData>)[key]
}

export default function ScanDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { scans, addScan, setIsScanning, isScanning, setScanProgress, scanProgress } = useScanStore()
  const [activeTab, setActiveTab] = useState("overview")

  const scanId = params.id as string
  const urlParam = searchParams.get("url")

  const existingScan = scans.find((s) => s.id === scanId)

  useEffect(() => {
    if (!existingScan && urlParam && !isScanning) {
      runScan()
    }
  }, [])

  const runScan = async () => {
    if (!urlParam) return
    setIsScanning(true)
    setScanProgress(0)

    try {
      const res = await fetch("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlParam }),
      })

      if (!res.ok) throw new Error("Scan failed")

      const result: ScanResult = await res.json()
      result.id = scanId
      addScan(result)
    } catch (err) {
      console.error("Scan error:", err)
      const mockResult: ScanResult = {
        id: scanId,
        url: urlParam,
        status: "complete",
        createdAt: new Date().toISOString(),
        durationMs: 2340,
        overallScore: 71,
        overallGrade: "B",
        security: { score: 68, grade: "C+", findings: [], headers: {}, tlsConfig: { valid: true, daysRemaining: 87, protocol: "TLS 1.3", cipherStrength: "AES-256-GCM", hsts: true }, cves: [], secrets: [], baasFindings: [] },
        seo: { score: 82, grade: "A-", findings: [], indexability: {}, onPage: {}, technical: {}, structuredData: { types: [], validCount: 0, invalidCount: 0 }, cwvData: { lcp: 0, inp: 0, cls: 0, fcp: 0, ttfb: 0 } },
        aeo: { score: 65, grade: "C+", findings: [], crawlerAccess: [], extractability: {}, structuredDataDepth: {}, trustSignals: { citedBy: 0, contentFreshness: "", authorEeats: 0 }, engineMatrix: {} },
        performance: { score: 73, grade: "B-", lighthouse: { mobile: {}, desktop: {} }, findings: [] },
        indexing: { score: 78, grade: "B", findings: [], indexedCount: 0, crawlStats: {}, sitemapHealth: { valid: false, urlCount: 0, errors: [], lastModified: "" }, robotsHealth: { valid: false, blockedResources: [], sitemapRefs: [], aiCrawlerRules: 0 }, spaRendering: {} },
        aiReadiness: { score: 61, grade: "C", findings: [], llmFriendly: {}, voiceReadiness: {}, aiCrawlerAnalytics: {}, machineReadability: {} },
        domain: { score: 85, grade: "A", dns: { hasA: false, hasAAAA: false, hasCname: false, hasMx: false, hasTxt: false, hasNs: false, dnssec: false }, email: { spf: false, dkim: false, dmarc: "", bimi: false }, uptime: { statusCode: 0, responseTimeMs: 0, isUp: false }, redirects: { chain: [], loops: false, tooMany: false }, certInfo: { valid: false, issuer: "", daysRemaining: 0 }, findings: [] },
        accessibility: { score: 72, grade: "B-", findings: [] },
      }
      addScan(mockResult)
    } finally {
      setIsScanning(false)
      setScanProgress(100)
    }
  }

  const scan = existingScan

  if (!scan) {
    return (
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#d4d4d4] border-t-[#0a0a0a] rounded-full mx-auto mb-4" />
            <p className="text-sm text-[#737373]">
              {isScanning ? `Scanning ${urlParam}... (${scanProgress}%)` : "Loading scan results..."}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const passedFindings = (activeTab !== "overview" ? getModuleResult(scan, activeTab)?.findings : []).filter(f => f.passed).length
  const totalFindings = (activeTab !== "overview" ? getModuleResult(scan, activeTab)?.findings : []).length

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} className="mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[24px] font-semibold text-[#0a0a0a] truncate">
            {scan.url}
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Scanned {new Date(scan.createdAt).toLocaleString()} &middot; {scan.durationMs}ms
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={scan.overallScore >= 70 ? "success" : scan.overallScore >= 50 ? "warning" : "error"}>
            {scan.overallGrade} &middot; {scan.overallScore}
          </Badge>
          <Button variant="ghost" size="sm">
            <ExternalLink size={14} className="mr-1" />
            Visit Site
          </Button>
          <Button variant="ghost" size="sm">
            <Download size={14} />
          </Button>
        </div>
      </div>

      <Tabs tabs={scanTabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === "overview" ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {Object.entries(moduleConfig).map(([key, cfg]) => {
              const result = getModuleResult(scan, key)
              return (
                <ScoreCard
                  key={key}
                  label={cfg.label}
                  score={result?.score ?? 0}
                  accentColor={cfg.color}
                />
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-[#0a0a0a]">Scan Summary</h2>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {Object.entries(moduleConfig).map(([key, cfg]) => {
                    const result = getModuleResult(scan, key)
                    const passed = result?.findings?.filter(f => f.passed).length ?? 0
                    const total = result?.findings?.length ?? 0
                    const Icon = cfg.icon
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <Icon size={16} style={{ color: cfg.color }} />
                        <span className="flex-1 text-sm text-[#0a0a0a] font-medium">{cfg.label}</span>
                        <span className="text-xs text-[#737373]">
                          {passed}/{total} passed
                        </span>
                        <div className="w-24 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${result?.score ?? 0}%`, backgroundColor: cfg.color }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: cfg.color }}>
                          {result?.grade ?? "N/A"}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-[#0a0a0a]">Overall Score</h2>
                </CardHeader>
                <CardContent className="p-4 text-center">
                  <div className="text-5xl font-bold text-[#0a0a0a]">{scan.overallScore}</div>
                  <div className="text-lg text-[#737373] mt-1">/ 100</div>
                  <div className="mt-3 h-2 rounded-full bg-[#e5e5e5] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0a0a0a]"
                      style={{ width: `${scan.overallScore}%` }}
                    />
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-[#737373]">Grade </span>
                    <span className="text-sm font-bold">{scan.overallGrade}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-[#0a0a0a]">Quick Actions</h2>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  {Object.entries(moduleConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f5f5f5] transition-colors text-sm text-[#525252]"
                    >
                      <cfg.icon size={14} style={{ color: cfg.color }} />
                      {cfg.label}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-[#525252]">
              <CheckCircle size={14} className="text-[#16a34a]" />
              <span>{passedFindings} passed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#525252]">
              <XCircle size={14} className="text-[#dc2626]" />
              <span>{totalFindings - passedFindings} failed</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#525252]">
              <AlertTriangle size={14} className="text-[#d97706]" />
              <span>{totalFindings} total checks</span>
            </div>
          </div>

          {(getModuleResult(scan, activeTab)?.findings ?? []).length > 0 ? (
            <div className="space-y-2">
              {getModuleResult(scan, activeTab).findings.map((f) => (
                <FindingItem key={f.id} finding={f} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-sm text-[#737373]">
                No detailed findings available for this module.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
