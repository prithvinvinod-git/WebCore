import { cn } from "@/lib/utils"

interface BadgeProps {
  variant?: "default" | "orange" | "green" | "violet" | "blue" | "success" | "error" | "warning"
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
        {
          "bg-[#f5f5f5] text-[#525252]": variant === "default",
          "bg-[#ea580c] text-white": variant === "orange",
          "bg-[#16a34a] text-white": variant === "green",
          "bg-[#7c3aed] text-white": variant === "violet",
          "bg-[#3b82f6] text-white": variant === "blue",
          "bg-[#dcfce7] text-[#16a34a]": variant === "success",
          "bg-[#fee2e2] text-[#dc2626]": variant === "error",
          "bg-[#fef3c7] text-[#d97706]": variant === "warning",
        },
        className
      )}
    >
      {children}
    </span>
  )
}
