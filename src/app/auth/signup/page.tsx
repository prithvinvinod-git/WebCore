"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getAuth } from "firebase/auth"

export default function SignupPage() {
  const router = useRouter()
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signUp(email, password)
      const uid = getAuth().currentUser?.uid || email
      await fetch("/api/v1/auth/session", { method: "POST", body: JSON.stringify({ uid, email, name }) })
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      const u = getAuth().currentUser
      await fetch("/api/v1/auth/session", { method: "POST", body: JSON.stringify({ uid: u?.uid, email: u?.email, provider: "google", name: u?.displayName || "" }) })
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed")
    }
  }

  const handleGithub = async () => {
    try {
      await signInWithGithub()
      const u = getAuth().currentUser
      await fetch("/api/v1/auth/session", { method: "POST", body: JSON.stringify({ uid: u?.uid, email: u?.email, provider: "github", name: u?.displayName || "" }) })
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "GitHub sign-up failed")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Shield size={28} className="text-[#0a0a0a]" />
        <span className="font-inter text-xl font-semibold text-[#0a0a0a]">WebCore</span>
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#0a0a0a]">Create your account</h1>
          <p className="text-sm text-[#737373] mt-1">Start diagnosing any website</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#fef2f2] text-[#dc2626] text-sm border border-[#fecaca]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0a0a0a] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full px-3 py-2 border border-[#e5e5e5] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 focus:border-[#0a0a0a]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#0a0a0a] text-white rounded-full text-sm font-medium hover:bg-[#262626] transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e5e5e5]" />
          </div>
          <div className="relative flex justify-center text-xs text-[#737373]">
            <span className="bg-white px-2">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleGoogle} className="flex items-center justify-center gap-2 py-2 border border-[#e5e5e5] rounded-full text-sm text-[#525252] hover:bg-[#f5f5f5] transition-colors">
            Google
          </button>
          <button onClick={handleGithub} className="flex items-center justify-center gap-2 py-2 border border-[#e5e5e5] rounded-full text-sm text-[#525252] hover:bg-[#f5f5f5] transition-colors">
            GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-[#737373]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#0a0a0a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
