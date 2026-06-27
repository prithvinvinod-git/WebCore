import { Nav } from "@/components/layout/nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
