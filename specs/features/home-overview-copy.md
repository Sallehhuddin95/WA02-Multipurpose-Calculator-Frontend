# Home and App Shell Copy Requirements

## Status

Draft

## Goal

Define the user-facing copy requirements for the overview page and app shell so the calculator app presents its purpose, current offerings, and future roadmap in plain language.

## Scope

- home hero and supporting copy
- app shell title and tagline
- live calculator summary cards on the home page
- planned-next roadmap section on the home page
- copy terminology for assumptions, status labels, and roadmap readiness

## Out of Scope

- calculation formulas, validation rules, or numeric results
- navigation structure changes
- adding or removing calculator features themselves
- visual redesign work beyond copy-driven changes

## Actors

- end user comparing calculator options
- frontend or content maintainer updating public copy
- reviewer validating that public text matches documented behavior

## Preconditions

- the home page and app shell are available
- calculator routes exist and are linked from the shell
- feature specs exist before a roadmap item is described as fully specified

## User Stories

- As an end user, I want the app shell and home page to explain the calculator collection in plain language, so I can understand what the app helps me do without reading internal implementation wording.
- As an end user, I want the live calculator summaries to match the current calculator model, so I am not misled by stale assumptions.
- As an end user, I want roadmap items to show whether they are specified or only planned, so I can tell what is available now versus later.
- As a maintainer, I want internal version labels kept out of user-facing copy, so the interface stays polished and easier to trust.

## Main Flow

1. User lands on the home page and sees a plain-language hero that explains the calculator collection.
2. User sees the app shell branding and tagline in user-facing language.
3. User reads each live calculator summary and gets a truthful description of what that calculator does.
4. User reads the planned-next section and can distinguish spec-backed items from items that are still only planned.
5. User does not encounter internal delivery labels or version markers in visible copy.

## Alternate Flows

- If a roadmap item is not yet covered by a feature spec, it may still appear as planned, but it must not use the same readiness label as a fully specified item.
- If a calculator feature changes its public assumptions or summary language, the home page copy must be updated with the feature spec before or alongside code.

## Error and Empty States

- This requirement does not change calculator validation, empty-state, or result-error behavior.
- If roadmap items are missing or incomplete, the home page should still present the live calculators and avoid implying that a missing item is already specified.

## Acceptance Criteria

- Home hero copy describes user value rather than implementation progress.
- App shell tagline is written in plain language and does not mention internal workflow or delivery slices.
- No visible home or shell copy uses version labels such as v1.
- Live calculator summaries on the home page match the current feature behavior and do not preserve outdated assumptions.
- Planned-next items include Salary Calculator and Retirement Fund Calculator.
- Spec-backed roadmap items use a distinct readiness label from items that are not yet specified.
- Any roadmap item that lacks a feature spec is not labeled as specified.

## Related Specs

- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
- Feature: [specs/features/home-and-car-loan-ui-refinement.md](./home-and-car-loan-ui-refinement.md)
