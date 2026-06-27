"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Pill } from "@/components/ui/pill"
import {
  Bell, Webhook, Clock, Shield, Globe, Trash2, Plus,
  ExternalLink, CheckCircle, AlertTriangle, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MonitorItem {
  id: string
  url: string
  interval: number
  schedule: "daily" | "weekly"
  email: boolean
  webhooks: string[]
  enabled: boolean
  lastCheck: string | null
  status: "up" | "down" | "pending"
}

export default function MonitorPage() {
  const [monitors, setMonitors] = useState<MonitorItem[]>([])
  const [newUrl, setNewUrl] = useState("")
  const [schedule, setSchedule] = useState<"daily" | "weekly">("weekly")

  const addMonitor = () => {
    if (!newUrl.trim()) return
    try { new URL(newUrl) } catch { return }

    const item: MonitorItem = {
      id: crypto.randomUUID(),
      url: newUrl,
      interval: schedule === "daily" ? 1440 : 10080,
      schedule,
      email: true,
      webhooks: [],
      enabled: true,
      lastCheck: null,
      status: "pending",
    }
    setMonitors((p) => [...p, item])
    setNewUrl("")
  }

  const removeMonitor = (id: string) => {
    setMonitors((p) => p.filter((m) => m.id !== id))
  }

  const toggleMonitor = (id: string) => {
    setMonitors((p) => p.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Monitoring</h1>
          <p className="text-sm text-[#737373] mt-1">
            Keep an eye on your sites with uptime checks and scheduled rescans.
          </p>
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

      {monitors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell size={28} className="mx-auto text-[#d4d4d4] mb-3" />
            <h2 className="text-base font-semibold text-[#0a0a0a] mb-1">No monitors set up</h2>
            <p className="text-sm text-[#737373]">
              Add a URL above to start monitoring uptime and scheduling scans.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {monitors.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    m.status === "up" ? "bg-[#16a34a]" : m.status === "down" ? "bg-[#dc2626]" : "bg-[#d4d4d4]"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#0a0a0a] truncate">{m.url}</span>
                      <Badge variant={m.enabled ? "success" : "default"}>
                        {m.enabled ? "Active" : "Paused"}
                      </Badge>
                      <Pill>{m.schedule}</Pill>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#737373]">
                      <span>Check every {m.interval} min</span>
                      {m.email && <span>Email alerts on</span>}
                      {m.lastCheck && <span>Last: {m.lastCheck}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
