# 0008 Adopt Geist and Space Grotesk as App Typography

## Status

Accepted

## Context

The app needs two typefaces: a distinctive display face for route-level headings and the Header site name, and a highly legible body face for forms, labels, and results. Space Grotesk (a geometric sans) is used for body, but the display-face choice was never recorded as an ADR, leaving a documentation gap.

The initial display candidate was Fraunces (a serif with an editorial, "soft" character). A product owner complaint reported that the Fraunces `f` character "looks weird." Investigation showed the problem was not clipped glyphs - the ligature guard already exists everywhere - but the high-contrast Fraunces glyph shape rendering oddly at small sizes. The product owner decided to replace Fraunces with Geist (Vercel's minimalist modern sans) for a cleaner, more modern look consistent with the app. Separately, the ligature guard was duplicated as 8 inline strings (the Header site name plus all 7 page `h1`s), which risks drift.

## Decision

Adopt Geist as the display font and Space Grotesk as the body font.

Both fonts are loaded through `next/font/google` in `app/layout.tsx` and exposed as CSS variables: `--font-display` (Geist) and `--font-body` (Space Grotesk). Geist is loaded with default variable axes.

Display-font styling is consolidated into a single token-only `@utility display-heading` in `app/globals.css`. The utility bundles the display font family with the ligature guard:

- `font-family: var(--font-display)`
- `font-feature-settings: 'liga' 0, 'clig' 0`
- `font-variant-ligatures: none`

The 8 duplicated inline guard strings are replaced by the `display-heading` utility. The body font (Space Grotesk) is unchanged and remains the default body face.

## Consequences

Benefits:
- single source of truth for display-font family and ligature guard, removing 8 duplicated inline strings
- a minimalist, modern display face consistent with the app's overall look
- the body font and its styling remain stable and untouched

Costs and tradeoffs:
- all display-font headings must consistently use the `display-heading` utility rather than ad hoc inline font strings
- Geist is a sans face, so the display and body faces share a sans classification; the visual distinction between headings and body now relies on weight, size, and layout rather than serif versus sans

## Alternatives Considered

### Keep the inline ligature guards only

Rejected. It leaves the guard duplicated across 8 sites, which is prone to drift, and provides no single source of truth for the display family.

### Keep Fraunces as the display font

Rejected. The high-contrast `f` glyph rendered oddly at small sizes, which the product owner found unacceptable for the app's modern look.

### Use Space Grotesk for headings too

Rejected. It removes the intended display-face distinction for route-level headings and the Header site name.

### Rely on `font-variant-ligatures` or a smaller guard only

Rejected. The ligature guard is only part of the concern; consolidating it into the `display-heading` utility also removes the 8 duplicated inline strings and provides a single source of truth.
