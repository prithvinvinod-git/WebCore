import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import SplashLoader from "@/components/ui/splash-loader"

export const metadata: Metadata = {
  title: "WebCore — Website Diagnostic Brain",
  description:
    "Your Website's Complete Diagnostic Brain — Security, Visibility, Performance, AI Readiness.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-[#0a0a0a]">
        <Providers>
          <SplashLoader>{children}</SplashLoader>
        </Providers>
      </body>
    </html>
  )
}
