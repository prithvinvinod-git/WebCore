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
import { ThemeToggle } from "@/components/ui/theme-toggle"

const sidebarLinks = [
  {
    label: "Home",
    href: "/",
    icon: <IconHome className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <IconLayoutDashboard className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "New Scan",
    href: "/dashboard/new",
    icon: <IconScan className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "History",
    href: "/dashboard/history",
    icon: <IconHistory className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "Monitor",
    href: "/dashboard/monitor",
    icon: <IconChartLine className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "Benchmark",
    href: "/dashboard/benchmark",
    icon: <IconChartBar className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <IconSettings className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-300" />,
  },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-900">
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
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center px-3">
              <ThemeToggle />
            </div>
            <DashboardSidebarFooter serverSession={session} />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex-1 overflow-y-auto mt-[30px] pt-[100px] mb-5 bg-white dark:bg-neutral-950 border-t border-l border-neutral-200 dark:border-neutral-800 rounded-l-2xl">{children}</main>
    </div>
  )
}
