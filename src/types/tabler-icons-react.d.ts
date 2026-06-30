declare module "@tabler/icons-react" {
  import React from "react"

  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string
    stroke?: number | string
    className?: string
  }

  export type Icon = React.FC<IconProps>

  export const IconLayoutDashboard: Icon
  export const IconScan: Icon
  export const IconHistory: Icon
  export const IconChartLine: Icon
  export const IconChartBar: Icon
  export const IconSettings: Icon
  export const IconMenu2: Icon
  export const IconX: Icon
  export const IconArrowLeft: Icon
  export const IconBrandTabler: Icon
  export const IconUserBolt: Icon
  export const IconHome: Icon
  export const IconLogout: Icon
  export const IconUser: Icon
  export const IconChevronUp: Icon
}
