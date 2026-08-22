# UI Readability and Layout Consistency

## Status

Draft

## Goal

Ensure all current calculator pages and the home page present text, numeric values, and form layout in a clear, user-readable way without glyph artifacts, raw technical values, or disproportionate spacing.

## Scope

- heading typography consistency on all route-level pages and the global header using the display font
- summary-card value spacing and containment consistency across implemented calculators
- compound-interest period-label readability in the projection table
- compound-interest input-column spacing and section rhythm refinement

## Out of Scope

- any change to financial formulas, assumptions, or projection math
- backend, auth, sessions, or persistence behavior
- introduction of new frameworks or design systems

## Actors

- end users using the calculator pages
- frontend developers implementing route and feature UI
- QA validating cross-page readability and layout behavior

## Preconditions

- home, compound-interest, and car-loan routes are available
- the global header (`components/layout/Header.tsx`) is rendered on all pages with the site name using the display font
- existing projection and formatting logic is already integrated
- app shell navigation remains in use

## Main Flow

1. User opens any page and sees heading text (including the Header site name) rendered clearly with no odd `f/fi` glyph behavior.
2. User reads summaries and metric cards where values remain visually separated from borders and are easy to scan.
3. User opens compound-interest results and sees period labels that are understandable to non-technical users.
4. User uses compound-interest form and sees balanced spacing with no excessive blank columns or dead zones.

## Alternate Flows

- If compounding mode is monthly, period labels should present month progression clearly.
- If compounding mode is quarterly, period labels should represent quarter progression clearly.
- If values are large, card typography and wrapping behavior should preserve readability without clipping.

## Error and Empty States

- validation behavior remains unchanged from current feature specs
- no stale results should appear as current output after invalid submissions
- empty-state messaging requirements from current UI spec remain in force

## Acceptance Criteria

- display-font headings on the Header, home, compound-interest, and car-loan pages render without clipped or malformed glyph combinations such as `f/fi`, and with correct optical rendering of the display-font `f` at supported sizes; both properties are enforced through the shared `display-heading` utility (single source of truth) rather than inline `[font-feature-settings:...]` guards
- compound-interest projection period column does not show raw floating-point year ratios; it shows user-readable period labels
- compound-interest input panel does not leave disproportionate blank vertical regions due to excessive field spacing
- summary metric values in compound-interest and car-loan keep visible breathing room from card borders on supported breakpoints
- no formula output changes occur for identical input sets

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- Features:
  - [specs/features/compound-interest.md](./compound-interest.md)
  - [specs/features/car-loan.md](./car-loan.md)
  - [specs/features/home-and-car-loan-ui-refinement.md](./home-and-car-loan-ui-refinement.md)
