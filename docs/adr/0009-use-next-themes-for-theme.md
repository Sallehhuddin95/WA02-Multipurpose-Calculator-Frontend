# 0009 Use next-themes for Theme Toggling

## Status

Accepted

## Context

The design-tokens spec (`specs/ui/design-tokens-and-theme.md`) defined the `.dark` palette but explicitly left dark mode "not wired": the `.dark` block exists in `app/globals.css` with no toggle or provider. The frontend guideline §7 listed "theme mode" as a global UI concern managed by "isolated Zustand stores", but Zustand is not a project dependency and no Zustand store exists.

A light/dark theme toggle is now planned. The app is a client-heavy calculator product with no requirement for OS-preference sync; the requirement is a manual toggle that defaults to light and persists the choice.

## Decision

Use `next-themes` as the single theme provider rather than a custom provider or a Zustand store.

Configuration:

- `attribute="class"` so the toggle applies and removes the `.dark` class on `<html>`
- `defaultTheme="light"` so first visits render light
- `enableSystem={false}` so the theme is manual only and never follows the OS preference
- persistence in `localStorage` under the `theme` key
- `disableTransitionOnChange` enabled so the class swap is instant with no transition flash

The toggle is a token-only pill button with lucide Sun/Moon icons and a `ring-2` focus ring, placed in the Header controls cluster and repeated in the mobile menu.

## Consequences

Benefits:

- a single, well-understood theme provider instead of hand-rolled class management and an inline no-flash script
- the manual-only posture matches the product requirement and avoids surprise system-preference overrides
- token-only styling rules are unchanged; no component styling rework beyond the toggle

Costs and tradeoffs:

- adds a new runtime dependency (`next-themes`)
- the `.dark` palette must stay in sync with `:root` for both themes to remain correct
- disabling system sync means users who prefer dark at the OS level still start on light until they toggle

## Alternatives Considered

### Custom provider

Rejected. Hand-rolling the class application, `localStorage` read/write, and the no-flash inline script duplicates what `next-themes` already provides and adds maintenance burden.

### Zustand store plus inline script

Rejected. Zustand is not currently a dependency, and a global store plus a raw inline script is more machinery than the requirement justifies. The guideline's Zustand mention was aspirational; no store exists today.

### Keep dark mode unwired

Rejected. The toggle is now a planned feature, so the `.dark` palette must become reachable.
