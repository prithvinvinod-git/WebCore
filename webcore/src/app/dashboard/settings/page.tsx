"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Settings</h1>
        <p className="text-sm text-[#737373] mt-1">
          Configure your scan preferences and account settings.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#0a0a0a]">Default Scan URL</h2>
          </CardHeader>
          <CardContent className="p-4">
            <Input id="default-url" placeholder="https://example.com" />
            <p className="text-xs text-[#737373] mt-2">
              This URL will be pre-filled on the new scan page.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#0a0a0a]">API Access</h2>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm text-[#525252]">
              Use the WebCore API to trigger scans programmatically.
            </p>
            <Button variant="ghost" size="sm" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
