import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

const selectVariants = {
  default: "bg-white/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  filled: "bg-gray-50/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  error: "bg-red-50/50 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200",
  success: "bg-green-50/50 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200",
}

const selectSizes = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-sm px-4",
  lg: "h-12 text-base px-4",
}

export const ModernSelect = React.forwardRef(({
  className,
  variant = "default",
  size = "md",
  label,
  error,
  success,
  helperText,
  options = [],
  placeholder = "Select an option",
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            "w-full rounded-lg border transition-all duration-200",
            "appearance-none",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectVariants[error ? "error" : success ? "success" : variant],
            selectSizes[size],
            "pr-10",
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="" disabled selected>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="size-4 text-gray-400" />
        </div>
      </div>
      {(error || helperText) && (
        <p className={cn(
          "text-sm",
          error ? "text-red-500" : "text-gray-500"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

ModernSelect.displayName = "ModernSelect" 