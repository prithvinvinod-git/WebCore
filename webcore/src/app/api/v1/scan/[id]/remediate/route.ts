import { NextRequest, NextResponse } from "next/server"
import { getScanFindings, getScan } from "@/lib/firestore-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const { findingId, status } = body

  if (!findingId) {
    return NextResponse.json({ error: "findingId is required" }, { status: 400 })
  }

  const scan = await getScan(id)
  if (!scan) return NextResponse.json({ error: "Scan not found" }, { status: 404 })

  const findings = await getScanFindings(id)
  const finding = findings.find((f) => f.id === findingId || `${f.scanId}_${f.id}` === findingId) as Record<string, unknown> | undefined

  if (!finding) {
    return NextResponse.json({ error: "Finding not found" }, { status: 404 })
  }

  const title = String(finding.title ?? "")
  const moduleName = String(finding.module ?? "")
  const severity = String(finding.severity ?? "")
  const description = String(finding.description ?? "")
  const remediationPrompt = finding.remediationPrompt ? String(finding.remediationPrompt) : undefined

  const agentInstructions = `WebCore AI Remediation Agent

Issue: ${title}
Module: ${moduleName}
Severity: ${severity}
URL: ${scan.url}

Description:
${description}

${remediationPrompt ? `Suggested Fix:\n${remediationPrompt}` : ""}

Task: Generate a step-by-step remediation plan for this issue.
`

  return NextResponse.json({
    findingId,
    status: status || "acknowledged",
    agentInstructions,
    prompt: remediationPrompt || "No automated fix available. Manual review required.",
  })
}
