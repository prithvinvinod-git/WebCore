import { db } from "@/lib/firebase"
import type { ScanResult, MonitorConfig } from "@/types/scan"

const usersCol = () => db.collection("users")
const orgsCol = () => db.collection("organizations")
const scansCol = () => db.collection("scans")
const findingsCol = () => db.collection("findings")
const monitorsCol = () => db.collection("monitors")

export async function createUser(uid: string, data: { email: string; name?: string; avatar?: string }) {
  await usersCol().doc(uid).set({
    ...data,
    credits: 100,
    createdAt: new Date(),
    lastLogin: new Date(),
  })
}

export async function getUser(uid: string) {
  const doc = await usersCol().doc(uid).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

export async function updateUser(uid: string, data: Record<string, unknown>) {
  await usersCol().doc(uid).update(data)
}

export async function createScan(scan: ScanResult, userId?: string) {
  const { security, seo, aeo, performance, indexing, aiReadiness, domain, accessibility, ...scanData } = scan

  await scansCol().doc(scan.id).set({
    ...scanData,
    userId: userId || null,
    createdAt: new Date(scan.createdAt),
  })

  const moduleFindings = [
    ...(security?.findings ?? []).map((f) => ({ ...f, module: "security" })),
    ...(seo?.findings ?? []).map((f) => ({ ...f, module: "seo" })),
    ...(aeo?.findings ?? []).map((f) => ({ ...f, module: "aeo" })),
    ...(performance?.findings ?? []).map((f) => ({ ...f, module: "performance" })),
    ...(indexing?.findings ?? []).map((f) => ({ ...f, module: "indexing" })),
    ...(aiReadiness?.findings ?? []).map((f) => ({ ...f, module: "aiReadiness" })),
    ...(domain?.findings ?? []).map((f) => ({ ...f, module: "domain" })),
    ...(accessibility?.findings ?? []).map((f) => ({ ...f, module: "accessibility" })),
  ]

  if (moduleFindings.length > 0) {
    const batch = db.batch()
    for (const finding of moduleFindings) {
      const docId = `${scan.id}_${finding.id}`
      const ref = findingsCol().doc(docId)
      batch.set(ref, { ...finding, scanId: scan.id })
    }
    await batch.commit()
  }
}

export async function getScans(limit = 20, userId?: string) {
  let query = scansCol().orderBy("createdAt", "desc").limit(limit) as FirebaseFirestore.Query
  if (userId) {
    query = query.where("userId", "==", userId)
  }
  const snapshot = await query.get()
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as unknown as ScanResult[]
}

export async function getScan(id: string) {
  const doc = await scansCol().doc(id).get()
  if (!doc.exists) return null
  const scanData = doc.data()!
  return { ...scanData, id: doc.id } as unknown as ScanResult
}

export async function deleteScan(id: string) {
  await scansCol().doc(id).delete()
  const findings = await findingsCol().where("scanId", "==", id).get()
  if (findings.size > 0) {
    const batch = db.batch()
    findings.docs.forEach((d) => batch.delete(d.ref))
    await batch.commit()
  }
}

export async function getScanFindings(scanId: string): Promise<Record<string, unknown>[]> {
  const snapshot = await findingsCol().where("scanId", "==", scanId).get()
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getScanScores(scanId: string): Promise<Record<string, number>> {
  const scan = await getScan(scanId)
  if (!scan) return {}
  return {
    overall: scan.overallScore,
    security: scan.security?.score ?? 0,
    seo: scan.seo?.score ?? 0,
    aeo: scan.aeo?.score ?? 0,
    performance: scan.performance?.score ?? 0,
    indexing: scan.indexing?.score ?? 0,
    aiReadiness: scan.aiReadiness?.score ?? 0,
    domain: scan.domain?.score ?? 0,
    accessibility: scan.accessibility?.score ?? 0,
  }
}

export async function createMonitor(config: MonitorConfig & { scanId: string; userId?: string }) {
  const ref = monitorsCol().doc()
  await ref.set({ ...config, id: ref.id, userId: config.userId || null, createdAt: new Date(), lastRun: null })
  return { ...config, id: ref.id }
}

export async function getMonitors(userId?: string) {
  let query = monitorsCol().orderBy("createdAt", "desc") as FirebaseFirestore.Query
  if (userId) {
    query = query.where("userId", "==", userId)
  }
  const snapshot = await query.get()
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteMonitor(id: string) {
  await monitorsCol().doc(id).delete()
}

export async function updateMonitor(id: string, data: Partial<MonitorConfig>) {
  await monitorsCol().doc(id).update(data)
}

export async function getScanHistory(url: string, limit = 30) {
  const snapshot = await scansCol()
    .where("url", "==", url)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as unknown as ScanResult[]
}

export async function createApiKey(uid: string, name: string) {
  const key = `wc_${crypto.randomUUID().replace(/-/g, "")}`
  await usersCol().doc(uid).collection("apiKeys").add({ name, key, createdAt: new Date(), lastUsed: null })
  return key
}

export async function getApiKeys(uid: string) {
  const snapshot = await usersCol().doc(uid).collection("apiKeys").orderBy("createdAt", "desc").get()
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteApiKey(uid: string, keyId: string) {
  await usersCol().doc(uid).collection("apiKeys").doc(keyId).delete()
}
