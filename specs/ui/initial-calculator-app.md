# Initial Calculator App UI

## Status

Draft

## Goal

Define the shared user interface behavior for the initial calculator release so all four calculator features feel consistent and are implemented within one predictable app shell.

## Entry Points

- home route that introduces the calculator collection
- direct navigation to each calculator route from the app shell
- direct deep link to a calculator route by URL

## Layout and Sections

The initial release UI consists of:

- a top-level app shell with project title and calculator navigation
- a home surface that lists the available calculators with short descriptions
- one calculator page per feature:
  - ASB financing
  - compound interest
  - car loan
  - property investment versus REIT
- a shared calculator page structure for each feature page:
  - page heading and short feature description
  - assumptions notice when the feature uses a simplified documented formula model
  - input form section
  - primary calculate action
  - result summary section
  - detailed breakdown section using tables, charts, or both as appropriate

## Interactive Elements

- calculator navigation links must let the user move between calculators without losing global shell context
- home-page hero messaging must describe user value and calculator purpose rather than internal implementation progress
- app shell tagline must use user-facing language and avoid internal delivery or implementation wording
- home-page roadmap items must distinguish fully specified calculators from calculators that are still only planned
- any route-level heading that uses the shared display font must apply a typography configuration that prevents malformed contextual ligature rendering (for example `f/fi` combinations)
- home-page primary and secondary CTA styling must follow a documented product-priority rule:
  - if one calculator is intentionally prioritized, only that route gets primary emphasis
  - if live calculators are equal priority, use visual parity treatment for CTAs
- each calculator page must expose all required inputs defined by its feature spec
- inputs should use field types that fit the value:
  - currency or amount fields for money
  - percentage fields for rates
  - integer fields or select controls for tenure, horizon, and month counts
  - select or radio controls for bounded choices such as compounding frequency or MRTT versus MLTT treatment
- each calculator page must provide:
  - a primary calculate action
  - a reset or clear action
  - inline validation messaging on invalid fields
- result sections must support both a compact summary and a more detailed breakdown without navigating away from the page
- metric cards that display currency figures must keep values contained within card boundaries on supported breakpoints
- when value width pressure occurs, UI must use a readable containment strategy such as adjusted typography scale, wrapping policy, or card min-width tuning without truncating the numeric value meaning
- projection tables must use user-readable period labels and must not display raw floating-point period ratios as primary user-facing labels
- calculator pages that present multiple result metric labels must provide a plain-language glossary defining each label, consolidated in one section on the same page rather than repeated per metric card instance; each definition is one short, plain-language sentence matching the tone of existing form helper text, and must not use jargon to explain jargon
- the metric glossary must be reachable via a keyboard- and tap-reachable UI element (for example an expandable disclosure); hover-only tooltips are not sufficient on their own

## Loading State

- because calculations are client-side, no full-page loading state is required for calculation itself
- if a route or component is still initializing, the page should show a lightweight skeleton or placeholder for the calculator form and result panel
- while a calculation is running, the calculate action may show a brief pending state but must remain fast enough that a spinner-only experience is not the primary design assumption

## Empty State

- before the user has entered enough inputs, the result panel remains visible but empty
- the empty result panel must explain what the user needs to enter before calculation can run
- the home page must show all initial calculators even if none has been used yet

## Error State

- validation errors must appear next to or directly associated with the relevant field
- calculator pages must not show stale results after a validation failure for the current input set
- if a result cannot be produced because inputs are incomplete or invalid, the result area must explain the blocking issue in user-facing language
- formula assumptions that materially affect interpretation, such as Rule of 78 for early settlement or fixed annual dividend assumptions, must be visible near the result summary or assumptions notice

## Responsive Behavior

- on desktop, calculator pages may present the input form and result area in separate columns
- on tablet and mobile, the layout must stack vertically in this order:
  - heading and assumptions notice
  - input form
  - primary actions
  - summary results
  - detailed charts and tables
- navigation must remain usable on small screens without hiding access to any calculator
- tables with many columns must remain readable on smaller screens through responsive stacking, selective summarization, or horizontal overflow handling
- summary metric cards for calculators must remain readable on smaller screens and must not leak text beyond card edges
- heading typography should preserve legibility and rhythm on small screens without clipped or awkward glyph presentation
- input-column spacing should remain compact enough that one panel does not create disproportionate blank vertical zones compared with its paired results panel

## Accessibility Notes

- calculator navigation must be keyboard reachable and expose the current page state
- all form inputs must have visible labels
- validation messaging must be programmatically associated with the relevant field
- summary values and comparison outcomes must not rely on color alone to communicate meaning
- ranked or tiered results (for example a strategy comparison ranking) must always pair any colour treatment with an explicit text or numeric rank indicator
- charts, if included, must have a text summary or accessible data table alternative

## Related Specs

- Features:
  - [specs/features/home-overview-copy.md](../features/home-overview-copy.md)
  - [specs/features/asb-financing.md](../features/asb-financing.md)
  - [specs/features/compound-interest.md](../features/compound-interest.md)
  - [specs/features/car-loan.md](../features/car-loan.md)
  - [specs/features/home-and-car-loan-ui-refinement.md](../features/home-and-car-loan-ui-refinement.md)
  - [specs/features/ui-readability-and-layout-consistency.md](../features/ui-readability-and-layout-consistency.md)
  - [specs/features/property-investment.md](../features/property-investment.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
