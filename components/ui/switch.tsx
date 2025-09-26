"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react"
import { cn } from "@/lib/utils"

const Switch = forwardRef<
  ElementRef<typeof SwitchPrimitives.Root>,
  ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitives.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
        className,
      )}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-1",
        )}
      />
    </SwitchPrimitives.Root>
  )
})

export { Switch }
