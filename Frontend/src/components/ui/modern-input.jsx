import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff, Search, Calendar, Clock, User, Mail, Phone, Lock, Check } from "lucide-react"

const inputVariants = {
  default: "bg-white/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  filled: "bg-gray-50/50 border-gray-200/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
  error: "bg-red-50/50 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200",
  success: "bg-green-50/50 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200",
}

const inputSizes = {
  sm: "h-8 text-sm px-3",
  md: "h-10 text-sm px-4",
  lg: "h-12 text-base px-4",
}

const iconVariants = {
  default: "text-gray-400",
  error: "text-red-500",
  success: "text-green-500",
}

export const ModernInput = React.forwardRef(({
  className,
  variant = "default",
  size = "md",
  type = "text",
  icon,
  label,
  error,
  success,
  helperText,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)

  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case "email":
        return <Mail className="size-4" />
      case "password":
        return <Lock className="size-4" />
      case "search":
        return <Search className="size-4" />
      case "tel":
        return <Phone className="size-4" />
      case "text":
        return <User className="size-4" />
      case "date":
        return <Calendar className="size-4" />
      case "time":
        return <Clock className="size-4" />
      default:
        return null
    }
  }

  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {getIcon() && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            iconVariants[error ? "error" : success ? "success" : "default"]
          }`}>
            {getIcon()}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            "w-full rounded-lg border transition-all duration-200",
            "placeholder:text-gray-400",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            inputVariants[error ? "error" : success ? "success" : variant],
            inputSizes[size],
            getIcon() && "pl-10",
            showPasswordToggle && "pr-10",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check className="size-4" />
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

ModernInput.displayName = "ModernInput" 