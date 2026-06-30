"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSidebar } from "@/components/ui/sidebar"
import { IconLogout, IconSettings, IconChevronUp } from "@tabler/icons-react"
import Link from "next/link"

export function DashboardSidebarFooter({ serverSession }: { serverSession?: { uid: string; email?: string; name?: string } | null }) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { open } = useSidebar()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user?.displayName || serverSession?.name || ""
  const email = user?.email || serverSession?.email || ""
  const photoURL = user?.photoURL || null

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase() || "JD"

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open) setDropdownOpen(false)
  }, [open])

  const handleSignOut = async () => {
    setDropdownOpen(false)
    await signOut()
    await fetch("/api/v1/auth/session", { method: "DELETE" })
    router.push("/")
  }

  return (
    <div ref={dropdownRef} className="relative -mt-[90px]">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex w-full items-center gap-3 rounded-full border border-neutral-300 dark:border-neutral-700 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt=""
            className="h-8 w-8 shrink-0 rounded-full border border-neutral-400 dark:border-neutral-600 object-cover"
          />
        ) : (
          <div className="h-8 w-8 shrink-0 rounded-full border border-neutral-400 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {initials}
          </div>
        )}
        {open && (
          <>
            <div className="flex flex-1 flex-col overflow-hidden text-left">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">{displayName || email}</span>
            </div>
            <IconChevronUp
              className={`h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-transform ${dropdownOpen ? "" : "rotate-180"}`}
            />
          </>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-neutral-200 rounded-lg shadow-lg p-1 z-50">
          {open && (
            <div className="px-3 py-2 border-b border-neutral-100">
              <p className="text-xs font-medium text-neutral-800 truncate">{displayName || email}</p>
              <p className="text-[10px] text-neutral-500 truncate">{email}</p>
            </div>
          )}
          <Link
            href="/dashboard/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100 rounded-md"
          >
            <IconSettings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-md"
          >
            <IconLogout className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
