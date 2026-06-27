"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/pill"
import {
  Bell, Trash2, Plus, RefreshCw, CheckCircle, AlertTriangle, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface MonitorItem {
  id: string
  scanId: string
  url?: string
  uptimeInterval: number
  scanSchedule: string
  emailNotifications: boolean
  alertWebhooks: string[]
  enabled: boolean
  lastRun: string | null
  status: string
}

export default function MonitorPage() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [schedule, setSchedule] = useState<"daily" | "weekly">("weekly")
  const [loading, setLoading] = useState(true)

  const fetchMonitors = async () => {
    try {
      const res = await fetch("/api/v1/monitor")
      const data = await res.json()
      setMonitors(data.monitors || [])
    } catch {
      console.error("Failed to fetch monitors")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMonitors() }, []) // eslint-disable-line react-hooks/set-state-in-effect

  const addMonitor = async () => {
    if (!newUrl.trim()) return
    try { new URL(newUrl) } catch { return }

    const scanId = crypto.randomUUID()
    const res = await fetch("/api/v1/monitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scanId,
        url: newUrl,
        uptimeInterval: schedule === "daily" ? 1440 : 10080,
        scanSchedule: schedule,
        emailNotifications: true,
        alertWebhooks: [],
      }),
    })

    if (res.ok) {
      setNewUrl("")
      await fetchMonitors()
    }
  }

  const removeMonitor = async (id: string) => {
    await fetch(`/api/v1/monitor?id=${id}`, { method: "DELETE" })
    setMonitors((p) => p.filter((m) => m.id !== id))
  }

  const toggleMonitor = async (id: string) => {
    setMonitors((p) => p.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Monitoring</h1>
          <p className="text-sm text-[#737373] mt-1">Keep an eye on your sites with uptime checks and scheduled rescans.</p>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                id="monitor-url"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-[#f5f5f5] rounded-lg p-1">
              <button
                onClick={() => setSchedule("daily")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  schedule === "daily" ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Daily
              </button>
              <button
                onClick={() => setSchedule("weekly")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  schedule === "weekly" ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#737373] hover:text-[#0a0a0a]"
                )}
              >
                Weekly
              </button>
            </div>
            <Button onClick={addMonitor} disabled={!newUrl.trim()}>
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-[#737373]">Loading monitors...</CardContent>
        </Card>
      ) : monitors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell size={28} className="mx-auto text-[#d4d4d4] mb-3" />
            <h2 className="text-base font-semibold text-[#0a0a0a] mb-1">No monitors set up</h2>
            <p className="text-sm text-[#737373]">Add a URL above to start monitoring uptime and scheduling scans.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {monitors.map((m) => (
            <Link key={m.id} href={`/dashboard/monitor/${m.id}`}>
              <Card className="hover:bg-[#fafafa] transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      m.status === "up" ? "bg-[#16a34a]" : m.status === "down" ? "bg-[#dc2626]" : "bg-[#d4d4d4]"
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0a0a0a] truncate">{m.url || m.scanId}</span>
                        <Badge variant={m.enabled ? "success" : "default"}>
                          {m.enabled ? "Active" : "Paused"}
                        </Badge>
                        <Pill>{m.scanSchedule}</Pill>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#737373]">
                        <span>Check every {m.uptimeInterval} min</span>
                        {m.emailNotifications && <span>Email alerts on</span>}
                        {m.lastRun && <span>Last: {typeof m.lastRun === "string" ? new Date(m.lastRun).toLocaleString() : "N/A"}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={() => toggleMonitor(m.id)}
                        className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#737373] transition-colors"
                        title={m.enabled ? "Pause" : "Activate"}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        onClick={() => removeMonitor(m.id)}
                        className="p-1.5 rounded-md hover:bg-[#f5f5f5] text-[#737373] transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#16a34a]/10 flex items-center justify-center">
              <CheckCircle size={18} className="text-[#16a34a]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0a0a0a]">{monitors.filter(m => m.status === "up").length}</div>
              <div className="text-xs text-[#737373]">Sites Online</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#dc2626]/10 flex items-center justify-center">
              <AlertTriangle size={18} className="text-[#dc2626]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0a0a0a]">{monitors.filter(m => m.status === "down").length}</div>
              <div className="text-xs text-[#737373]">Sites Down</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3b82f6]/10 flex items-center justify-center">
              <Bell size={18} className="text-[#3b82f6]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[#0a0a0a]">{monitors.length}</div>
              <div className="text-xs text-[#737373]">Total Monitors</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
