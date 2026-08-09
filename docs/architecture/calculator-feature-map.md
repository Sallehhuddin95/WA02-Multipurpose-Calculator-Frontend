# Calculator Feature Map

This document translates the accepted calculator ADRs and feature specs into a concrete implementation map for the initial release.

Its purpose is to give contributors one architecture-level source of truth for feature ownership, shared math ownership, and the first recommended module surface.

---

## 1. Initial Release Features

The initial release contains four independent feature modules:

- `asb-financing`
- `compound-interest`
- `car-loan`
- `property-investment`

These features may share domain-agnostic math, formatting, and UI primitives, but they must not depend on each other's private internals.

---

## 2. Route and Feature Ownership

Recommended app routes:

- `app/page.tsx` for the home page
- `app/asb-financing/page.tsx`
- `app/compound-interest/page.tsx`
- `app/car-loan/page.tsx`
- `app/property-investment/page.tsx`

Recommended feature folders:

```text
features/
  asb-financing/
  compound-interest/
  car-loan/
  property-investment/
```

Each feature owns:

- page-facing form composition
- feature-specific validation schemas
- feature-specific calculation orchestration
- result formatting decisions that are specific to that domain
- feature-scoped tests

---

## 3. Shared Financial Math Ownership

The shared financial math core exists to prevent duplicated formulas and cross-feature imports.

Recommended shared folders:

```text
lib/
  financial-math/
    amortization/
    compound-growth/
    flat-rate-loans/
    rule-of-78/
    types/
utils/
  format-currency.ts
  format-percentage.ts
```

The shared math core may own:

- reducing-balance amortization schedule helpers
- fixed-rate compound-growth helpers
- recurring contribution projection helpers
- flat-rate hire-purchase loan helpers
- Rule of 78 style rebate helpers
- shared projection row and summary result types used by multiple features

The shared math core must not own:

- ASB-specific dividend assumptions
- REIT comparison policy
- property expense rules
- car-loan copy or UI labels
- feature-specific validation policy

---

## 4. First Recommended Shared Module Surface

The initial release should start with small, explicit shared primitives.

Recommended initial functions and contracts:

- `buildAmortizationSchedule`
- `calculateMonthlyAmortizedPayment`
- `projectCompoundGrowth`
- `projectRecurringContributions`
- `calculateFlatRateLoan`
- `calculateRuleOf78Settlement`
- `ProjectionPoint`
- `AmortizationRow`
- `FlatRateLoanSummary`
- `SettlementSummary`

These names are recommendations, not mandatory exported symbols, but the shared module surface should stay equally explicit and narrow.

---

## 5. Feature-to-Shared Dependency Map

### ASB Financing

May depend on:

- compound-growth helpers
- recurring contribution helpers if needed for direct ASB modeling
- amortization helpers
- shared money and percentage formatters

Must keep local:

- dividend-offset strategy rules
- ASB-specific comparison workflow
- feature assumptions and copy

### Compound Interest

May depend on:

- compound-growth helpers
- recurring contribution helpers
- shared formatters

Must keep local:

- feature-level input options and presentation rules

### Car Loan

May depend on:

- flat-rate loan helpers
- Rule of 78 settlement helpers
- shared formatters

Must keep local:

- early-settlement page flow
- user-facing settlement explanation copy

### Property Investment

May depend on:

- amortization helpers
- compound-growth helpers if reused for REIT projection
- shared formatters

Must keep local:

- property cash-flow assembly
- expense assumptions
- REIT-versus-property comparison workflow

---

## 6. Validation and Testing Expectations

- Feature validation schemas stay inside each feature module.
- Shared math functions must be covered primarily by unit tests.
- Calculator forms and result panels should be covered by integration tests per feature.
- Cross-page navigation and one happy-path scenario per calculator should be covered by end-to-end acceptance tests.

This testing split must align with [docs/frontend/testing.md](../frontend/testing.md).

---

## 7. Handoff Notes

Before implementation starts, contributors should use this document together with:

- [docs/adr/0005-stage-initial-release-as-frontend-only-calculator.md](../adr/0005-stage-initial-release-as-frontend-only-calculator.md)
- [docs/adr/0006-adopt-shared-financial-math-core.md](../adr/0006-adopt-shared-financial-math-core.md)
- [specs/ui/initial-calculator-app.md](../../specs/ui/initial-calculator-app.md)
- [specs/acceptance/initial-calculator-release.md](../../specs/acceptance/initial-calculator-release.md)
- the four feature specs under `specs/features/`
