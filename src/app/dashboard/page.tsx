import { getSession } from "@/lib/session"
import { getScans } from "@/lib/firestore-service"
import DashboardView from "./dashboard-view"

export default async function DashboardPage() {
  const session = await getSession()
  let initialScans: import("@/types/scan").ScanResult[] = []

  if (session?.uid) {
    try {
      initialScans = await getScans(1000, session.uid)
    } catch (e: unknown) {
      console.error("Server-side getScans failed:", e instanceof Error ? e.message : String(e))
      try {
        initialScans = await getScans(1000, undefined)
      } catch {}
    }
  }

  return <DashboardView initialScans={initialScans} />
}
