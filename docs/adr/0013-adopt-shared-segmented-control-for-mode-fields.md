# 0013 Adopt a Shared Segmented Control for Single-Select Mode Fields

## Status

Accepted

## Context

Calculator forms use single-select mode fields (input method, rate type, insurance type, increment mode, salary growth mode). Each was rendered as a row of `Button` pills with local `isActive` state, and the same `ModeButton` helper was copy-pasted into four features (car-loan, property-investment, retirement-fund, salary-calculator).

Two defects surfaced on small screens (375px):

1. The shadcn `Button` base bakes in `whitespace-nowrap`, so long labels (especially Malay, e.g. "Harga kenderaan dan bayaran pendahuluan") could never wrap. The pills forced the page wider than the viewport and caused horizontal overflow on most calculator pages.
2. A wrap-only hotfix removed the overflow but produced oversized centered two-line pill blobs, and the controls still carried the wrong semantics: a mutually-exclusive single-select is a radiogroup, not a set of buttons.

## Decision

Adopt one shared `SegmentedControl` component at `components/SegmentedControl.tsx`, built on the Radix Radio Group primitive (`components/ui/radio-group.tsx`, new `@radix-ui/react-radio-group` dependency under the already-accepted ADR 0007 chain).

- Controlled, domain-agnostic contract: `options`, `value`, `onValueChange`, required `label` (rendered as `fieldset`/`legend` and wired as the radiogroup accessible name via `aria-labelledby`), optional `name` and `disabled`.
- One adaptive design at the existing `sm` breakpoint: a horizontal segmented track on `sm` and up (equal-width `flex-1 min-w-0` segments), collapsing to a vertical full-width option list with 44px touch targets below `sm`. Labels are left-aligned and wrap inside their segment or row; no `whitespace-nowrap` anywhere.
- All four local `ModeButton` copies are deleted. Features import the shared component directly with no new barrel. State, Zod schemas, and persistence keys (ADR 0011) are unchanged; one new i18n key (`property.field.mrttPaymentTreatment`) labels the previously unnamed MRTT subgroup, and feature helper text stays in the feature as a sibling element.

## Consequences

Benefits:
- correct single-select semantics (`radiogroup`/`radio`, roving tabindex, arrow-key navigation) instead of `role="button"` pills
- one component to maintain instead of four copies, per the rule of co-location
- long translated labels can never overflow the page again
- consistent toggle appearance across all calculators on mobile and desktop

Costs and tradeoffs:
- one new npm package (`@radix-ui/react-radio-group`)
- integration test locators for mode toggles move from `getByRole("button")` to `getByRole("radio")`
- one new i18n key (`property.field.mrttPaymentTreatment`, in both locales) for the nested MRTT payment-treatment subgroup, which previously had no label; reusing the `mrttCost` label was rejected because it would give the group and the cost input identical accessible names

## Alternatives Considered

### Restyle the existing Button pills (compact, left-aligned)

Rejected. Smaller diff, but the semantics stay wrong (single-select is not a button group) and the four copies remain unless separately hoisted. Wrapping text inside `rounded-full` pills is what produced the blob look.

### Native Select on small screens

Rejected. Hides a 2-3 option choice behind an extra tap, adds a second control to build and test, and `Select` is the wrong affordance for a short mutually-exclusive set.

### Always full-width stacked list

Rejected. Acceptable on mobile but a desktop regression. Its vertical layout is reused as the below-`sm` fallback of the adopted design instead.
