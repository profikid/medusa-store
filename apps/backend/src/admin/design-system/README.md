# District X — Design System

A dark-themed design system that **overrides Medusa's default admin theme** by re-pointing every CSS custom property Medusa UI uses. The whole admin re-skins automatically — components, widgets, tables, forms, navigation — without touching Medusa's source code.

## How it works

Medusa UI ships a Tailwind preset that references CSS variables (`--bg-base`, `--fg-subtle`, `--border-strong`, `--button-inverted`, `--tag-blue-bg`, …). The District X stylesheet overrides every one of those variables on `:root`, mapping them to `--dx-*` brand tokens. The existing Tailwind utility classes (`bg-ui-bg-base`, `text-ui-fg-subtle`, `bg-tag-blue-bg`, etc.) resolve to District X values automatically.

```
:root {
  --bg-base:  var(--dx-bg-1);   /* was  rgba(255,255,255,1) */
  --fg-base:  var(--dx-text-100); /* was  rgba(24,24,27,1) */
  --border-base: var(--dx-border); /* was  rgba(228,228,231,1) */
  --button-inverted: var(--dx-amber-300); /* was  rgba(39,39,42,1) */
  --tag-blue-bg: rgba(46,120,210,0.12); /* was  rgba(219,234,254,1) */
  ...
}
```

All 168 Medusa UI variables are overridden — `bg-*`, `fg-*`, `border-*`, `button-*`, `tag-*`, `contrast-*`, `details-*`, `borders-*`, `buttons-*`, `elevation-*`.

## How it's loaded

```
apps/backend/src/admin/widgets/district-x-install.tsx
  zone: "topbar"
  side-effect: import "../design-system/globals.css"
  renders: null
```

The widget lives on the `topbar` zone, which is mounted on every admin page. Its side-effect `import` of `globals.css` is what gets the stylesheet into the Vite bundle — Vite/Rollup picks the CSS up and emits it as part of the admin chunk. There's no `useEffect` magic, no DOM injection, no runtime fetch — the stylesheet rides along with the rest of the bundle.

The `useEffect(() => injectDXStyles(), [])` call uses a no-op marker today; it stays in place as a hook for future invariants (e.g. setting attributes on `<html>` after the CSS is available).

## What's in here

```
design-system/
├── tokens.ts                  # Typed design tokens (color, type, spacing, motion, brand)
├── globals.css                # :root overrides + DX component classes
├── inject.ts                  # Helper for future CSS-load invariants
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

- `apps/backend/src/admin/routes/design-system/page.tsx` — full demo route at `/app/design-system`
- `apps/backend/src/admin/widgets/district-x-install.tsx` — topbar widget that ships the CSS
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

### 1. Use DX components for new UI

```tsx
import { Button, KPICard, Badge, Progress, Pillar, Lockup } from "../design-system/components"

<Button variant="primary">Ship it</Button>
<KPICard label="Runway" value="6.2 mo" sub="burn €6.7K/m" />
<Badge variant="success" dot>Live</Badge>
<Progress value={72} label="Fill rate" />
<Lockup variant="dark" label="PRIMARY · DARK" />
```

### 2. Use existing Medusa UI components — they re-skin automatically

```tsx
import { Container, Heading, Text } from "@medusajs/ui"

// These render in District X colors because the CSS variables override
// the Tailwind preset's defaults at :root.
<Container>
  <Heading>Orders</Heading>
  <Text className="text-ui-fg-subtle">Last 30 days</Text>
</Container>
```

### 3. Reference tokens directly

```tsx
import { color, font, radius, spacing } from "../design-system/tokens"

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
- Anywhere else in the admin — the District X theme is applied globally

```bash
cd apps/backend
pnpm run dev
```

## Architecture notes

- **No scoping.** The override is global on `:root`. Every Medusa UI component re-skins automatically. No `.dx-scope` wrappers, no class whitelisting, no option toggles.
- **No runtime dependencies.** Pure CSS variables + React component wrappers. No Tailwind, no styled-components, no emotion.
- **Tokens are typed.** `tokens.ts` exports `as const` objects so TypeScript catches typos and you get IDE autocomplete.
- **Lockup is inline SVG.** No external file dependency — works in any build pipeline.
- **Vite picks up globals.css** via the side-effect import in `widgets/district-x-install.tsx`. That single import is the only thing the bundler needs to ship the theme system-wide.

## Extending

Add a new component:

1. Create `components/YourThing.tsx` using `cn` from `../lib/cn`.
2. Add CSS classes to `globals.css` under the DX section (keep namespaced `.dx-*`).
3. Export from `components/index.ts`.

Add a new theme color:

1. Add the color to `tokens.ts` (export from `color`).
2. Add the `:root` CSS variable to `globals.css`.
3. Map any Medusa UI variables that should use it.

## Why not Tailwind?

Medusa's admin build uses Medusa-UI's Tailwind preset. The District X theme doesn't need its own Tailwind pipeline — it overrides the existing preset's CSS variables. Adding Tailwind config would mean duplicating the colour scales and rewriting the bundler config. Skip the chore, ship the override.
