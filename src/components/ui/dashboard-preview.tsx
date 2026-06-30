"use client"
import { useState } from "react"
import { Shield } from "lucide-react"
import type { ScanResult } from "@/types/scan"

export default function DashboardPreview({ initialScans }: { initialScans?: ScanResult[] }) {
  const [scans] = useState<ScanResult[]>(initialScans || [])

  if (scans.length === 0) {
    return (
      <div className="p-6 sm:p-10 flex items-center justify-center min-h-[200px] sm:min-h-[280px]">
        <div className="text-center">
          <Shield size={32} className="mx-auto text-neutral-600 dark:text-neutral-400" strokeWidth={1} />
          <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500 font-medium">Dashboard Preview</p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Comprehensive scan results at a glance</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-3 min-h-[200px] sm:min-h-[280px] overflow-y-auto bg-white dark:bg-neutral-900 [scrollbar-width:thin] [scrollbar-color:#d4d4d4_transparent] dark:[scrollbar-color:#525252_transparent]">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Your Recent Scans</p>
      {scans.slice(0, 5).map((s) => (
        <a
          key={s.id}
          href={`/dashboard/scan/${s.id}`}
          className="block rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">{s.url}</span>
            <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full" style={{
              backgroundColor: (s.overallScore ?? 0) >= 70 ? '#16a34a' : (s.overallScore ?? 0) >= 50 ? '#d97706' : '#dc2626',
              color: '#fff'
            }}>
              {s.overallGrade ?? 'N/A'}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-600 overflow-hidden">
            <div
              className="h-full rounded-full bg-neutral-600 dark:bg-neutral-400 transition-all"
              style={{ width: `${Math.min(s.overallScore ?? 0, 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
            {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US") : ''}
          </p>
        </a>
      ))}
    </div>
  )
}
