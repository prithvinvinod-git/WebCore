import { genkit } from "genkit"
import { googleAI } from "@genkit-ai/google-genai"

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
    }),
  ],
})

export async function generateRemediation(params: {
  title: string
  module: string
  severity: string
  description: string
  url: string
  remediationPrompt?: string
}): Promise<{ steps: string[]; code: string; explanation: string }> {
  const prompt = `You are a senior web developer and security engineer. Given a diagnostic finding, generate a concrete step-by-step remediation plan.

Finding:
- Title: ${params.title}
- Module: ${params.module}
- Severity: ${params.severity}
- URL: ${params.url}
- Description: ${params.description}
${params.remediationPrompt ? `- Suggested Approach: ${params.remediationPrompt}` : ""}

Respond in this exact JSON format without markdown formatting:
{
  "steps": ["step 1", "step 2", ...],
  "code": "relevant code snippet or configuration change",
  "explanation": "brief explanation of the fix"
}`

  try {
    const result = await ai.generate(prompt)
    const text = result.text
    const cleaned = text.replace(/```(json)?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      steps: ["Review the issue manually", "Check documentation for best practices"],
      code: "",
      explanation: "AI remediation unavailable. Manual review recommended.",
    }
  }
}

export async function generateModuleReport(params: {
  url: string
  module: string
  score: number
  grade: string
  findings: Array<{ title: string; severity: string; passed: boolean; description: string }>
}): Promise<{ summary: string; topIssues: string[]; recommendations: string[] }> {
  const prompt = `Analyze this ${params.module} audit report for ${params.url}:

Score: ${params.score}/100 (Grade: ${params.grade})

Findings:
${params.findings.map((f) => `- [${f.passed ? "PASS" : "FAIL"}] ${f.title} (${f.severity}): ${f.description}`).join("\n")}

Respond in exact JSON format:
{
  "summary": "2-3 sentence executive summary",
  "topIssues": ["top 3 critical issues to address"],
  "recommendations": ["3-4 prioritized recommendations"]
}`

  try {
    const result = await ai.generate(prompt)
    const cleaned = result.text.replace(/```(json)?/g, "").trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      summary: `${params.module} audit completed with score ${params.score}/100.`,
      topIssues: params.findings.filter((f) => !f.passed).slice(0, 3).map((f) => f.title),
      recommendations: ["Review all failed checks", "Address critical findings first", `Improve ${params.module} score by fixing identified issues`],
    }
  }
}
