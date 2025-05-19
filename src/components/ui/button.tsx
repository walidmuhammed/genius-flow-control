
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90 shadow-lg shadow-[#DC291E]/20",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20",
        outline:
          "border border-input bg-background/30 backdrop-blur-lg hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-[#26A4DB] text-white hover:bg-[#26A4DB]/90 backdrop-blur-sm shadow-lg shadow-[#26A4DB]/20",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-[#DC291E] underline-offset-4 hover:underline",
        premium: "bg-gradient-to-r from-[#DC291E] to-[#26A4DB] text-white hover:shadow-lg hover:shadow-[#DC291E]/30 shadow-md shadow-[#DC291E]/20"
      },
      size: {
        default: "h-10 px-4 py-2 rounded-lg",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
      status: {
        all: "bg-[#DC291E] text-white hover:bg-[#DC291E]/90",
        new: "bg-[#26A4DB] text-white hover:bg-[#26A4DB]/90",
        pending: "bg-orange-500 text-white hover:bg-orange-600",
        progress: "bg-amber-500 text-white hover:bg-amber-600", 
        successful: "bg-emerald-500 text-white hover:bg-emerald-600",
        unsuccessful: "bg-rose-600 text-white hover:bg-rose-700",
        returned: "bg-sky-400 text-white hover:bg-sky-500",
        paid: "bg-gray-500 text-white hover:bg-gray-600",
      }
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
  status?: "all" | "new" | "pending" | "progress" | "successful" | "unsuccessful" | "returned" | "paid"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, status, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // If status is provided, use it as the variant
    const variantToUse = status || variant
    
    return (
      <Comp
        className={cn(buttonVariants({ variant: variantToUse as any, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
