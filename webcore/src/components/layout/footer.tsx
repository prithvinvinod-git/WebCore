export function Footer() {
  return (
    <footer className="bg-[#171717] text-white mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 py-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">WebCore</p>
          <p className="text-xs text-[#a3a3a3] mt-0.5">
            Your Website&apos;s Complete Diagnostic Brain
          </p>
        </div>
        <p className="text-xs text-[#737373]">
          &copy; {new Date().getFullYear()} WebCore. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
