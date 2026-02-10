"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Eye, EyeOff } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    icons?: boolean
  }
>(({ className, icons, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      icons ? "h-6 w-11" : "h-5 w-9",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "group pointer-events-none flex items-center justify-center rounded-full bg-background shadow-lg ring-0 transition-transform",
        icons
          ? "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          : "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    >
      {icons && (
        <>
          <Eye className="hidden h-3 w-3 text-muted-foreground group-data-[state=checked]:block" />
          <EyeOff className="hidden h-3 w-3 text-muted-foreground group-data-[state=unchecked]:block" />
        </>
      )}
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
