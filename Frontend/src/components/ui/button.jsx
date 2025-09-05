import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  children,
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        {
          "bg-primary text-white hover:bg-primary/90": variant === "default",
          "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50": variant === "outline",
          "bg-transparent text-primary hover:bg-primary/10": variant === "ghost",
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          "h-9 px-3": size === "sm",
          "h-10 px-4": size === "default",
          "h-11 px-8": size === "lg",
        },
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"

export { Button }
