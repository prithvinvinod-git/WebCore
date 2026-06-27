"use client"
import { useEffect, useState } from "react"
import { useScanStore } from "@/store/scan-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/ui/pill"
import Link from "next/link"
import { History, ChevronRight, TrendingUp, BarChart3 } from "lucide-react"

export default function HistoryPage() {
  const { scans, setScans } = useScanStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/v1/scans")
      .then((r) => r.json())
      .then((data) => {
        setScans(data.scans || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [setScans])

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Scan History</h1>
          <p className="text-sm text-[#737373] mt-1">{scans.length} total scans</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/history/trends">
            <Button variant="ghost" size="sm">
              <TrendingUp size={14} className="mr-1" />
              Trends
            </Button>
          </Link>
          <Link href="/dashboard/new">
            <Button size="sm">New Scan</Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-[#737373]">Loading scans...</CardContent>
        </Card>
      ) : scans.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <History size={28} className="mx-auto text-[#d4d4d4] mb-3" />
            <h2 className="text-base font-semibold text-[#0a0a0a] mb-1">No scans yet</h2>
            <p className="text-sm text-[#737373] mb-4">Run your first scan to see it here.</p>
            <Link href="/dashboard/new">
              <Button size="sm">Run a Scan</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => (
            <Link key={scan.id} href={`/dashboard/scan/${scan.id}`}>
              <Card className="hover:bg-[#fafafa] transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0a0a0a] truncate">{scan.url}</span>
                      <Pill variant={scan.overallScore >= 70 ? "success" : scan.overallScore >= 50 ? "warning" : "error"}>
                        {scan.overallGrade}
                      </Pill>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#737373]">
                      <span>Score: {scan.overallScore}</span>
                      <span>{scan.durationMs}ms</span>
                      <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#d4d4d4]" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
