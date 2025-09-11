"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ checked, onCheckedChange, className, id, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "h-4 w-4 rounded border border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)

Checkbox.displayName = "Checkbox"

export { Checkbox }