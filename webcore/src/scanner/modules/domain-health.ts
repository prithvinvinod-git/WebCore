import type { DomainHealthResult, Finding, DNSCheck, EmailSecurity, UptimeInfo, RedirectInfo, CertInfo } from "@/types/scan"
import { fetchUrl, checkTlsCert, checkDns, checkRobotsTxt } from "@/scanner/lib/http-client"

interface ScanInput { url: string; hostname: string }

export class DomainHealthScanner {
  private findings: Finding[] = []
  private score = 0
  private dnsRecords: Awaited<ReturnType<typeof checkDns>> = []
  private cert: Awaited<ReturnType<typeof checkTlsCert>> = null
  private redirectChain: string[] = []
  private statusCode = 0
  private timingMs = 0
  private securityTxt: string | null = null

  async scan(input: ScanInput): Promise<DomainHealthResult> {
    const [dnsResult, certResult, fetchResult, robotsResult] = await Promise.all([
      checkDns(input.hostname).catch(() => []),
      checkTlsCert(input.hostname).catch(() => null),
      fetchUrl(input.url).catch(() => null),
      fetch(`https://${input.hostname}/.well-known/security.txt`).then((r) => r.ok ? r.text() : null).catch(() => null),
    ])

    this.dnsRecords = dnsResult
    this.cert = certResult
    this.securityTxt = robotsResult as unknown as string | null

    if (fetchResult) {
      this.redirectChain = fetchResult.redirectChain
      this.statusCode = fetchResult.statusCode
      this.timingMs = fetchResult.timingMs
    }

    this.runChecks(input)
    this.calculateScore()

    return {
      score: this.score,
      grade: this.getGrade(this.score),
      dns: this.getDns(),
      email: this.getEmailSecurity(),
      uptime: { statusCode: this.statusCode || 0, responseTimeMs: this.timingMs, isUp: this.statusCode >= 200 && this.statusCode < 500 },
      redirects: { chain: this.redirectChain, loops: false, tooMany: this.redirectChain.length > 3 },
      certInfo: this.getCertInfo(),
      findings: this.findings,
    }
  }

  private addFinding(f: Finding) { this.findings.push(f) }

  private runChecks(_input: ScanInput) {
    this.checkDnsRecords()
    this.checkCert()
    this.checkUptime()
    this.checkRedirects()
    this.checkSecurityTxt()
  }

  private checkDnsRecords() {
    const aRecord = this.dnsRecords.find((r) => r.type === "A")
    const aaaaRecord = this.dnsRecords.find((r) => r.type === "AAAA")
    const mxRecords = this.dnsRecords.filter((r) => r.type === "MX")
    const txtRecords = this.dnsRecords.filter((r) => r.type === "TXT")
    const nsRecords = this.dnsRecords.filter((r) => r.type === "NS")
    const cnameRecord = this.dnsRecords.find((r) => r.type === "CNAME")

    this.addFinding({
      id: "dns-a",
      category: "dns",
      severity: aRecord ? "low" : "critical",
      title: "DNS A Record",
      description: aRecord ? `A record: ${aRecord.value}` : "No A record found — site may be unreachable.",
      passed: !!aRecord,
    })
    this.addFinding({
      id: "dns-aaaa",
      category: "dns",
      severity: aaaaRecord ? "low" : "medium",
      title: "IPv6 (AAAA Record)",
      description: aaaaRecord ? `AAAA record: ${aaaaRecord.value}` : "No IPv6 record — limited to IPv4.",
      passed: !!aaaaRecord,
    })
    this.addFinding({
      id: "dns-mx",
      category: "dns",
      severity: mxRecords.length > 0 ? "low" : "high",
      title: "MX Records",
      description: mxRecords.length > 0 ? `${mxRecords.length} MX record(s) found.` : "No MX records — email delivery may fail.",
      passed: mxRecords.length > 0,
    })
    this.addFinding({
      id: "dns-ns",
      category: "dns",
      severity: nsRecords.length >= 2 ? "low" : "medium",
      title: "Nameservers",
      description: `${nsRecords.length} nameserver(s) found. ${nsRecords.length >= 2 ? "Redundant." : "At least 2 recommended for redundancy."}`,
      passed: nsRecords.length >= 2,
    })

    const hasDnssec = txtRecords.some((r) => r.value.includes("dnssec"))
    this.addFinding({
      id: "dns-dnssec",
      category: "dns",
      severity: hasDnssec ? "low" : "medium",
      title: "DNSSEC",
      description: hasDnssec ? "DNSSEC enabled." : "DNSSEC not detected — DNS spoofing possible.",
      passed: hasDnssec,
    })
  }

  private checkCert() {
    if (!this.cert) {
      this.addFinding({ id: "tls-unreachable", category: "tls", severity: "critical", title: "TLS Certificate Unreachable", description: "Could not verify TLS certificate.", passed: false })
      return
    }
    const issuer = typeof this.cert.issuer === "object" ? (this.cert.issuer as Record<string, string>).O || "Unknown" : this.cert.issuer
    this.addFinding({
      id: "tls-valid",
      category: "tls",
      severity: this.cert.valid ? "low" : "critical",
      title: "TLS Certificate Validity",
      description: this.cert.valid
        ? `Valid certificate from ${issuer}. ${this.cert.daysRemaining} days remaining.`
        : "Certificate is invalid or expired!",
      passed: this.cert.valid,
      remediationPrompt: !this.cert.valid ? "Renew your TLS certificate immediately." : undefined,
    })
    this.addFinding({
      id: "tls-expiry",
      category: "tls",
      severity: this.cert.daysRemaining < 30 ? "high" : this.cert.daysRemaining < 60 ? "medium" : this.cert.daysRemaining < 90 ? "low" : "info",
      title: "Certificate Expiry",
      description: `${this.cert.daysRemaining} days until certificate expires.`,
      passed: this.cert.daysRemaining > 30,
      remediationPrompt: this.cert.daysRemaining < 30 ? "Renew immediately! Auto-renewal recommended." : undefined,
    })
  }

  private checkUptime() {
    this.addFinding({
      id: "uptime-status",
      category: "uptime",
      severity: this.statusCode >= 200 && this.statusCode < 400 ? "low" : "critical",
      title: "HTTP Status",
      description: `Status: ${this.statusCode}${this.statusCode === 200 ? " OK" : ""}. Response: ${this.timingMs}ms.`,
      passed: this.statusCode >= 200 && this.statusCode < 400,
    })
  }

  private checkRedirects() {
    if (this.redirectChain.length <= 1) {
      this.addFinding({ id: "redirect-chain", category: "redirects", severity: "low", title: "Redirect Chain", description: "No redirects — direct access.", passed: true })
      return
    }
    const hops = this.redirectChain.length - 1
    this.addFinding({
      id: "redirect-chain",
      category: "redirects",
      severity: hops <= 1 ? "low" : hops <= 3 ? "medium" : "high",
      title: "Redirect Chain",
      description: `${hops} redirect(s): ${this.redirectChain.join(" → ")}`,
      passed: hops <= 1,
      remediationPrompt: hops > 1 ? "Reduce to 0-1 redirects for optimal performance and SEO." : undefined,
    })
  }

  private checkSecurityTxt() {
    this.addFinding({
      id: "security-txt",
      category: "security",
      severity: this.securityTxt ? "low" : "medium",
      title: "security.txt",
      description: this.securityTxt
        ? ".well-known/security.txt found — good security disclosure practice."
        : "No security.txt found. Add one for vulnerability disclosure.",
      passed: !!this.securityTxt,
    })
  }

  private getDns(): DNSCheck {
    return {
      hasA: !!this.dnsRecords.find((r) => r.type === "A"),
      hasAAAA: !!this.dnsRecords.find((r) => r.type === "AAAA"),
      hasCname: !!this.dnsRecords.find((r) => r.type === "CNAME"),
      hasMx: !!this.dnsRecords.find((r) => r.type === "MX"),
      hasTxt: !!this.dnsRecords.find((r) => r.type === "TXT"),
      hasNs: !!this.dnsRecords.find((r) => r.type === "NS"),
      dnssec: !!this.dnsRecords.find((r) => r.value.includes("dnssec")),
    }
  }

  private getEmailSecurity(): EmailSecurity {
    const txts = this.dnsRecords.filter((r) => r.type === "TXT").map((r) => r.value)
    return {
      spf: txts.some((t) => t.includes("v=spf1")),
      dkim: txts.some((t) => t.includes("dkim") || t.includes("o=~")),
      dmarc: txts.find((t) => t.includes("v=DMARC1")) || "Not found",
      bimi: txts.some((t) => t.includes("v=BIMI1")),
    }
  }

  private getCertInfo(): CertInfo {
    if (!this.cert) return { valid: false, issuer: "", daysRemaining: 0 }
    return { valid: this.cert.valid, issuer: typeof this.cert.issuer === "object" ? (this.cert.issuer as Record<string, string>).O || "Unknown" : this.cert.issuer, daysRemaining: this.cert.daysRemaining }
  }

  private calculateScore() {
    const passed = this.findings.filter((f) => f.passed).length
    const total = this.findings.length || 1
    this.score = Math.round((passed / total) * 100)
  }

  private getGrade(score: number): string {
    if (score >= 90) return "A+"
    if (score >= 80) return "A"
    if (score >= 70) return "B"
    if (score >= 60) return "C"
    return "D"
  }
}
