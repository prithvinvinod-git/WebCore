"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowLeft, Plus, Users, Shield } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function OrganizationsPage() {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} className="mr-1" />Back</Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-[24px] font-semibold text-[#0a0a0a]">Organizations</h1>
          <p className="text-xs text-[#737373] mt-0.5">Team management and collaboration</p>
        </div>
        <Button size="sm"><Plus size={14} className="mr-1" />Create Org</Button>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Users size={32} className="mx-auto mb-3 text-[#d4d4d4]" />
          <h2 className="text-sm font-semibold text-[#0a0a0a] mb-1">No organizations yet</h2>
          <p className="text-xs text-[#737373]">Create an organization to collaborate with your team on scans and monitors.</p>
        </CardContent>
      </Card>
    </div>
  )
}
