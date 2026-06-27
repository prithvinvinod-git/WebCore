import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "WebCore — Website Diagnostic Brain",
  description:
    "Your Website's Complete Diagnostic Brain — Security, Visibility, Performance, AI Readiness.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#0a0a0a] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
