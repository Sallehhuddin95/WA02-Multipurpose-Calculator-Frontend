# Home and App Shell Copy Requirements

## Status

Draft

## Goal

Define the user-facing copy requirements for the overview page and app shell so the calculator app presents its purpose, current offerings, and helpful context in plain language.

## Scope

- app shell header branding (site name "Multipurpose Calculators") rendered in `components/layout/Header.tsx`
- home page hero tagline ("Practical calculators to help you make clearer money decisions.") rendered on the home page
- live calculator summary cards on the home page
- "All Shipped" completion heading on the home page
- "About this app" card with disclaimer, privacy, and assumptions notes on the home page
- copy terminology for assumptions and status labels

## Out of Scope

- calculation formulas, validation rules, or numeric results
- navigation structure changes
- adding or removing calculator features themselves
- visual redesign work beyond copy-driven changes
- the structural extraction of the Header and Footer components themselves (see `specs/ui/initial-calculator-app.md`)
- the feedback transport implementation (a future Telegram bot integration; see `specs/ui/initial-calculator-app.md`)

## Actors

- end user comparing calculator options on any page
- frontend or content maintainer updating public copy in the global header or home page
- reviewer validating that public text matches documented behavior

## Preconditions

- the global header (`components/layout/Header.tsx`) is available and renders the site name
- the home page is available and renders the tagline hero heading, the calculator grid, the "All Shipped" completion heading, and the "About this app" card
- calculator routes exist and are linked from the shell

## User Stories

- As an end user, I want the global header to explain the calculator collection in plain language, so I can understand what the app helps me do without reading internal implementation wording.
- As an end user, I want the live calculator summaries to match the current calculator model, so I am not misled by stale assumptions.
- As an end user, I want clear context about what the estimates are and are not, so I do not mistake them for financial advice.
- As a maintainer, I want internal version labels kept out of user-facing copy, so the interface stays polished and easier to trust.

## Main Flow

1. User lands on any page and sees the global header with the site name "Multipurpose Calculators" rendered in `components/layout/Header.tsx`.
2. On the home page, user sees the tagline "Practical calculators to help you make clearer money decisions." as a hero heading above the calculator grid and "All Shipped" completion heading.
3. User reads each live calculator summary and gets a truthful description of what that calculator does.
4. User reads the "About this app" card to learn that results are estimates, calculations stay private in the browser, and assumptions are documented per calculator.
5. User does not encounter internal delivery labels or version markers in visible copy.

## Alternate Flows

- If a calculator feature changes its public assumptions or summary language, the home page copy must be updated with the feature spec before or alongside code.
- The site name is rendered once in the global header and is consistent across all pages; the tagline renders once on the home page hero and is not duplicated.

## Error and Empty States

- This requirement does not change calculator validation or result-error behavior.
- The "About this app" card is static context and always renders on the home page; it has no empty state.

## Acceptance Criteria

- Header site name "Multipurpose Calculators" and the home page hero tagline are written in user-facing language and describe calculator value rather than implementation progress.
- No visible header or home copy uses version labels such as v1.
- Live calculator summaries on the home page match the current feature behavior and do not preserve outdated assumptions.
- The home page renders an "All Shipped" completion heading above the calculator grid with user-facing copy.
- The "About this app" card states that results are estimates (not financial advice), that calculations run privately in the browser, and that assumptions are documented per calculator.
- The feedback CTA is present and clearly indicates that it is not yet active ("coming soon") without misrepresenting its state.

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md) (app shell layout including Header, Footer, and their composition)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- Feature: [specs/features/home-and-car-loan-ui-refinement.md](./home-and-car-loan-ui-refinement.md)
