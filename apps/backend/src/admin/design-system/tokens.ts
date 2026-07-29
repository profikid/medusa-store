/**
 * District X — Design System Tokens
 * Source: District X Design System & Brand v1.0
 *
 * Single source of truth for color, radius, spacing, typography, motion.
 * Use these exports with the matching CSS variables in ./globals.css.
 */

export const color = {
  surface: {
    void:   "#050505",
    base:   "#0A0A0A",
    raised: "#111111",
    inset:  "#1A1A1A",
  },
  border: {
    default: "#232323",
    strong:  "#2E2E2E",
  },
  text: {
    hundred: "#F5F5F5",
    eighty:  "#CFCFCF",
    sixty:   "#8E8E8E",
    forty:   "#5A5A5A",
    twenty:  "#333333",
  },
  amber: {
    100: "#F9D78A",
    200: "#F4B33A",
    300: "#E89A1F",
    400: "#C97A0E",
    500: "#8A5408",
    glow: "rgba(232,154,31,0.22)",
  },
  supporting: {
    cobalt:     "#2E78D2",
    cobaltSoft: "#1E4F94",
    emerald:    "#2EA66F",
    rose:       "#D24545",
    slate:      "#6B6B6B",
  },
  light: {
    cream: "#F5F2EC",
    ink:   "#1A1A1A",
  },
} as const

export const font = {
  sans:    "'Inter', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
  display: "'Space Grotesk', 'Inter', sans-serif",
  mono:    "'JetBrains Mono', ui-monospace, monospace",
} as const

export const radius = {
  r1:    "4px",
  r2:    "8px",
  r3:    "12px",
  r4:    "18px",
  pill:  "999px",
} as const

export const spacing = {
  s1:  "4px",
  s2:  "8px",
  s3:  "12px",
  s4:  "16px",
  s5:  "24px",
  s6:  "32px",
  s7:  "48px",
  s8:  "64px",
  s9:  "96px",
} as const

export const elevation = {
  e1:    "0 1px 0 rgba(255,255,255,0.02) inset, 0 8px 24px rgba(0,0,0,0.4)",
  e2:    "0 1px 0 rgba(255,255,255,0.04) inset, 0 16px 40px rgba(0,0,0,0.55)",
  glow:  "0 0 0 1px #E89A1F, 0 0 24px rgba(232,154,31,0.22)",
} as const

export const motion = {
  ease:    "cubic-bezier(0.2, 0.8, 0.2, 1)",
  fast:    "120ms",
  base:    "220ms",
  slow:    "420ms",
} as const

export const type = {
  displayXl: {
    family: font.display,
    size:   "56px",
    weight: 700,
    lineHeight: 1,
    letterSpacing: "-0.02em",
  },
  displayLg: {
    family: font.display,
    size:   "36px",
    weight: 600,
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  },
  displayMd: {
    family: font.display,
    size:   "24px",
    weight: 600,
    lineHeight: 1.2,
  },
  eyebrow: {
    family: font.mono,
    size:   "11px",
    weight: 600,
    letterSpacing: "3px",
    textTransform: "uppercase" as const,
    color:  color.amber[300],
  },
  body: {
    family: font.sans,
    size:   "16px",
    weight: 400,
    lineHeight: 1.65,
    color:  color.text.eighty,
  },
  caption: {
    family: font.sans,
    size:   "12px",
    weight: 400,
    color:  color.text.sixty,
  },
  mono: {
    family: font.mono,
    size:   "13px",
    weight: 400,
    color:  color.text.eighty,
  },
} as const

export const brand = {
  name:       "District X",
  shortMark:  "DX",
  tagline:    "Building Intelligent Spaces.",
  promise:    "We don't just build technology. We build the future of living.",
  pillars: [
    { key: "design",  label: "Smart Design",  color: "amber",   num: "01" },
    { key: "systems", label: "Smart Systems", color: "cobalt",  num: "02" },
    { key: "future",  label: "Smart Future",  color: "emerald", num: "03" },
  ],
} as const

export const semantic = {
  primary:   color.amber[300],
  onPrimary: color.surface.base,
  surface: {
    base:   color.surface.base,
    raised: color.surface.raised,
    inset:  color.surface.inset,
  },
  fg: {
    default: color.text.hundred,
    muted:   color.text.sixty,
    subtle:  color.text.forty,
  },
  divider:   color.border.default,
  ring:      color.amber[300],
  success:   color.supporting.emerald,
  warning:   color.amber[300],
  danger:    color.supporting.rose,
  info:      color.supporting.cobalt,
} as const

export type ColorTokens       = typeof color
export type FontTokens        = typeof font
export type RadiusTokens      = typeof radius
export type SpacingTokens     = typeof spacing
export type ElevationTokens   = typeof elevation
export type MotionTokens      = typeof motion
export type TypeTokens        = typeof type
export type BrandTokens       = typeof brand
export type SemanticTokens    = typeof semantic
