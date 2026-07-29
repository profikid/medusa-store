import { cn } from "../lib/cn"
import type { HTMLAttributes, ReactNode } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean
  children?: ReactNode
}

export const Card = ({ raised, className, children, ...props }: CardProps) => {
  return (
    <div
      {...props}
      className={cn("dx-card", raised && "dx-card--raised", className)}
    >
      {children}
    </div>
  )
}

export interface KPICardProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
}

export const KPICard = ({ label, value, sub, icon }: KPICardProps) => {
  return (
    <div className="dx-card dx-card--kpi">
      {icon ? <div className="dx-card__ico">{icon}</div> : null}
      <div>
        <div className="dx-card__lbl">{label}</div>
        <div className="dx-card__val">{value}</div>
        {sub ? <div className="dx-card__sub">{sub}</div> : null}
      </div>
    </div>
  )
}

export interface StatProps {
  num: ReactNode
  lbl: ReactNode
}

export const Stat = ({ num, lbl }: StatProps) => {
  return (
    <div>
      <div className="dx-stat__num">{num}</div>
      <div className="dx-stat__lbl">{lbl}</div>
    </div>
  )
}
