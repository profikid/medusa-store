import { cn } from "../lib/cn"

export type LockupVariant = "dark" | "light" | "amber"

export interface LockupProps {
  variant?: LockupVariant
  label?: string
}

/**
 * Inline SVG lockup of the District X mark + wordmark.
 * Self-contained — no external SVG file needed.
 */
export const Lockup = ({ variant = "dark", label }: LockupProps) => {
  const isLight = variant === "light"
  const isAmber = variant === "amber"
  const idA = `dx-lk-a-${variant}`
  const idB = `dx-lk-b-${variant}`

  const gradA = (
    <linearGradient id={idA} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F4B33A" />
      <stop offset="100%" stopColor="#C97A0E" />
    </linearGradient>
  )
  const gradB = (
    <linearGradient id={idB} x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#F9C766" />
      <stop offset="100%" stopColor="#E89A1F" />
    </linearGradient>
  )

  const textFill = isLight ? "#1A1A1A" : "#F5F5F5"
  const tagFill = isAmber ? "#0A0A0A" : isLight ? "#8A5408" : "#E89A1F"
  const triFill = isAmber ? "#E89A1F" : isLight ? "#F5F2EC" : "#0A0A0A"
  const barAFill = isAmber ? "#0A0A0A" : `url(#${idA})`
  const barBFill = isAmber ? "#1A1A1A" : `url(#${idB})`

  return (
    <div
      className={cn(
        "dx-lockup",
        variant === "light" && "dx-lockup--light",
        variant === "amber" && "dx-lockup--amber"
      )}
    >
      <svg viewBox="0 0 320 120" aria-label="District X lockup">
        <defs>
          {gradA}
          {gradB}
        </defs>
        <g transform="translate(8,10)">
          <path d="M14 14 L36 14 L86 86 L64 86 Z" fill={barAFill} />
          <path d="M64 14 L86 14 L36 86 L14 86 Z" fill={barBFill} />
          <path d="M44 36 L66 50 L44 64 Z" fill={triFill} />
        </g>
        <text
          x="124"
          y="58"
          fontFamily="Inter, Arial"
          fontWeight="800"
          fontSize="32"
          letterSpacing="6"
          fill={textFill}
        >
          DISTRICT
        </text>
        <text
          x="268"
          y="58"
          fontFamily="Inter, Arial"
          fontWeight="800"
          fontSize="32"
          letterSpacing="6"
          fill={barAFill}
        >
          X
        </text>
        <text
          x="124"
          y="84"
          fontFamily="Inter, Arial"
          fontWeight="600"
          fontSize="11"
          letterSpacing="4"
          fill={tagFill}
        >
          BUILDING INTELLIGENT SPACES
        </text>
      </svg>
      {label ? <span className="dx-lockup__lbl">{label}</span> : null}
    </div>
  )
}
