import { cn } from "../lib/cn"
import type { HTMLAttributes, ReactNode } from "react"

export type BadgeVariant = "default" | "amber" | "success" | "info" | "warn"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  children: ReactNode
}

export const Badge = ({
  variant = "default",
  dot,
  className,
  children,
  ...props
}: BadgeProps) => {
  return (
    <span
      {...props}
      className={cn(
        "dx-badge",
        variant === "amber" && "dx-badge--amber",
        variant === "success" && "dx-badge--success",
        variant === "info" && "dx-badge--info",
        variant === "warn" && "dx-badge--warn",
        className
      )}
    >
      {dot ? <span className="dx-badge__dot" /> : null}
      {children}
    </span>
  )
}
