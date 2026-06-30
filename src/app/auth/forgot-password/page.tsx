"use client"

import { useState } from "react"
import Link from "next/link"
import { Shield, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="flex items-center gap-2">
          <Shield size={28} className="text-[#0a0a0a] dark:text-white" />
          <span className="font-inter text-xl font-semibold text-[#0a0a0a] dark:text-white">WebCore</span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#0a0a0a] dark:text-white">Reset your password</h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">We&apos;ll send you a reset link</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#fef2f2] text-[#dc2626] text-sm border border-[#fecaca]">
            {error}
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-lg bg-[#f0fdf4] text-[#16a34a] text-sm border border-[#bbf7d0] text-center">
            Reset link sent! Check your email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2 bg-white dark:bg-neutral-900 text-[#0a0a0a] dark:text-white placeholder:text-[#a3a3a3] dark:placeholder:text-neutral-500 border border-[#e5e5e5] dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a] dark:focus:border-white dark:focus:ring-white/10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] rounded-full text-sm font-medium hover:bg-[#262626] dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-[#737373] dark:text-neutral-400 hover:text-[#0a0a0a] dark:hover:text-white">
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
