"use client"

export default function DocsLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href="#docs"
      onClick={(e) => {
        e.preventDefault()
        document.getElementById('docs')?.scrollIntoView({ behavior: 'smooth' })
      }}
      className="text-sm font-medium text-[#7a7676] hover:text-[#0a0a0a] transition-colors"
    >
      {children}
    </a>
  )
}
