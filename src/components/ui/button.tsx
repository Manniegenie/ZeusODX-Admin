import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary purple button - white text
        default: "bg-[#35297F] text-white hover:bg-[#2a1f66] focus-visible:ring-[#7C6BFF]/30",
        // Destructive red button - white text
        destructive:
          "bg-[#FF4444] text-white hover:bg-[#cc3636] focus-visible:ring-[#FF4444]/30",
        // Outline button - white bg, purple border/text
        outline:
          "border border-[#35297F] bg-white text-[#35297F] shadow-xs hover:bg-[#F4F2FF]",
        // Secondary purple button - white text
        secondary:
          "bg-[#7C6BFF] text-white hover:bg-[#6a5be6]",
        // Ghost button - transparent bg, dark text for visibility
        ghost:
          "bg-transparent text-[#1A1A1A] hover:bg-gray-100",
        // Link style - dark text
        link: "text-[#1A1A1A] underline-offset-4 hover:underline",
        // Success button - white text
        success: "bg-[#00C851] text-white hover:bg-[#00a844] focus-visible:ring-[#00C851]/30",
        // Warning button - white text
        warning: "bg-[#FF8800] text-white hover:bg-[#e67a00] focus-visible:ring-[#FF8800]/30",
        // Accent pink button - white text
        accent: "bg-[#FF6B9D] text-white hover:bg-[#e65a8a] focus-visible:ring-[#FF6B9D]/30",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
