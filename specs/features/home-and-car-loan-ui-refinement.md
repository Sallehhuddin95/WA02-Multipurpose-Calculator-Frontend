# Home and Car-Loan UI Refinement

## Status

Draft

## Goal

Refine the home page and car-loan calculator presentation so the product feels modern and minimalist while preserving existing calculator behavior and architecture boundaries.

## Scope

- ensure header branding copy (site name and tagline in `components/layout/Header.tsx`) uses user-value language
- define home CTA hierarchy for live calculators
- fix car-loan heading readability and text rhythm
- ensure car-loan result values remain contained inside metric cards on supported breakpoints
- align spacing, typography scale, and visual weight across the home and car-loan surfaces
- keep feature and shared module ownership unchanged

## Out of Scope

- formula changes for compound interest or car-loan calculations
- route ownership changes
- backend, auth, session, or API changes
- introducing new third-party UI frameworks or design systems

## Actors

- end user comparing calculator options
- end user evaluating car-loan totals and early settlement estimate
- frontend developer implementing page and component styling behavior

## Preconditions

- existing home route and car-loan route are available
- existing car-loan projection logic and formatters remain the source for numeric outputs
- app shell navigation remains the primary cross-calculator entry

## Main Flow

1. User opens any page and sees the global header with value-focused copy that explains what the calculators help them decide.
2. User sees CTA treatment that reflects documented product priority rules rather than scaffold status language.
3. User opens the car-loan page and can read heading and assumptions text without clipped or awkward glyph rendering.
4. User runs a valid loan calculation and sees summary and settlement values fully contained within their cards.
5. User can scan amounts and labels on mobile and desktop without visual overflow or broken alignment.

## Alternate Flows

- If both live calculators are equal product priority, both CTAs use neutral parity treatment.
- If one live calculator is designated as primary by product decision, only that CTA uses primary emphasis and the rule is documented in the UI spec.
- If large currency values exceed available width, the metric card applies the documented containment strategy while preserving readability.

## Error and Empty States

- validation and empty-state behavior for calculator forms remains as currently specified
- this refinement must not regress field-level validation messaging clarity
- no stale result state should be presented as current output after invalid submissions

## Acceptance Criteria

- header branding text (site name and tagline) describes user outcomes and calculator value, not internal scaffold or implementation status
- CTA emphasis on the home page follows a documented hierarchy rule
- car-loan heading and assumptions text render cleanly on supported desktop and mobile breakpoints
- loan-summary and settlement metric values do not overflow card boundaries on supported breakpoints
- layout remains readable and visually consistent with a modern minimalist style direction
- existing formula outputs remain unchanged for identical inputs

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- Feature: [specs/features/car-loan.md](./car-loan.md)
