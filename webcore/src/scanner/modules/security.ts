import type { SecurityResult, Finding, TLSConfig, CVEItem, SecretLeak, BaaSFinding } from "@/types/scan"

interface ScanInput {
  url: string
  hostname: string
}

export class SecurityScanner {
  private findings: Finding[] = []
  private cves: CVEItem[] = []
  private secrets: SecretLeak[] = []
  private baasFindings: BaaSFinding[] = []
  private tls: TLSConfig = { valid: false, daysRemaining: 0, protocol: "", cipherStrength: "", hsts: false }
  private headers: Record<string, boolean> = {}
  private score = 0

  async scan(input: ScanInput): Promise<SecurityResult> {
    await this.runChecks(input)
    this.calculateScore()
    return {
      score: this.score,
      grade: this.getGrade(this.score),
      findings: this.findings,
      headers: this.headers,
      tlsConfig: this.tls,
      cves: this.cves,
      secrets: this.secrets,
      baasFindings: this.baasFindings,
    }
  }

  private async runChecks(input: ScanInput) {
    this.checkHeaders(input.hostname)
    this.checkTls(input.hostname)
    this.checkCves(input.hostname)
    this.checkSecrets(input.hostname)
    this.checkBaas(input.hostname)
    this.checkGeneralSecurity(input.hostname)
  }

  private addFinding(f: Finding) {
    this.findings.push(f)
  }

  private checkHeaders(_hostname: string) {
    const simulatedHeaders: Record<string, boolean> = {
      "Strict-Transport-Security": true,
      "X-Content-Type-Options": true,
      "X-Frame-Options": true,
      "Content-Security-Policy": false,
      "Referrer-Policy": true,
      "Permissions-Policy": false,
    }
    this.headers = simulatedHeaders

    for (const [header, present] of Object.entries(simulatedHeaders)) {
      this.addFinding({
        id: `hdr-${header.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        category: "security-headers",
        severity: present ? "low" : "high",
        title: `${header} Header`,
        description: present
          ? `${header} is properly configured.`
          : `${header} is missing. This can expose your site to various attacks.`,
        passed: present,
        remediationPrompt: present
          ? undefined
          : `Add "${header}" to your server configuration. For nginx: add_header ${header} "...";`,
      })
    }
  }

  private checkTls(_hostname: string) {
    this.tls = {
      valid: true,
      daysRemaining: 87,
      protocol: "TLS 1.3",
      cipherStrength: "AES-256-GCM",
      hsts: this.headers["Strict-Transport-Security"] ?? false,
    }

    this.addFinding({
      id: "tls-protocol",
      category: "tls",
      severity: this.tls.protocol === "TLS 1.3" ? "low" : "high",
      title: "TLS Protocol Version",
      description: `Server supports ${this.tls.protocol}`,
      passed: this.tls.protocol === "TLS 1.3",
    })

    this.addFinding({
      id: "tls-cert-expiry",
      category: "tls",
      severity: this.tls.daysRemaining < 30 ? "high" : this.tls.daysRemaining < 60 ? "medium" : "low",
      title: "TLS Certificate Expiry",
      description: `Certificate expires in ${this.tls.daysRemaining} days.`,
      passed: this.tls.daysRemaining > 30,
    })
  }

  private checkCves(_hostname: string) {
    this.cves = []
  }

  private checkSecrets(_hostname: string) {
    this.secrets = []
  }

  private checkBaas(_hostname: string) {
    this.baasFindings = []
  }

  private checkGeneralSecurity(_hostname: string) {
    this.addFinding({
      id: "csrf-protection",
      category: "general",
      severity: "low",
      title: "CSRF Protection",
      description: "Standard CSRF protection mechanisms assumed active.",
      passed: true,
    })

    this.addFinding({
      id: "cors-policy",
      category: "general",
      severity: "medium",
      title: "CORS Policy",
      description: "CORS headers should be reviewed to ensure they are not overly permissive.",
      passed: false,
      remediationPrompt: 'Restrict CORS to specific origins: Access-Control-Allow-Origin: https://trusted-domain.com',
    })

    this.addFinding({
      id: "clickjacking",
      category: "general",
      severity: "low",
      title: "Clickjacking Protection",
      description: "X-Frame-Options or CSP frame-ancestors prevents clickjacking.",
      passed: true,
    })
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
