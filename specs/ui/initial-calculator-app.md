# Initial Calculator App UI

## Status

Draft

## Goal

Define the shared user interface behavior for the initial calculator release so all four calculator features feel consistent and are implemented within one predictable app shell.

## Entry Points

- home route that introduces the calculator collection (via the tagline hero heading, the calculator grid, an "All Shipped" completion heading, and an "About this app" card; the site name is in the global Header)
- direct navigation to each calculator route from the Header navigation links
- direct deep link to a calculator route by URL

## Layout and Sections

The initial release UI consists of:

- three shared layout components composed in the root layout via `AppShell`:
  - `components/layout/Header.tsx` — a Server Component with the site name "Multipurpose Calculators" and navigation links to all calculator routes; uses `position: sticky` via CSS (no JS) so the header remains visible during scroll. On `md+` viewports the horizontal navigation is rendered by a Client Component island (`PrimaryNav`) that uses `usePathname()` to set `aria-current="page"` on the active link. Below `md`, the horizontal nav is replaced by a hamburger disclosure menu (`MobileMenu`, a Client Component island) that opens a panel listing Overview and all six calculators. The shared navigation entries live in `components/layout/navigation-items.ts` and are consumed by both `PrimaryNav` and `MobileMenu`
  - a Header controls cluster (Client Component islands) holding the theme toggle and the language switch; the `MobileMenu` panel repeats both controls below `md` so theme and language stay reachable on small screens
  - `components/layout/Footer.tsx` — a Server Component with copyright text and a `CurrentYear.tsx` Client Component island for dynamic year rendering (`new Date().getFullYear()`)
  - `components/layout/AppShell.tsx` — composes Header + `<main>{children}</main>` + Footer
- a home surface that lists the available calculators with short descriptions and an "All Shipped" completion heading above the grid; the home page renders the tagline "Practical calculators to help you make clearer money decisions." as a hero heading, and a right-column "About this app" card with a feedback CTA; the site name "Multipurpose Calculators" is rendered in the global Header
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

- calculator navigation links must let the user move between calculators without losing global shell context; navigation links live in the Header component and are available on every page
- the Header component's site name and the home page hero tagline must describe user value and calculator purpose rather than internal implementation progress
- app shell tagline must use user-facing language and avoid internal delivery or implementation wording
- the home page "About this app" card must state that results are estimates (not financial advice), that calculations run privately in the browser, and that assumptions are documented per calculator
- the home page feedback CTA must be present and clearly indicate that it is not yet active (the Telegram bot transport is a future integration)
- any route-level heading and the Header site name that use the shared display font must apply the `display-heading` utility (defined in `app/globals.css`) rather than an inline `[font-feature-settings:...]` guard string; the utility bundles the display font family with the ligature guard so malformed contextual ligature rendering (for example `f/fi` combinations) is prevented from one shared source of truth
- home-page calculator grid CTA styling must follow a documented product-priority rule:
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
- the Header controls cluster (theme toggle and language switch) must be keyboard-reachable, expose localized `aria-label`s, and use token-only styling with a visible `ring-2` focus ring

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
- navigation must remain usable on small screens without hiding access to any calculator; below `md` the horizontal nav collapses into a hamburger disclosure menu that lists Overview and all six calculators plus the theme toggle and language switch, is keyboard-reachable, closes on ESC with focus returned to the toggle, and closes on click-outside and on route change
- tables with many columns must remain readable on smaller screens through responsive stacking, selective summarization, or horizontal overflow handling
- summary metric cards for calculators must remain readable on smaller screens and must not leak text beyond card edges
- heading typography should preserve legibility and rhythm on small screens without clipped or awkward glyph presentation
- input-column spacing should remain compact enough that one panel does not create disproportionate blank vertical zones compared with its paired results panel

## Accessibility Notes

- calculator navigation must be keyboard reachable and expose the current page state
- the mobile navigation disclosure button must expose `aria-expanded` and `aria-controls`, close on ESC with focus returned to the toggle, close on click-outside and on route change, and respect `prefers-reduced-motion`
- the theme toggle and language switch are keyboard-reachable, expose localized `aria-label`s, and show a visible `ring-2` focus ring
- all form inputs must have visible labels
- validation messaging must be programmatically associated with the relevant field
- summary values and comparison outcomes must not rely on color alone to communicate meaning
- ranked or tiered results (for example a strategy comparison ranking) must always pair any colour treatment with an explicit text or numeric rank indicator
- charts, if included, must have a text summary or accessible data table alternative

## Related Specs

- Features:
  - [specs/features/home-overview-copy.md](../features/home-overview-copy.md) (header branding and home page copy requirements)
  - [specs/features/asb-financing.md](../features/asb-financing.md)
  - [specs/features/compound-interest.md](../features/compound-interest.md)
  - [specs/features/car-loan.md](../features/car-loan.md)
  - [specs/features/home-and-car-loan-ui-refinement.md](../features/home-and-car-loan-ui-refinement.md)
  - [specs/features/ui-readability-and-layout-consistency.md](../features/ui-readability-and-layout-consistency.md)
  - [specs/features/property-investment.md](../features/property-investment.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- UI: [specs/ui/design-tokens-and-theme.md](./design-tokens-and-theme.md)
