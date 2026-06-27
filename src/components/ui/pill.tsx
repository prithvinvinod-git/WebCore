import { cn } from "@/lib/utils"

interface PillProps {
  variant?: "orange" | "green" | "violet" | "blue" | "default" | "success" | "error" | "warning"
  size?: "sm" | "md"
  children: React.ReactNode
  className?: string
}

export function Pill({ variant = "default", size = "sm", children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-inter font-medium leading-none",
        "px-[6px] py-[3px]",
        size === "md" && "px-3 py-1.5 text-xs",
        {
          "bg-[#ea580c]/10 text-[#ea580c]": variant === "orange",
          "bg-[#16a34a]/10 text-[#16a34a]": variant === "green",
          "bg-[#7c3aed]/10 text-[#7c3aed]": variant === "violet",
          "bg-[#3b82f6]/10 text-[#3b82f6]": variant === "blue",
          "bg-[#f5f5f5] text-[#525252]": variant === "default",
          "bg-[#dcfce7] text-[#16a34a]": variant === "success",
          "bg-[#fee2e2] text-[#dc2626]": variant === "error",
          "bg-[#fef3c7] text-[#d97706]": variant === "warning",
        },
        size === "sm" ? "text-[11px]" : "text-xs",
        className
      )}
    >
      {children}
    </span>
  )
}
