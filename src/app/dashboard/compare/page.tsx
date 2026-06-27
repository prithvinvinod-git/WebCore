"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, Users, Globe } from "lucide-react"
import Link from "next/link"

export default function ComparePage() {
  const [urls, setUrls] = useState<string[]>([""])
  const [results, setResults] = useState<Record<string, { score: number; grade: string; modules: Record<string, number> }> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const addUrl = () => setUrls([...urls, ""])
  const removeUrl = (i: number) => setUrls(urls.filter((_, idx) => idx !== i))
  const updateUrl = (i: number, v: string) => {
    const next = [...urls]
    next[i] = v
    setUrls(next)
  }

  const runComparison = async () => {
    const valid = urls.filter((u) => u.trim())
    if (valid.length < 2) { setError("Enter at least 2 URLs"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/v1/benchmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: valid }),
      })
      const data = await res.json()
      const mapped: Record<string, { score: number; grade: string; modules: Record<string, number> }> = {}
      for (const r of data.results || []) {
        mapped[r.url] = { score: r.overallScore, grade: r.overallGrade, modules: r.scores || {} }
      }
      setResults(mapped)
    } catch {
      setError("Comparison failed")
    } finally {
      setLoading(false)
    }
  }

  const allModules = results ? [...new Set(Object.values(results).flatMap((r) => Object.keys(r.modules)))] : []

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} className="mr-1" />Back</Button>
        </Link>
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Compare Sites</h1>
          <p className="text-xs text-[#737373] mt-0.5">Benchmark multiple URLs side by side</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-3">
          {urls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateUrl(i, e.target.value)}
                placeholder={`https://site${i + 1}.com`}
                className="flex-1 px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a]"
              />
              {urls.length > 2 && (
                <button onClick={() => removeUrl(i)} className="p-1 text-[#737373] hover:text-[#dc2626]">
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={addUrl}><Plus size={14} className="mr-1" />Add URL</Button>
            <Button size="sm" onClick={runComparison} disabled={loading}>
              {loading ? "Comparing..." : "Compare"}
            </Button>
          </div>
          {error && <p className="text-xs text-[#dc2626]">{error}</p>}
        </CardContent>
      </Card>

      {results && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="text-left py-2 px-3 text-xs font-medium text-[#737373]">Metric</th>
                {Object.keys(results).map((url) => (
                  <th key={url} className="text-center py-2 px-3 text-xs font-medium text-[#0a0a0a] max-w-[150px] truncate">{url}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e5e5e5]">
                <td className="py-2 px-3 text-xs text-[#525252] font-medium">Overall</td>
                {Object.entries(results).map(([url, r]) => (
                  <td key={url} className="text-center py-2 px-3">
                    <Badge variant={r.score >= 70 ? "success" : r.score >= 50 ? "warning" : "error"}>
                      {r.grade} · {r.score}
                    </Badge>
                  </td>
                ))}
              </tr>
              {allModules.map((mod) => (
                <tr key={mod} className="border-b border-[#e5e5e5]">
                  <td className="py-2 px-3 text-xs text-[#525252] capitalize">{mod}</td>
                  {Object.entries(results).map(([url, r]) => (
                    <td key={url} className="text-center py-2 px-3 text-xs text-[#0a0a0a]">{r.modules[mod] ?? "-"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
