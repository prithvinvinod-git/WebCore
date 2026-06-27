import { forwardRef, type InputHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm text-[#525252] mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-[10px]",
          "text-sm text-[#0a0a0a] placeholder:text-[#a3a3a3]",
          "focus:outline-none focus:border-[#0a0a0a] focus:shadow-[rgba(0,0,0,0.1)_0px_0px_0px_4px]",
          "transition-all duration-150",
          className
        )}
        {...props}
      />
    </div>
  )
)
Input.displayName = "Input"

export { Input }
