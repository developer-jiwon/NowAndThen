import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-white/70 backdrop-blur border border-pink-100/60 shadow hover:shadow-pink-200/60 hover:bg-pink-50/80 active:bg-pink-100/80",
  {
    variants: {
      variant: {
        default: "bg-white/70 text-pink-600 border-pink-100/60 hover:bg-pink-50/80 hover:text-pink-700 active:bg-pink-100/80",
        destructive:
          "bg-red-100/80 text-red-700 border-red-200 hover:bg-red-200/80 hover:text-red-800 active:bg-red-300/80",
        outline:
          "border border-gray-200 bg-white/70 text-gray-700 hover:bg-gray-50/80 hover:text-gray-900 active:bg-gray-100/80",
        secondary:
          "bg-blue-100/80 text-blue-700 border-blue-200 hover:bg-blue-200/80 hover:text-blue-800 active:bg-blue-300/80",
        ghost: "hover:bg-gray-100/60 hover:text-gray-700",
        link: "text-pink-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
