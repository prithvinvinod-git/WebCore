"use client"

import { useEffect } from "react"
import { doc, onSnapshot } from "firebase/firestore"
import { clientDb } from "@/lib/firebase-client"
import { useScanStore } from "@/store/scan-store"
import type { ScanResult } from "@/types/scan"

export function useScanListener(scanId: string | null) {
  const { setCurrentScan, setScanProgress, setIsScanning } = useScanStore()

  useEffect(() => {
    if (!scanId) return

    const unsub = onSnapshot(
      doc(clientDb, "scans", scanId),
      (snap) => {
        if (!snap.exists()) return
        const data = { id: snap.id, ...snap.data() } as ScanResult

        if (data.status === "running" || data.status === "pending") {
          setIsScanning(true)
          setScanProgress(data.status === "running" ? 50 : 10)
        } else {
          setIsScanning(false)
          setScanProgress(100)
        }

        setCurrentScan(data)
      },
      (err) => {
        console.error("Scan listener error:", err)
        setIsScanning(false)
      }
    )

    return () => unsub()
  }, [scanId, setCurrentScan, setScanProgress, setIsScanning])
}
