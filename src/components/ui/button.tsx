import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // Primary purple button - uses CSS var so dark mode can shift it brighter
        default: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/30",
        // Destructive red button - white text
        destructive:
          "bg-[#FF4444] text-white hover:bg-[#cc3636] focus-visible:ring-[#FF4444]/30",
        // Outline button - card bg, purple border/text, dark mode aware
        outline:
          "border border-primary bg-card text-primary shadow-xs hover:bg-muted/40 dark:border-primary dark:text-primary dark:bg-card dark:hover:bg-muted/40",
        // Secondary purple button - white text
        secondary:
          "bg-[#7C6BFF] text-white hover:bg-[#6a5be6]",
        // Ghost button - transparent bg, semantic text
        ghost:
          "bg-transparent text-foreground hover:bg-muted/40",
        // Link style - semantic text
        link: "text-foreground underline-offset-4 hover:underline",
        // Success button - white text
        success: "bg-[#00C851] text-white hover:bg-[#00a844] focus-visible:ring-[#00C851]/30",
        // Warning button - white text
        warning: "bg-[#FF8800] text-white hover:bg-[#e67a00] focus-visible:ring-[#FF8800]/30",
        // Accent pink button - white text
        accent: "bg-[#FF6B9D] text-white hover:bg-[#e65a8a] focus-visible:ring-[#FF6B9D]/30",
      },
      size: {
        default: "h-8 px-3 py-1.5 text-sm has-[>svg]:px-2.5",
        sm: "h-7 rounded-md gap-1 px-2.5 text-xs has-[>svg]:px-2",
        lg: "h-9 rounded-md px-4 has-[>svg]:px-3",
        xl: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-8",
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
