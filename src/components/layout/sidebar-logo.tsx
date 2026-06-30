"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { motion } from "motion/react"
import { useSidebar } from "@/components/ui/sidebar"

export function SidebarLogo() {
  const { open, animate } = useSidebar()
  return (
    <Link href="/" className="flex items-center gap-3 py-2.5 px-3">
      <div className="flex items-center justify-center w-6 shrink-0">
        <Shield size={24} className="text-neutral-800 dark:text-neutral-200 shrink-0" />
      </div>
      <motion.span
        animate={{
          width: animate ? (open ? "auto" : 0) : "auto",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-base font-semibold text-neutral-800 dark:text-neutral-200 overflow-hidden whitespace-nowrap"
      >
        WebCore
      </motion.span>
    </Link>
  )
}
