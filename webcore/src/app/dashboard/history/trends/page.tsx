"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useScanStore } from "@/store/scan-store"
import type { ScanResult } from "@/types/scan"
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Calendar, Activity } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TrendPoint {
  date: string
  score: number
}

export default function TrendsPage() {
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

  const groupedByUrl = scans.reduce<Record<string, ScanResult[]>>((acc, scan) => {
    if (!acc[scan.url]) acc[scan.url] = []
    acc[scan.url].push(scan)
    return acc
  }, {})

  const getTrend = (points: TrendPoint[]): { direction: "up" | "down" | "flat"; change: number } => {
    if (points.length < 2) return { direction: "flat", change: 0 }
    const first = points[0].score
    const last = points[points.length - 1].score
    const diff = last - first
    return { direction: diff > 2 ? "up" : diff < -2 ? "down" : "flat", change: diff }
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/history">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} className="mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Historical Trends</h1>
          <p className="text-xs text-[#737373] mt-0.5">Score progression across scans</p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-[#737373]">Loading trends...</CardContent>
        </Card>
      ) : Object.keys(groupedByUrl).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-[#737373]">No scan history yet. Run your first scan.</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByUrl).map(([url, urlScans]) => {
            const sorted = [...urlScans].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            const points: TrendPoint[] = sorted.map((s) => ({ date: s.createdAt, score: s.overallScore }))
            const trend = getTrend(points)
            const latest = sorted[sorted.length - 1]
            const first = sorted[0]

            return (
              <Card key={url}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-[#737373]" />
                      <span className="text-sm font-semibold text-[#0a0a0a] truncate max-w-[400px]">{url}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {trend.direction === "up" ? (
                        <TrendingUp size={16} className="text-[#16a34a]" />
                      ) : trend.direction === "down" ? (
                        <TrendingDown size={16} className="text-[#dc2626]" />
                      ) : (
                        <Minus size={16} className="text-[#737373]" />
                      )}
                      <span className={`text-xs font-medium ${trend.change > 0 ? "text-[#16a34a]" : trend.change < 0 ? "text-[#dc2626]" : "text-[#737373]"}`}>
                        {trend.change > 0 ? "+" : ""}{trend.change} pts
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-end gap-1 h-24 mb-3">
                    {points.map((p, i) => {
                      const height = Math.max(8, (p.score / 100) * 80)
                      const isLatest = i === points.length - 1
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className={`w-full rounded-t-sm transition-all ${isLatest ? "bg-[#0a0a0a]" : "bg-[#d4d4d4]"}`}
                            style={{ height: `${height}px` }}
                            title={`${p.score} - ${new Date(p.date).toLocaleDateString()}`}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#737373]">
                    <span>{new Date(first.createdAt).toLocaleDateString()}</span>
                    <span className="font-medium text-[#0a0a0a]">{latest.overallScore}/100 ({latest.overallGrade})</span>
                    <span>{new Date(latest.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#e5e5e5]">
                    <div className="text-center">
                      <div className="text-xs text-[#737373]">Scans</div>
                      <div className="text-sm font-semibold text-[#0a0a0a]">{sorted.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#737373]">Started at</div>
                      <div className="text-sm font-semibold text-[#0a0a0a]">{first.overallScore}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#737373]">Latest</div>
                      <div className="text-sm font-semibold text-[#0a0a0a]">{latest.overallScore}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
