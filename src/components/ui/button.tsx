
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-topspeed-600 text-white hover:bg-topspeed-700 shadow-sm shadow-topspeed-600/10",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/10",
        outline:
          "border border-input bg-background/80 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-muted text-muted-foreground hover:bg-muted/80 backdrop-blur-sm",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-topspeed-600 underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-topspeed-600 to-topspeed-800 text-white hover:from-topspeed-700 hover:to-topspeed-900 shadow-md shadow-topspeed-700/20"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
