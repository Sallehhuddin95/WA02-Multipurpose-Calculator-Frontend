# 0007 Adopt shadcn/ui as UI Primitive Layer

## Status

Accepted

## Context

The frontend guideline (FRONTEND_GUIDELINE.md) states the tech stack includes "Tailwind CSS + shadcn/ui." However, shadcn/ui was never actually installed. The project currently uses hand-built form controls (inputs, selects, buttons) and interactive elements styled directly with Tailwind utilities and custom CSS classes.

The v1 release scope (ADR 0005) is frontend-only calculators with no authentication or server state. The current custom approach works, but it lacks the accessibility guarantees and consistent component API that a UI primitive library provides.

The documented standard already names shadcn/ui. Installing it removes the drift between the guideline and the codebase.

## Decision

Adopt shadcn/ui as the UI primitive layer for this project.

The dependency chain includes:
- `@radix-ui/*` primitives (accessible, unstyled interactive components)
- `class-variance-authority` (variant management)
- `clsx` + `tailwind-merge` (class composition via `cn()`)
- `lucide-react` (icon library)

Existing custom design tokens (CSS custom properties in `globals.css`) will be mapped to shadcn's CSS variable convention (`--primary`, `--secondary`, `--background`, etc.) to create a cohesive theme. The project's legacy layout utilities (`page-shell`, `surface-card`, `grain`, `display-heading`) are replaced with Tailwind utilities once the primitive layer is in place.

Migration will be gradual: new feature work uses shadcn components; existing hand-built controls may be replaced opportunistically but there is no forced rewrite.

## Consequences

Benefits:
- accessible interactive components out of the box via Radix primitives
- consistent variant-driven component API across all features
- reduces maintenance of custom form control logic
- aligns codebase with the documented frontend standard

Costs and tradeoffs:
- adds ~6 new dependencies to the bundle
- two styling patterns (hand-built Tailwind + shadcn components) may coexist temporarily
- migration of existing form controls is opt-in and may stretch across multiple changes

## Alternatives Considered

### Keep the hand-built approach and update the guideline (Path A from gap analysis)

Rejected. While simpler, it removes a documented standard that provides long-term value (accessibility, consistency). The guideline was written with shadcn/ui for good reasons that remain valid.

### Use another UI library (MUI, Chakra, Radix alone, Headless UI)

Rejected. shadcn/ui pairs naturally with Tailwind CSS, which is already the project's styling approach. It provides copy-pasteable source code components rather than a black-box npm package, giving full control over styling and behavior.
