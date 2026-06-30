import Link from "next/link"
import { Shield } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#171717] dark:bg-black text-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Shield size={20} className="text-white" />
              <span className="text-sm font-medium">WebCore</span>
            </Link>
            <p className="text-xs text-[#a3a3a3] dark:text-neutral-500 mt-2 max-w-xs leading-relaxed">
              Your Website&apos;s Complete Diagnostic Brain — security, SEO, performance, and AI readiness in one scan.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#737373] dark:text-neutral-500 uppercase tracking-wider">Product</span>
              <Link href="/dashboard/new" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Scan</Link>
              <Link href="/dashboard" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/pricing" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#737373] dark:text-neutral-500 uppercase tracking-wider">Resources</span>
              <Link href="/docs" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Docs</Link>
              <Link href="/auth/login" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Sign in</Link>
              <Link href="/auth/signup" className="text-sm text-[#a3a3a3] dark:text-neutral-400 hover:text-white transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#333333] dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#737373] dark:text-neutral-500">
            &copy; {new Date().getFullYear()} WebCore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
