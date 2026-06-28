import { getSession } from "@/lib/session"
import { Nav } from "@/components/layout/nav"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Nav serverSession={session} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
