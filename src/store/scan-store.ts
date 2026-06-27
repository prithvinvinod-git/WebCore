"use client"
import { create } from "zustand"
import type { ScanResult } from "@/types/scan"

interface ScanStore {
  scans: ScanResult[]
  currentScan: ScanResult | null
  isScanning: boolean
  scanProgress: number
  setScans: (scans: ScanResult[]) => void
  setCurrentScan: (scan: ScanResult | null) => void
  setIsScanning: (val: boolean) => void
  setScanProgress: (val: number) => void
  addScan: (scan: ScanResult) => void
}

export const useScanStore = create<ScanStore>((set) => ({
  scans: [],
  currentScan: null,
  isScanning: false,
  scanProgress: 0,
  setScans: (scans) => set({ scans }),
  setCurrentScan: (scan) => set({ currentScan: scan }),
  setIsScanning: (val) => set({ isScanning: val }),
  setScanProgress: (val) => set({ scanProgress: val }),
  addScan: (scan) => set((state) => ({ scans: [scan, ...state.scans.filter((s) => s.id !== scan.id)] })),
}))
