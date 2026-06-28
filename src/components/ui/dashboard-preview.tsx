"use client"
import { useEffect, useState } from "react"
import { Shield } from "lucide-react"
import type { ScanResult } from "@/types/scan"

export default function DashboardPreview({ initialScans }: { initialScans?: ScanResult[] }) {
  const [scans, setScans] = useState<ScanResult[]>(initialScans || [])

  useEffect(() => {
    if (initialScans) return
    fetch("/api/v1/scans?limit=5")
      .then((r) => r.json())
      .then((data) => setScans(data.scans || []))
      .catch(() => {})
  }, [initialScans])

  if (scans.length === 0) {
    return (
      <div className="p-6 sm:p-10 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
        <div className="text-center">
          <Shield size={32} className="mx-auto text-[#d4d4d4]" strokeWidth={1} />
          <p className="mt-3 text-sm text-[#a3a3a3] font-medium">Dashboard Preview</p>
          <p className="mt-1 text-xs text-[#c4c4c4]">Comprehensive scan results at a glance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-3 min-h-[200px] sm:min-h-[280px] overflow-y-auto">
      <p className="text-xs font-medium text-[#737373] uppercase tracking-wider">Your Recent Scans</p>
      {scans.slice(0, 5).map((s) => (
        <a
          key={s.id}
          href={`/dashboard/scan/${s.id}`}
          className="block rounded-lg border border-[#e5e5e5] p-3 hover:border-[#d0d0d0] hover:bg-[#fafafa] transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[#0a0a0a] truncate">{s.url}</span>
            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{
              backgroundColor: (s.overallScore ?? 0) >= 70 ? '#16a34a' : (s.overallScore ?? 0) >= 50 ? '#d97706' : '#dc2626',
              color: '#fff'
            }}>
              {s.overallGrade ?? 'N/A'}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[#e5e5e5] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#0a0a0a] transition-all"
              style={{ width: `${Math.min(s.overallScore ?? 0, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-[#a3a3a3]">
            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
          </p>
        </a>
      ))}
    </div>
  )
}
