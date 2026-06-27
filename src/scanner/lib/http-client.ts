import https from "node:https"
import tls from "node:tls"
import type { PeerCertificate } from "node:tls"
import * as cheerio from "cheerio"

export interface FetchResult {
  html: string
  $: cheerio.CheerioAPI | null
  headers: Record<string, string>
  statusCode: number
  timingMs: number
  finalUrl: string
  redirectChain: string[]
}

export interface DnsRecord {
  type: string
  value: string
  ttl?: number
}

export interface CertInfo {
  valid: boolean
  issuer: Record<string, string> | string
  subject: Record<string, string> | string
  validFrom: string
  validTo: string
  daysRemaining: number
  fingerprint: string
}

const TIMEOUT = 15000

export async function fetchUrl(url: string, redirectLimit = 5): Promise<FetchResult> {
  const start = Date.now()
  const redirectChain: string[] = []
  const visited = new Set<string>()
  let currentUrl = url
  let response: Response | null = null
  let html = ""

  for (let i = 0; i <= redirectLimit; i++) {
    if (visited.has(currentUrl)) break
    visited.add(currentUrl)
    redirectChain.push(currentUrl)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), TIMEOUT)

      response = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "WebCore/1.0 (Diagnostic Scanner; +https://webcore.app)" },
      })
      clearTimeout(timeout)

      const status = response.status
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers.get("location")
        if (!location) break
        currentUrl = new URL(location, currentUrl).toString()
        continue
      }

      html = await response.text()
      break
    } catch {
      break
    }
  }

  let $: cheerio.CheerioAPI | null = null
  try {
    $ = cheerio.load(html)
  } catch {
    $ = null
  }

  const headers: Record<string, string> = {}
  if (response) {
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value
    })
  }

  return {
    html,
    $,
    headers,
    statusCode: response?.status ?? 0,
    timingMs: Date.now() - start,
    finalUrl: currentUrl,
    redirectChain,
  }
}

export async function checkTlsCert(hostname: string): Promise<CertInfo | null> {
  return new Promise((resolve) => {
    try {
      const socket = tls.connect(443, hostname, { servername: hostname, timeout: TIMEOUT }, () => {
        const cert = socket.getPeerCertificate() as PeerCertificate
        if (!cert || Object.keys(cert).length === 0) {
          socket.destroy()
          resolve(null)
          return
        }
        const validTo = new Date(cert.valid_to)
        const daysRemaining = Math.max(0, Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        socket.destroy()
        resolve({
          valid: daysRemaining > 0,
          issuer: typeof cert.issuer === "object" ? Object.fromEntries(Object.entries(cert.issuer).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")]).filter(([_, v]) => v)) : (cert.issuer || "") as string,
          subject: typeof cert.subject === "object" ? Object.fromEntries(Object.entries(cert.subject).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : String(v ?? "")]).filter(([_, v]) => v)) : (cert.subject || "") as string,
          validFrom: cert.valid_from || "",
          validTo: cert.valid_to || "",
          daysRemaining,
          fingerprint: cert.fingerprint || "",
        })
      })
      socket.on("error", () => { socket.destroy(); resolve(null) })
      socket.on("timeout", () => { socket.destroy(); resolve(null) })
    } catch {
      resolve(null)
    }
  })
}

export async function checkDns(hostname: string): Promise<DnsRecord[]> {
  const records: DnsRecord[] = []
  const dohUrls = [
    `https://cloudflare-dns.com/dns-query?name=${hostname}&type=ALL`,
    `https://dns.google/resolve?name=${hostname}&type=ALL`,
  ]

  for (const dohUrl of dohUrls) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(dohUrl, {
        headers: { Accept: "application/dns-json" },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) continue
      const data = await res.json() as { Answer?: Array<{ name: string; type: number; TTL: number; data: string }> }
      if (data.Answer) {
        for (const ans of data.Answer) {
          const typeMap: Record<number, string> = {
            1: "A", 28: "AAAA", 5: "CNAME", 15: "MX", 16: "TXT",
            2: "NS", 6: "SOA", 33: "SRV", 257: "CAA",
          }
          records.push({
            type: typeMap[ans.type] || `TYPE${ans.type}`,
            value: ans.data,
            ttl: ans.TTL,
          })
        }
      }
      if (records.length > 0) break
    } catch {
      continue
    }
  }
  return records
}

export async function checkRobotsTxt(hostname: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`https://${hostname}/robots.txt`, { signal: controller.signal })
    clearTimeout(timeout)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export async function checkSitemapXml(hostname: string): Promise<string | null> {
  const urls = [
    `https://${hostname}/sitemap.xml`,
    `https://${hostname}/sitemap_index.xml`,
    `https://${hostname}/sitemap/`,
  ]
  for (const url of urls) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(url, { signal: controller.signal })
      clearTimeout(timeout)
      if (!res.ok) continue
      return await res.text()
    } catch {
      continue
    }
  }
  return null
}

export async function checkPageSpeed(url: string, apiKey?: string): Promise<Record<string, number> | null> {
  if (apiKey) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(
        `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile`,
        { signal: controller.signal }
      )
      clearTimeout(timeout)
      if (!res.ok) return null
      const data = await res.json() as Record<string, unknown>
      const categories = (data as { lighthouseResult?: { categories?: Record<string, { score?: number }> } }).lighthouseResult?.categories
      if (categories) {
        return Object.fromEntries(
          Object.entries(categories).map(([k, v]) => [k, Math.round((v.score ?? 0) * 100)])
        )
      }
    } catch {
      return null
    }
  }
  return null
}
