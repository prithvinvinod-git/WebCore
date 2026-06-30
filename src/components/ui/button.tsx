import { forwardRef, type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "link"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-inter font-medium transition-all duration-150",
        "focus:outline-none focus:ring-[3px] focus:ring-black/10",
        {
          "bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] shadow-[rgba(0,0,0,0.05)_0px_1px_2px_0px] hover:bg-[#1a1a1a] dark:hover:bg-neutral-200":
            variant === "primary",
          "bg-transparent text-[#0a0a0a] dark:text-white border border-[#d4d4d4] dark:border-neutral-600 hover:border-[#a3a3a3] dark:hover:border-neutral-400":
            variant === "ghost",
          "bg-transparent text-[#0a0a0a] dark:text-white underline-offset-4 hover:underline":
            variant === "link",
        },
        {
          "rounded-full": variant !== "link",
          "px-4 py-[6px] text-sm": size === "sm",
          "px-5 py-[9px] text-sm": size === "md",
          "px-6 py-[11px] text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps }
