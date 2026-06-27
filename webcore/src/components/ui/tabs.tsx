"use client"
import { cn } from "@/lib/utils"

interface TabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-1 border-b border-[#e5e5e5]", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 py-2 text-sm font-medium transition-all duration-150 relative",
            "hover:text-[#0a0a0a]",
            activeTab === tab.id
              ? "text-[#0a0a0a] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0a0a0a]"
              : "text-[#737373]"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
