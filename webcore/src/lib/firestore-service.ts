import { db } from "@/lib/firebase"
import type { ScanResult, MonitorConfig } from "@/types/scan"

const scansCol = () => db.collection("scans")
const findingsCol = () => db.collection("findings")
const monitorsCol = () => db.collection("monitors")

export async function createScan(scan: ScanResult) {
  const { security, seo, aeo, performance, indexing, aiReadiness, domain, accessibility, ...scanData } = scan

  await scansCol().doc(scan.id).set({
    ...scanData,
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

export async function getScans(limit = 20) {
  const snapshot = await scansCol()
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get()
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id })) as unknown as ScanResult[]
}

export async function getScan(id: string) {
  const doc = await scansCol().doc(id).get()
  if (!doc.exists) return null
  const scanData = doc.data()!
  return { ...scanData, id: doc.id } as unknown as ScanResult
}

export async function getScanFindings(scanId: string): Promise<Record<string, unknown>[]> {
  const snapshot = await findingsCol().where("scanId", "==", scanId).get()
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createMonitor(config: MonitorConfig & { scanId: string }) {
  const ref = monitorsCol().doc()
  await ref.set({ ...config, id: ref.id, createdAt: new Date() })
  return { ...config, id: ref.id }
}

export async function getMonitors() {
  const snapshot = await monitorsCol().orderBy("createdAt", "desc").get()
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function deleteMonitor(id: string) {
  await monitorsCol().doc(id).delete()
}
