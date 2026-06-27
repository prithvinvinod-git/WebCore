"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Input } from "@/components/ui/input"
import { Settings, Copy, Trash2, Plus, Key, User, Shield } from "lucide-react"
import Link from "next/link"

interface ApiKey {
  id: string
  name: string
  key?: string
  createdAt: { toDate?: () => Date } | string
  lastUsed?: { toDate?: () => Date } | string | null
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState("")
  const [showKey, setShowKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/v1/user/api-keys")
      .then((r) => r.json())
      .then((data) => {
        setApiKeys(data.keys || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const createKey = async () => {
    if (!newKeyName.trim()) return
    const res = await fetch("/api/v1/user/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName }),
    })
    const data = await res.json()
    if (data.key) {
      setShowKey(data.key)
      setNewKeyName("")
      const r = await fetch("/api/v1/user/api-keys")
      const d = await r.json()
      setApiKeys(d.keys || [])
    }
  }

  const deleteKey = async (keyId: string) => {
    await fetch("/api/v1/user/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId }),
    })
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId))
  }

  const formatDate = (d: { toDate?: () => Date } | string | undefined | null) => {
    if (!d) return "Never"
    if (typeof d === "string") return new Date(d).toLocaleDateString()
    if (d.toDate) return d.toDate().toLocaleDateString()
    return String(d)
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Settings</h1>
        <p className="text-sm text-[#737373] mt-1">Configure your account and API access.</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={16} className="text-[#737373]" />
              <h2 className="text-sm font-semibold text-[#0a0a0a]">Profile</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center text-sm font-medium text-[#525252]">
                {user?.email?.slice(0, 2).toUpperCase() || "JD"}
              </div>
              <div>
                <p className="text-sm font-medium text-[#0a0a0a]">{user?.displayName || "User"}</p>
                <p className="text-xs text-[#737373]">{user?.email || "No email"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key size={16} className="text-[#737373]" />
              <h2 className="text-sm font-semibold text-[#0a0a0a]">API Keys</h2>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {showKey && (
              <div className="p-3 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-sm">
                <p className="font-medium text-[#16a34a] mb-1">Your new API key:</p>
                <code className="text-xs bg-white px-2 py-1 rounded border border-[#bbf7d0] break-all">{showKey}</code>
                <p className="text-xs text-[#737373] mt-1">Save this — you won&apos;t see it again.</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Input
                id="api-key-name"
                placeholder="e.g., Production CI/CD"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button size="sm" onClick={createKey} disabled={!newKeyName.trim()}>
                <Plus size={14} className="mr-1" /> Create
              </Button>
            </div>
            {apiKeys.length > 0 && (
              <div className="divide-y divide-[#e5e5e5]">
                {apiKeys.map((k) => (
                  <div key={k.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">{k.name}</p>
                      <p className="text-xs text-[#737373]">Created {formatDate(k.createdAt)}</p>
                    </div>
                    <button onClick={() => deleteKey(k.id)} className="p-1 text-[#737373] hover:text-[#dc2626]">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {!loading && apiKeys.length === 0 && (
              <p className="text-xs text-[#737373]">No API keys yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#0a0a0a]">Danger Zone</h2>
          </CardHeader>
          <CardContent className="p-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#dc2626]"
              onClick={async () => {
                await signOut()
                await fetch("/api/v1/auth/session", { method: "DELETE" })
                window.location.href = "/"
              }}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
