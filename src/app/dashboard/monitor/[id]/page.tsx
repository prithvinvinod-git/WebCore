"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Activity, Trash2, Globe } from "lucide-react"
import Link from "next/link"

interface MonitorDetail {
  id: string
  scanId: string
  url?: string
  uptimeInterval: number
  scanSchedule: string
  alertWebhooks: string[]
  emailNotifications: boolean
  createdAt: { toDate?: () => Date } | string
  lastRun?: { toDate?: () => Date } | string
}

export default function MonitorDetailPage() {
  const params = useParams()
  const [monitor, setMonitor] = useState<MonitorDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/monitor`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.monitors || []).find((m: MonitorDetail) => m.id === params.id)
        setMonitor(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <Card><CardContent className="p-8 text-center text-sm text-[#737373]">Loading monitor...</CardContent></Card>
    </div>
  )

  if (!monitor) return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <Card><CardContent className="p-8 text-center text-sm text-[#737373]">Monitor not found</CardContent></Card>
    </div>
  )

  const formatDate = (d: { toDate?: () => Date } | string | undefined) => {
    if (!d) return "Never"
    if (typeof d === "string") return new Date(d).toLocaleString()
    if (d.toDate) return d.toDate().toLocaleString()
    return String(d)
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/monitor">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={14} className="mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Monitor Details</h1>
          <p className="text-xs text-[#737373] mt-0.5">Scan ID: {monitor.scanId?.slice(0, 12)}...</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[#dc2626]">
          <Trash2 size={14} className="mr-1" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-[#0a0a0a]">Schedule</h2></CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Interval</span>
              <span className="text-[#0a0a0a] font-medium">Every {monitor.uptimeInterval}h</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Scan schedule</span>
              <span className="text-[#0a0a0a] font-medium capitalize">{monitor.scanSchedule}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Last run</span>
              <span className="text-[#0a0a0a] font-medium">{formatDate(monitor.lastRun)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="text-sm font-semibold text-[#0a0a0a]">Notifications</h2></CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Email alerts</span>
              <Badge variant={monitor.emailNotifications ? "success" : "default"}>
                {monitor.emailNotifications ? "On" : "Off"}
              </Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#737373]">Webhooks</span>
              <span className="text-[#0a0a0a] font-medium">{monitor.alertWebhooks?.length || 0} configured</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {monitor.alertWebhooks?.length > 0 && (
        <Card className="mt-6">
          <CardHeader><h2 className="text-sm font-semibold text-[#0a0a0a]">Webhook Endpoints</h2></CardHeader>
          <CardContent className="p-4 space-y-2">
            {monitor.alertWebhooks.map((webhook, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#525252]">
                <Globe size={12} />
                <code className="text-[10px] bg-[#f5f5f5] px-1.5 py-0.5 rounded">{webhook}</code>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
