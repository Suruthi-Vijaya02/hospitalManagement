import * as React from "react"
import { cn } from "@/lib/utils"

const badgeVariants = (variant) => cn(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80": variant === "default" || !variant,
    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80": variant === "destructive",
    "text-foreground": variant === "outline",
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants(variant), className)} {...props} />
  )
}

export { Badge, badgeVariants }
