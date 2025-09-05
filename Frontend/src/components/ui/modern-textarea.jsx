import * as React from "react"
import { cn } from "@/lib/utils"

const textareaVariants = {
  default: "bg-white/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  filled: "bg-gray-50/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  error: "bg-red-50/50 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200",
  success: "bg-green-50/50 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200",
}

export const ModernTextarea = React.forwardRef(({
  className,
  variant = "default",
  label,
  error,
  success,
  helperText,
  maxLength,
  showCount = false,
  ...props
}, ref) => {
  const [charCount, setCharCount] = React.useState(0)

  const handleInput = (e) => {
    if (maxLength) {
      setCharCount(e.target.value.length)
    }
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          className={cn(
            "w-full rounded-lg border transition-all duration-200",
            "placeholder:text-gray-400",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-none",
            textareaVariants[error ? "error" : success ? "success" : variant],
            "min-h-[100px] p-4",
            className
          )}
          ref={ref}
          onInput={handleInput}
          maxLength={maxLength}
          {...props}
        />
        {showCount && maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {charCount}/{maxLength}
          </div>
        )}
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

ModernTextarea.displayName = "ModernTextarea" 