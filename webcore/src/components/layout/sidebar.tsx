"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, Layout, History, Plus, Settings, BarChart3, Activity } from "lucide-react"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: Layout },
  { label: "New Scan", href: "/dashboard/new", icon: Plus },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "Monitor", href: "/dashboard/monitor", icon: Activity },
  { label: "Benchmark", href: "/dashboard/benchmark", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] border-r border-[#e5e5e5] bg-white min-h-screen hidden lg:flex flex-col">
      <div className="h-14 flex items-center gap-2 px-4 border-b border-[#e5e5e5]">
        <Shield size={20} className="text-[#0a0a0a]" />
        <span className="font-semibold text-base text-[#0a0a0a]">WebCore</span>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {sidebarLinks.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#f5f5f5] text-[#0a0a0a]"
                  : "text-[#737373] hover:text-[#0a0a0a] hover:bg-[#fafafa]"
              )}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
