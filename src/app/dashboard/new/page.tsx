"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, ChevronRight, Shield, Search, BarChart3, Bot, Eye, Activity, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"

const modules = [
  { id: "security", label: "Security Audit", icon: Shield, color: "#ea580c", desc: "150+ checks" },
  { id: "seo", label: "SEO Audit", icon: Search, color: "#16a34a", desc: "80+ checks" },
  { id: "aeo", label: "AEO Audit", icon: Bot, color: "#7c3aed", desc: "60+ checks" },
  { id: "performance", label: "Performance", icon: Gauge, color: "#3b82f6", desc: "Lighthouse + CrUX" },
  { id: "indexing", label: "Indexing", icon: Activity, color: "#ea580c", desc: "Sitemap + Robots" },
  { id: "aiReadiness", label: "AI Readiness", icon: BarChart3, color: "#16a34a", desc: "LLM + Voice" },
  { id: "domain", label: "Domain Health", icon: Globe, color: "#7c3aed", desc: "DNS + Email" },
  { id: "accessibility", label: "Accessibility", icon: Eye, color: "#3b82f6", desc: "a11y checks" },
] as const

export default function NewScanPage() {
  const router = useRouter()
  const [url, setUrl] = useState("")
  const [selectedModules, setSelectedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  )

  const toggleModule = (id: string) => {
    setSelectedModules((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleScan = () => {
    if (!url.trim()) return
    const scanId = crypto.randomUUID()
    router.push(`/dashboard/scan/${scanId}?url=${encodeURIComponent(url)}`)
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#0a0a0a]">New Scan</h1>
        <p className="text-sm text-[#737373] mt-1">
          Enter a URL and select which diagnostic modules to run.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button onClick={handleScan} disabled={!url.trim()}>
              Run Scan
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-[#0a0a0a]">Diagnostic Modules</h2>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => toggleModule(m.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  selectedModules.has(m.id)
                    ? "border-[#0a0a0a] bg-[#fafafa]"
                    : "border-[#e5e5e5] bg-white hover:border-[#d4d4d4]"
                )}
              >
                <m.icon size={18} style={{ color: m.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#0a0a0a] truncate">{m.label}</div>
                  <div className="text-xs text-[#737373]">{m.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
