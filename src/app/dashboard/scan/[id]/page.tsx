"use client"
import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  const [notFound, setNotFound] = useState(false)

  const scanId = params.id as string
  const urlParam = searchParams.get("url")

  const scan = scans.find((s) => s.id === scanId)

  const fetchedRef = useRef(false)

  useEffect(() => {
    if (scan || fetchedRef.current) return
    fetchedRef.current = true

    if (urlParam) {
      setIsScanning(true)
      setScanProgress(0)

      fetch("/api/v1/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlParam }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("Scan failed")
          return r.json()
        })
        .then((s: ScanResult) => {
          s.id = scanId
          addScan(s)
        })
        .catch(() => setNotFound(true))
        .finally(() => {
          setIsScanning(false)
          setScanProgress(100)
        })
    } else {
      fetch(`/api/v1/scan?id=${scanId}`)
        .then((r) => {
          if (!r.ok) throw new Error("Not found")
          return r.json()
        })
        .then((s: ScanResult) => addScan(s))
        .catch(() => setNotFound(true))
    }
  }, [scanId, urlParam, scan, addScan, setIsScanning, setScanProgress])

  if (!scan) {
    if (notFound) {
      return (
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield size={32} className="mx-auto text-[#d4d4d4] mb-4" />
              <h2 className="text-base font-semibold text-[#0a0a0a] mb-1">Scan not found</h2>
              <p className="text-sm text-[#737373] mb-6">
                This scan could not be loaded. It may have been deleted or failed to save.
              </p>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }

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
