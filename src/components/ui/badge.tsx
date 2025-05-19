
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-topspeed-600 text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground", 
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground border-border backdrop-blur-sm",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-muted",
        premium: "border-transparent bg-gradient-to-r from-topspeed-500 to-topspeed-700 text-primary-foreground shadow-inner shadow-white/10"
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px] font-medium",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
