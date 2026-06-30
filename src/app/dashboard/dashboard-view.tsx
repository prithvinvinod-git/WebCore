"use client"
import { useEffect } from "react"
import { useScanStore } from "@/store/scan-store"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScoreCard } from "@/components/ui/score-card"
import { Pill } from "@/components/ui/pill"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, History, Shield, Globe, Zap, Bot } from "lucide-react"

const moduleMeta = [
  { key: "security", label: "Security", icon: Shield, color: "#ea580c" },
  { key: "seo", label: "SEO", icon: Globe, color: "#16a34a" },
  { key: "aeo", label: "AEO", icon: Bot, color: "#7c3aed" },
  { key: "performance", label: "Performance", icon: Zap, color: "#3b82f6" },
] as const

export default function DashboardView({
  initialScans,
}: {
  initialScans: import("@/types/scan").ScanResult[]
}) {
  const { scans, isScanning, setScans } = useScanStore()

  useEffect(() => {
    if (initialScans.length > 0 && useScanStore.getState().scans.length === 0) {
      setScans(initialScans)
    }
    fetch("/api/v1/scans?limit=1000")
      .then((r) => r.json())
      .then((data) => {
        if (data.scans?.length) setScans(data.scans)
      })
      .catch(() => {})
  }, [setScans, initialScans])

  const latestScan = scans[0] || initialScans[0]
  const displayScans = scans.length > 0 ? scans : initialScans

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Dashboard</h1>
          <p className="text-sm text-[#737373] mt-1">
            {displayScans.length} scan{displayScans.length !== 1 ? "s" : ""} completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/history">
            <Button variant="ghost" size="sm">
              <History size={14} className="mr-1.5" />
              History
            </Button>
          </Link>
          <Link href="/dashboard/new">
            <Button size="sm">
              <Plus size={14} className="mr-1.5" />
              New Scan
            </Button>
          </Link>
        </div>
      </div>

      {isScanning && (
        <Card className="mb-8">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
            <span className="text-sm text-[#525252]">Scan in progress...</span>
          </CardContent>
        </Card>
      )}

      {latestScan ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {moduleMeta.map((m) => {
              const result = (latestScan as unknown as Record<string, { score: number; grade: string }>)[m.key]
              return (
                <ScoreCard
                  key={m.key}
                  label={m.label}
                  score={result?.score ?? 0}
                  accentColor={m.color}
                />
              )
            })}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#0a0a0a]">Latest Scan</h2>
                  <Link href={`/dashboard/scan/${latestScan.id}`}>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#0a0a0a] font-medium">{latestScan.url}</span>
                  <Pill variant={latestScan.overallScore >= 70 ? "success" : latestScan.overallScore >= 50 ? "warning" : "error"}>
                    Score: {latestScan.overallScore}
                  </Pill>
                  <span className="text-[#737373]">{latestScan.durationMs}ms</span>
                  <span className="text-[#737373]">{new Date(latestScan.createdAt).toLocaleDateString("en-US")}</span>
                </div>
              </CardContent>
            </Card>

            {displayScans.length > 1 && (
              <Card>
                <CardHeader>
                  <h2 className="text-sm font-semibold text-[#0a0a0a]">Recent Scans</h2>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {displayScans.slice(1).map((scan) => (
                      <Link key={scan.id} href={`/dashboard/scan/${scan.id}`}>
                        <div className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-[#fafafa] transition-colors">
                          <span className="text-[#0a0a0a] font-medium flex-1 truncate">{scan.url}</span>
                          <Pill variant={scan.overallScore >= 70 ? "success" : scan.overallScore >= 50 ? "warning" : "error"}>
                            {scan.overallScore}
                          </Pill>
                          <span className="text-[#737373] w-20 text-right">{scan.durationMs}ms</span>
                          <span className="text-[#737373] w-24 text-right">{new Date(scan.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="max-w-sm mx-auto">
              <Shield size={32} className="mx-auto text-[#d4d4d4] mb-4" />
              <h2 className="text-lg font-semibold text-[#0a0a0a] mb-2">No scans yet</h2>
              <p className="text-sm text-[#737373] mb-6">
                Run your first scan to see your website&apos;s complete diagnostic report.
              </p>
              <Link href="/dashboard/new">
                <Button size="lg">Run Your First Scan</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
