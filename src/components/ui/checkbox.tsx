
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Red rectangular (soft box) checkbox, vivid red border, white background,
// vivid red bg + white check when checked, crisp corners
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Boxy, crisp shape: barely rounded corners, red border always, white bg until checked
      "peer h-5 w-5 min-w-[20px] min-h-[20px] shrink-0 rounded-sm border-2 border-[#DB271E] shadow-sm bg-white " +
      // Focus ring and disabled styling
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB271E]/40 focus-visible:ring-offset-2 " +
      "disabled:cursor-not-allowed disabled:opacity-50 " +
      // Checked styles: solid red bg, border, white checkmark
      "data-[state=checked]:bg-[#DB271E] data-[state=checked]:border-[#DB271E] data-[state=checked]:text-white " +
      // Hover states
      "hover:border-[#B31B16] data-[state=checked]:hover:bg-[#B31B16] data-[state=checked]:hover:border-[#B31B16] " +
      "transition-all duration-200",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
export { Checkbox }
