# Design Tokens and Theme

## Status

Draft

## Goal

Define a modern light-grey and blue visual theme for the app and make it the single source of truth for all color, shadow, radius, and focus styling. The theme lives only in CSS variables in `app/globals.css` and is consumed through Tailwind utilities so the whole app can be re-themed from one file.

## Scope

This spec covers the token palette and the token-only styling rule. It does not change layout, content, or calculator behavior. It applies to every surface rendered by the app shell, the home page, and all calculator features.

## Design Intent

The app should feel modern, clean, and calm:

- cool light grey fills for backgrounds and neutral surfaces
- blue as the primary, interactive, and accent color
- solid, predictable borders instead of translucent overlays
- soft but defined elevation shadows for cards
- strong, visible focus rings on every interactive control

## Entry Points

This theme applies globally and is visible on every route:

- home route and the shared app shell (Header, Footer, AppShell)
- all calculator routes and their result surfaces

## Color Palette (light)

The canonical light values below are defined in the `:root` block of `app/globals.css`. Values are written as hex. Hover, active, and focus states are derived with Tailwind opacity and ring utilities on the same tokens, not with new literal colors.

| Token | Value | Notes |
| --- | --- | --- |
| `--background` | `#f5f7fa` | cool light grey page background |
| `--foreground` | `#161d2e` | near-navy body text with a blue undertone |
| `--card` | `#ffffff` | elevated surface |
| `--card-foreground` | `#161d2e` | text on cards |
| `--popover` | `#ffffff` | floating surfaces such as menus |
| `--popover-foreground` | `#161d2e` | |
| `--primary` | `#2563eb` | blue-600 interactive and primary accent |
| `--primary-foreground` | `#ffffff` | |
| `--secondary` | `#e7eef8` | blue-tinted fill, distinct from muted |
| `--secondary-foreground` | `#1e40af` | blue-800 |
| `--muted` | `#eef1f6` | neutral grey fill |
| `--muted-foreground` | `#5b6474` | secondary text, passes WCAG AA on cards and background |
| `--accent` | `#dbeafe` | solid blue-100 for hover and selected states |
| `--accent-foreground` | `#1e40af` | |
| `--destructive` | `#dc2626` | standard red-600 for destructive actions |
| `--destructive-foreground` | `#ffffff` | |
| `--border` | `#e2e8f0` | solid slate-200 border |
| `--input` | `#cbd5e1` | slate-300, stronger affordance than border for fields |
| `--ring` | `#2563eb` | focus ring equals primary |
| `--radius` | `0.75rem` | base radius; derived sm, md, lg, xl keep current scale |

## Semantic Tokens to Add

The following tokens are added to `:root` and mirrored in `.dark`, and mapped in `@theme inline` so they become first-class Tailwind utilities.

| Token | Value (light) | Replaces |
| --- | --- | --- |
| `--shadow-card` | `0 1px 2px rgba(15,23,42,0.04), 0 16px 40px -24px rgba(15,23,42,0.10)` | ad hoc `shadow` / `shadow-sm` on cards |
| `--shadow-elevated` | `0 28px 70px rgba(15,23,42,0.08)` | the literal `shadow-[0_28px_70px_rgba(23,27,38,0.08)]` hero shadow |
| `--glow` | `color-mix(in oklab, var(--primary) 12%, transparent)` | the `rgba(37,99,235,0.12)` radial gradient in `html` |
| `--dot-grid` | `color-mix(in oklab, var(--foreground) 5%, transparent)` | the `rgba(26,30,39,0.05)` dot grid in the root layout |

## Token-Only Styling Rule

Color, shadow, and focus styling must be token-driven. Do not hardcode literal colors in components.

Requirements for all `.tsx` files:

- no `bg-white*`, `text-white`, or `bg-black*` literal utilities for theme colors
- no `rgba(...)`, hex values, or `shadow-[...]` literals for theme styling
- use token-derived utilities such as `bg-card`, `bg-card/80`, `bg-primary`, `text-primary-foreground`, `shadow-card`, `shadow-elevated`, `ring-2 ring-ring`
- use `bg-primary text-primary-foreground` instead of `bg-primary text-white` for pills and badges
- use `bg-card/N` plus `backdrop-blur` for the frosted glass surfaces instead of `bg-white/N`

## Typography Utility

- `display-heading` is the token-only typography utility for display-font headings and the Header site name, bundling `font-family: var(--font-display)` with the ligature guard in one place in `app/globals.css`.

## Surface and Component Conventions

- page wrapper surfaces: `bg-card/80` with `backdrop-blur-lg` and `shadow-elevated`
- form and result containers: `bg-card/75`
- low-emphasis backgrounds such as mode toggles and checkbox rows: `bg-card/60`
- solid controls and reset buttons: `bg-card`
- borders: solid slate tokens, not translucent rgba
- cards: `shadow-card` and the radius token, not arbitrary `rounded-[...]` values
- interactive controls: focus `ring-2 ring-ring ring-offset-2 ring-offset-background`; `rounded-full` for pills and buttons where used today

## Focus and Accessibility

- every keyboard-reachable interactive control must show a visible `ring-2` focus ring
- text must meet WCAG AA contrast (at least 4.5:1) on its background
- meaning must never rely on color alone; ranked or tiered results keep explicit text or numeric rank indicators

## Dark Mode Posture

The `.dark` block exists but is not wired (no toggle or provider). The palette in `.dark` must be kept in sync with the light values so the theme remains correct if dark mode is enabled later. Any palette change must update both `:root` and `.dark`.

## Loading, Empty, and Error States

These states are unaffected by this spec except for the color tokens they use. They must use the same token-driven surface and focus conventions as the rest of the app.

## Responsive Behavior

No layout or responsive behavior changes are introduced by this spec. The theme applies at all viewport sizes with the same token values.

## Acceptance Criteria

- the app renders with the light-grey and blue palette defined above
- no hardcoded `bg-white*`, `text-white`, `rgba(...)`, hex, or `shadow-[...]` theme literals remain in any `.tsx` file
- all interactive controls show a visible `ring-2` focus ring
- text meets WCAG AA contrast on its background
- dark mode block stays in sync (not required to be visible)

## Related Specs

- [specs/ui/initial-calculator-app.md](./initial-calculator-app.md)
- [specs/features/ui-readability-and-layout-consistency.md](../features/ui-readability-and-layout-consistency.md)
- [docs/adr/0007-adopt-shadcn-ui-primitives.md](../../docs/adr/0007-adopt-shadcn-ui-primitives.md)
