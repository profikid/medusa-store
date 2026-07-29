import { cn } from "../lib/cn"
import type { ButtonHTMLAttributes, ReactNode } from "react"

export type ButtonVariant = "primary" | "ghost" | "outline"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: ReactNode
  children?: ReactNode
}

export const Button = ({
  variant = "primary",
  icon,
  children,
  className,
  ...props
}: ButtonProps) => {
  return (
    <button
      {...props}
      className={cn(
        "dx-btn",
        variant === "primary" && "dx-btn--primary",
        variant === "ghost" && "dx-btn--ghost",
        variant === "outline" && "dx-btn--outline",
        className
      )}
    >
      {icon}
      {children}
    </button>
  )
}
