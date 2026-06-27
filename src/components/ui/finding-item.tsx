"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Pill } from "@/components/ui/pill"
import type { Finding } from "@/types/scan"

interface FindingItemProps {
  finding: Finding
}

const severityVariant: Record<string, "error" | "warning" | "default" | "success"> = {
  critical: "error",
  high: "warning",
  medium: "default",
  low: "success",
}

export function FindingItem({ finding }: FindingItemProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (finding.remediationPrompt) {
      await navigator.clipboard.writeText(finding.remediationPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f5f5f5] transition-colors"
      >
        <div className={cn(
          "w-2 h-2 rounded-full shrink-0",
          finding.passed ? "bg-[#16a34a]" : "bg-[#dc2626]"
        )} />
        <span className="flex-1 text-sm font-medium text-[#0a0a0a] truncate">
          {finding.title}
        </span>
        <Pill variant={severityVariant[finding.severity] || "default"}>
          {finding.severity}
        </Pill>
        <Pill variant={finding.passed ? "success" : "error"}>
          {finding.passed ? "Passed" : "Failed"}
        </Pill>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-[#e5e5e5] bg-[#fafafa]">
          <p className="text-sm text-[#525252] mb-2">{finding.description}</p>
          {finding.remediationPrompt && (
            <div className="mt-2 flex items-start gap-2">
              <code className="flex-1 text-xs bg-white border border-[#e5e5e5] rounded p-2 text-[#525252] font-mono max-h-20 overflow-y-auto">
                {finding.remediationPrompt.slice(0, 200)}...
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-1.5 rounded-md hover:bg-[#e5e5e5] transition-colors"
                title="Copy fix prompt"
              >
                {copied ? <Check size={14} className="text-[#16a34a]" /> : <Copy size={14} className="text-[#737373]" />}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
