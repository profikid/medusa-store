import type { ReactNode } from "react"

export interface AvatarProps {
  initials?: string
  children?: ReactNode
}

export const Avatar = ({ initials, children }: AvatarProps) => {
  return (
    <div className="dx-avatar" aria-label={initials}>
      {children ?? initials}
    </div>
  )
}
