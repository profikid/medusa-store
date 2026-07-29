# District X — Design System

A self-contained dark-themed design system for the Medusa admin, structured around the three pillars: **Smart Design · Smart Systems · Smart Future**.

## What's in here

```
design-system/
├── tokens.ts                  # Typed design tokens (color, type, spacing, motion, brand)
├── globals.css                # CSS variables + component classes (`.dx-scope` namespace)
├── lib/
│   └── cn.ts                  # Classname helper
├── components/
│   ├── Button.tsx             # 3 variants: primary, ghost, outline
│   ├── Card.tsx               # Card, KPICard, Stat
│   ├── Badge.tsx              # 5 variants: default, amber, success, info, warn
│   ├── Input.tsx              # Field, Input, Textarea
│   ├── Pillar.tsx             # 3 tones: amber, cobalt, emerald
│   ├── Lockup.tsx             # District X logo lockup (3 backdrops: dark, light, amber)
│   ├── Progress.tsx           # Meter bar
│   ├── Avatar.tsx             # Radius avatar
│   └── index.ts               # Barrel export
```

Outside the design-system folder, the implementation lands in:

- `apps/backend/src/admin/routes/design-system/page.tsx` — full demo page at `/app/design-system`
- `apps/backend/src/admin/widgets/design-system-overview.tsx` — KPI widget on order details

## Design language

| Token         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Surface       | `#050505` → `#1A1A1A` (4 levels)                            |
| Brand amber   | `#E89A1F` (accent) — only color that carries meaning       |
| Pillar cobalt | `#2E78D2` (systems)                                        |
| Pillar emerald| `#2EA66F` (future)                                         |
| Display       | Space Grotesk · Inter · JetBrains Mono                      |
| Grid          | 4pt spacing (`--dx-s-1` … `--dx-s-9`)                      |
| Radii         | 4 / 8 / 12 / 18 / pill                                     |
| Motion        | `cubic-bezier(0.2, 0.8, 0.2, 1)`, 120 / 220 / 420 ms       |

## Usage

### 1. Drop styles into a page

```tsx
// routes/your-page/page.tsx
import "../../design-system/globals.css"

export default function YourPage() {
  return (
    <div className="dx-scope">
      <h1 className="dx-display-xl">Building Intelligent Spaces.</h1>
      <p className="dx-body">We don't just build technology.</p>
    </div>
  )
}
```

The `.dx-scope` class isolates District X from Medusa's own UI tokens, so styles don't bleed.

### 2. Use the components

```tsx
import { Button, KPICard, Badge, Progress, Pillar, Lockup } from "../../design-system/components"

<Button variant="primary">Ship it</Button>
<KPICard label="Runway" value="6.2 mo" sub="burn €6.7K/m" />
<Badge variant="success" dot>Live</Badge>
<Progress value={72} label="Fill rate" />
<Lockup variant="dark" label="PRIMARY · DARK" />
```

### 3. Reference tokens directly

```tsx
import { color, font, radius, spacing } from "../../design-system/tokens"

const heroStyle = {
  background: color.surface.base,
  color: color.text.hundred,
  fontFamily: font.display,
  borderRadius: radius.r3,
  padding: spacing.s5,
}
```

## Demo

Start the dev server and visit:

- `/app/design-system` — full design system page
- Orders → any order → scroll down to see the District X KPI widget

```bash
cd apps/backend
pnpm run dev
```

## Architecture notes

- **Scoped styles.** All classes are prefixed `dx-` and wrapped in `.dx-scope` to avoid colliding with Medusa's own UI tokens. Drop the wrapper class if you want DX to be the global admin skin.
- **No runtime dependencies.** Pure CSS variables + React component wrappers. No Tailwind, no styled-components, no emotion.
- **Tokens are typed.** `tokens.ts` exports `as const` objects so TypeScript catches typos and you get autocomplete in IDEs.
- **Lockup is inline SVG.** No external file dependency — works in any build pipeline.
- **Vite picks up globals.css** because the route imports it at the top. Vite is already configured for CSS in Medusa's admin pipeline.

## Extending

Add a new component:

1. Create `components/YourThing.tsx` using `cx` from `../lib/cn`.
2. Add styles to `globals.css` under `.dx-*` namespace.
3. Export from `components/index.ts`.
4. (Optional) Add new tokens to `tokens.ts` and corresponding CSS variables.

## Why no Tailwind?

Medusa's admin build uses Vite without a Tailwind pipeline by default. The scoped CSS approach keeps the package weight at zero — no new deps, no PostCSS config, no Tailwind preset choreography. If you want Tailwind later, copy tokens into `tailwind.config.ts` and import where needed.
