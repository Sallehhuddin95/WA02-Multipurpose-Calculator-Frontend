# 0008 Adopt Fraunces and Space Grotesk as App Typography

## Status

Accepted

## Context

The app needs two typefaces: a distinctive display face for route-level headings and the Header site name, and a highly legible body face for forms, labels, and results. Fraunces (a serif with an editorial, "soft" character) was chosen for display and Space Grotesk (a geometric sans) for body, but the choice was never recorded as an ADR, leaving a documentation gap.

A product owner complaint reported that the Fraunces `f` character "looks weird." Investigation showed the problem was not clipped glyphs - the ligature guard already exists everywhere - but the Fraunces glyph shape itself at `font-semibold` small sizes. The guard was also duplicated as 8 inline strings (the Header site name plus all 7 page `h1`s), which risks drift.

## Decision

Adopt Fraunces as the display font and Space Grotesk as the body font.

Both fonts are loaded through `next/font/google` in `app/layout.tsx` and exposed as CSS variables: `--font-display` (Fraunces) and `--font-body` (Space Grotesk). Fraunces is loaded with `axes: ["opsz"]` so the optical-size axis produces the correct glyph shape across supported sizes.

Display-font styling is consolidated into a single token-only `@utility display-heading` in `app/globals.css`. The utility bundles the display font family with the ligature guard:

- `font-family: var(--font-display)`
- `font-feature-settings: 'liga' 0, 'clig' 0`
- `font-variant-ligatures: none`

The 8 duplicated inline guard strings are replaced by the `display-heading` utility. The body font (Space Grotesk) is unchanged and remains the default body face.

## Consequences

Benefits:
- single source of truth for display-font family and ligature guard, removing 8 duplicated inline strings
- correct optical rendering of the Fraunces `f` glyph at supported sizes via the `opsz` axis
- the body font and its styling remain stable and untouched

Costs and tradeoffs:
- all display-font headings must consistently use the `display-heading` utility rather than ad hoc inline font strings
- Fraunces has distinctive glyph shapes that may still draw attention at very small sizes even with correct optical rendering; this is accepted as the intended editorial display personality

## Alternatives Considered

### Keep the inline ligature guards only

Rejected. It does not address the optical-size concern and leaves the guard duplicated across 8 sites, which is prone to drift.

### Drop Fraunces and use Space Grotesk for headings too

Rejected. It removes the intended editorial display personality and does not resolve the concern; the `f` issue is specific to Fraunces's glyph shape, not to using a display font at all.

### Rely on `font-variant-ligatures` or a smaller guard only

Rejected. The reported issue is the Fraunces glyph shape at small sizes, not ligature clipping alone. Both the optical-size axis and the consolidated ligature guard are needed to keep display text clean.
