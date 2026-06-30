import { getSession } from "@/lib/session"
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "@/components/ui/sidebar"
import {
  IconLayoutDashboard,
  IconScan,
  IconHistory,
  IconChartLine,
  IconChartBar,
  IconSettings,
  IconHome,
} from "@tabler/icons-react"
import { DashboardSidebarFooter } from "@/components/layout/dashboard-sidebar-footer"
import { SidebarLogo } from "@/components/layout/sidebar-logo"

const sidebarLinks = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconLayoutDashboard className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "New Scan",
    href: "/dashboard/new",
    icon: <IconScan className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: <IconHistory className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "Monitor",
    href: "/dashboard/monitor",
    icon: <IconChartLine className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "Benchmark",
    href: "/dashboard/benchmark",
    icon: <IconChartBar className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <IconSettings className="h-6 w-6 shrink-0 text-neutral-700" />,
  },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <SidebarLogo />
            <div className="mt-2 flex flex-col gap-1">
              {sidebarLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <DashboardSidebarFooter serverSession={session} />
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 pl-[75px] pt-[100px] mb-5">
        <div className="flex h-full w-full flex-1 flex-col rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
