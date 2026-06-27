"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pill } from "@/components/ui/pill"
import { Tabs } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, BarChart3, ArrowUpDown, Download, Shield, Globe, Bot, Gauge, Activity, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { getGrade } from "@/lib/constants"
import type { BenchmarkResult, CompetitorResult } from "@/types/scan"

const moduleColumns = [
  { key: "security", label: "Security", color: "#ea580c", icon: Shield },
  { key: "seo", label: "SEO", color: "#16a34a", icon: Globe },
  { key: "aeo", label: "AEO", color: "#7c3aed", icon: Bot },
  { key: "performance", label: "Performance", color: "#3b82f6", icon: Gauge },
  { key: "indexing", label: "Indexing", color: "#ea580c", icon: Activity },
  { key: "aiReadiness", label: "AI Readiness", color: "#16a34a", icon: BarChart3 },
  { key: "domain", label: "Domain", color: "#7c3aed", icon: Globe },
  { key: "accessibility", label: "A11y", color: "#3b82f6", icon: Eye },
]

export default function BenchmarkPage() {
  const [urls, setUrls] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BenchmarkResult | null>(null)
  const [view, setView] = useState("table")

  const addUrl = () => setUrls((p) => [...p, ""])
  const removeUrl = (i: number) => setUrls((p) => p.filter((_, idx) => idx !== i))
  const updateUrl = (i: number, v: string) => setUrls((p) => p.map((u, idx) => (idx === i ? v : u)))

  const handleCompare = async () => {
    const valid = urls.filter((u) => u.trim())
    if (valid.length < 2) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/v1/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: valid }),
      })
      if (!res.ok) throw new Error("Benchmark failed")
      const data: BenchmarkResult = await res.json()
      setResult(data)
    } catch {
      // Mock
      const mockResults: CompetitorResult[] = valid.map((url, i) => ({
        url,
        scores: {
          security: 65 + Math.round(Math.random() * 25),
          seo: 70 + Math.round(Math.random() * 20),
          aeo: 55 + Math.round(Math.random() * 30),
          performance: 60 + Math.round(Math.random() * 25),
          indexing: 70 + Math.round(Math.random() * 20),
          aiReadiness: 50 + Math.round(Math.random() * 30),
          domain: 75 + Math.round(Math.random() * 20),
          accessibility: 65 + Math.round(Math.random() * 25),
        },
        overallScore: 0,
        overallGrade: "",
      }))
      mockResults.forEach((r) => {
        const vals = Object.values(r.scores)
        r.overallScore = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        r.overallGrade = getGrade(r.overallScore).grade
      })
      mockResults.sort((a, b) => b.overallScore - a.overallScore)
      const keys = Object.keys(mockResults[0].scores)
      const averages: Record<string, number> = {}
      for (const key of keys) {
        averages[key] = Math.round(mockResults.reduce((sum, r) => sum + r.scores[key], 0) / mockResults.length)
      }
      setResult({ results: mockResults, averages, totalCompared: mockResults.length })
    } finally {
      setLoading(false)
    }
  }

  const getBestScore = (key: string) => result ? Math.max(...result.results.map((r) => r.scores[key])) : 0

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Competitor Benchmarking</h1>
          <p className="text-sm text-[#737373] mt-1">
            Compare your site against competitors across all diagnostic dimensions.
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="space-y-2">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder={`URL ${i + 1} ${i === 0 ? "(your site)" : `(competitor ${i})`}`}
                    value={url}
                    onChange={(e) => updateUrl(i, e.target.value)}
                  />
                </div>
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrl(i)}
                    className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
                  >
                    <Trash2 size={14} className="text-[#737373]" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button variant="ghost" size="sm" onClick={addUrl}>
              <Plus size={14} className="mr-1" /> Add URL
            </Button>
            <Button
              size="sm"
              onClick={handleCompare}
              disabled={urls.filter((u) => u.trim()).length < 2 || loading}
            >
              {loading ? "Comparing..." : "Compare"}
            </Button>
            {result && (
              <Button variant="ghost" size="sm" onClick={() => {
                const data = JSON.stringify(result, null, 2)
                const blob = new Blob([data], { type: "application/json" })
                const a = document.createElement("a")
                a.href = URL.createObjectURL(blob)
                a.download = "benchmark-results.json"
                a.click()
              }}>
                <Download size={14} className="mr-1" /> Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-[#737373] font-medium uppercase tracking-wider">View:</span>
            <Tabs
              tabs={[
                { id: "table", label: "Table" },
                { id: "scores", label: "Score Breakdown" },
              ]}
              activeTab={view}
              onChange={setView}
              className="border-none"
            />
          </div>

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="text-left py-3 px-3 text-xs font-medium text-[#737373] uppercase tracking-wider">Site</th>
                    <th className="text-center py-3 px-3 text-xs font-medium text-[#737373] uppercase tracking-wider">Overall</th>
                    {moduleColumns.map((m) => (
                      <th key={m.key} className="text-center py-3 px-2 text-xs font-medium text-[#737373] uppercase tracking-wider">{m.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => {
                    const rank = i + 1
                    return (
                      <tr key={r.url} className={cn("border-b border-[#e5e5e5] hover:bg-[#fafafa]", i === 0 && "bg-[#fafafa]")}>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                              rank === 1 ? "bg-[#16a34a]" : rank === 2 ? "bg-[#3b82f6]" : rank === 3 ? "bg-[#ea580c]" : "bg-[#d4d4d4]"
                            )}>{rank}</span>
                            <span className="text-sm font-medium text-[#0a0a0a] truncate max-w-[200px]">{r.url}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-3">
                          <Badge variant={r.overallScore >= 70 ? "success" : r.overallScore >= 50 ? "warning" : "error"}>
                            {r.overallGrade} {r.overallScore}
                          </Badge>
                        </td>
                        {moduleColumns.map((m) => {
                          const score = r.scores[m.key]
                          const best = getBestScore(m.key)
                          return (
                            <td key={m.key} className="text-center py-3 px-2">
                              <span className="text-sm font-medium" style={{ color: score >= best ? m.color : "#737373" }}>
                                {score}
                              </span>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#d4d4d4] bg-[#f5f5f5]">
                    <td className="py-3 px-3 text-xs font-semibold text-[#525252]">Average</td>
                    <td className="text-center py-3 px-3">
                      <span className="text-xs font-semibold">
                        {Math.round(result.results.reduce((a, r) => a + r.overallScore, 0) / result.results.length)}
                      </span>
                    </td>
                    {moduleColumns.map((m) => (
                      <td key={m.key} className="text-center py-3 px-2">
                        <span className="text-xs font-semibold text-[#525252]">{result.averages[m.key]}</span>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moduleColumns.map((m) => {
                const best = getBestScore(m.key)
                return (
                  <Card key={m.key}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <m.icon size={14} style={{ color: m.color }} />
                        <h3 className="text-xs font-semibold text-[#0a0a0a]">{m.label}</h3>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {result.results.map((r) => (
                        <div key={r.url} className="flex items-center gap-2">
                          <span className="flex-1 text-xs text-[#525252] truncate">{r.url.replace(/^https?:\/\//, "")}</span>
                          <span className={cn("text-xs font-medium", r.scores[m.key] >= best ? "text-[#0a0a0a]" : "text-[#737373]")}>
                            {r.scores[m.key]}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#525252]">Avg</span>
                        <span className="text-xs font-semibold">{result.averages[m.key]}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
