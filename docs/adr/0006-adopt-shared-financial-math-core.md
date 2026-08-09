# 0006 Adopt Shared Financial Math Core

## Status

Accepted

## Context

The planned calculator features are separate product capabilities, but several of them depend on the same underlying financial projection behavior.

Examples of likely overlap include:

- compound growth projection
- recurring contribution projection
- loan amortization schedules
- shared projection row types for charts and comparison tables

If each feature implements these formulas independently, the codebase will accumulate duplicated logic, drift in formula behavior, and inconsistent result shapes. If one feature imports another feature's internal calculator functions, feature boundaries will erode.

## Decision

The project will introduce a shared financial math core in the shared layer.

This shared module will contain domain-agnostic, deterministic, side-effect-free calculation primitives and stable data contracts that may be reused across multiple calculator features.

The shared financial math core may own:

- compound and growth projection helpers
- recurring contribution projection helpers
- amortization schedule generators
- stable shared result row types used by multiple features

The shared financial math core must not own:

- feature-specific defaults
- bank- or product-specific assumptions
- UI presentation rules
- route logic or transport concerns
- feature comparison workflows that embed product semantics

Feature modules remain responsible for their own domain assumptions, validation rules, labels, and scenario-comparison behavior.

## Consequences

Benefits:

- less formula duplication across features
- stronger feature boundaries because shared reuse does not require cross-feature imports
- easier unit testing of financial logic in isolation
- more consistent result structures for tables, charts, and comparisons

Costs and tradeoffs:

- contributors must separate domain-specific assumptions from generic math instead of collapsing them into one module
- some apparently similar formulas may still remain feature-local when their business meaning differs materially
- shared contracts must be kept narrow so the module does not become a catch-all calculator engine

## Alternatives Considered

### Duplicating Math Per Feature

Rejected because it would increase formula drift, review overhead, and maintenance cost as more calculators are added.

### One Large Cross-Domain Calculator Engine

Rejected because it would blur product boundaries and encourage feature-specific rules to leak into shared space.
