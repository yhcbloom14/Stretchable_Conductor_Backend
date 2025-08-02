import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        warning:
          "border-orange-500/50 text-orange-600 bg-orange-50 dark:border-orange-500 dark:bg-orange-950 dark:text-orange-400 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400",
        success:
          "border-green-500/50 text-green-600 bg-green-50 dark:border-green-500 dark:bg-green-950 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        info:
          "border-blue-500/50 text-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & {
    showIcon?: boolean
  }
>(({ className, variant, showIcon = true, children, ...props }, ref) => {
  const Icon = React.useMemo(() => {
    switch (variant) {
      case "destructive":
        return AlertCircle
      case "warning":
        return AlertTriangle
      case "success":
        return CheckCircle2
      case "info":
        return Info
      default:
        return Info
    }
  }, [variant])

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <div>{children}</div>
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }