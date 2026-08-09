# Property Investment Versus REIT Comparison

## Status

Draft

## Goal

Help a user compare whether a leveraged buy-to-rent property strategy is projected to outperform putting the same capital into a REIT over the same holding period.

The feature exists to make property-specific costs, loan obligations, rental cash flow, and sale proceeds visible against a simpler market-income alternative.

## Scope

This feature includes:

- one leveraged buy-to-rent property scenario
- two REIT comparison scenarios over the same holding period, each mirroring the property strategy's ongoing monthly cash commitment instead of a one-time lump sum
- user-defined purchase price, financing, rental, expense, and sale assumptions
- user-defined REIT initial capital (optional, may be zero) and annual return assumption for the same time horizon
- yearly projection outputs for property equity, rental cash flow, expenses, loan balance, and REIT value growth for both REIT strategies
- a summary comparison of final net proceeds, cumulative out-of-pocket cash paid, and total net return across the property strategy and both REIT strategies

## Out of Scope

- multiple properties in one scenario
- tenant vacancy schedules beyond a single vacancy-rate or occupancy assumption
- progressive tax, RPGT, income-tax, zakat, or inflation modeling in v1
- renovation financing, refinancing, restructuring, or default scenarios
- stochastic market simulation or Monte Carlo analysis
- bank-specific legal fees, stamp duty breakdowns, or exact conveyancing workflows unless later specified in a narrower follow-up spec
- server-side persistence or account-based scenario management

## Actors

- retail investor comparing a rental property purchase with a REIT investment over a chosen holding period

## Preconditions

- the user provides a property purchase price
- the user provides a down payment or financing amount
- the user provides a financing tenure and annual financing rate
- the user provides a holding period in years that does not exceed financing tenure
- the user provides expected monthly rent and core annual property expenses
- the user provides a property sale price growth assumption or expected sale price at exit
- the user provides REIT return assumptions for the same holding period

## Inputs

- property purchase price
- down payment amount or loan principal
- annual financing rate
- financing tenure in years
- holding period in years
- monthly rent
- occupancy or vacancy assumption
- monthly maintenance allowance
- monthly sinking fund
- annual cukai taksiran
- annual cukai tanah or cukai petak
- annual Indah Water cost
- annual repair allowance
- annual fire insurance
- other annual costs
- MRTT or MLTT insurance type, with MRTT paid upfront or financed into the loan, and MLTT paid as a recurring annual premium outside the loan
- expected annual property appreciation rate or exit sale price
- REIT initial capital amount (optional; zero is allowed)
- REIT annual distribution or total return assumption

The REIT monthly contribution amount for each of the two REIT strategies is derived automatically from the property strategy's scheduled monthly instalment and other monthly costs; it is not a separate user-entered field.

## Calculation Model

The initial release uses one explicit projection model so the property and REIT paths can be compared consistently.

### Property Financing Model

- The property loan uses a standard reducing-balance amortizing monthly loan model.
- The scheduled monthly instalment is computed from loan principal, annual financing rate, and tenure.
- Monthly interest is derived from the annual financing rate divided by 12.
- Each monthly instalment reduces interest due first and principal second.

### Property Cash Flow Model

- Gross annual rent is derived from monthly rent adjusted by the occupancy or vacancy assumption.
- Annual property expenses include maintenance (entered monthly and annualized), sinking fund, cukai taksiran, cukai tanah or cukai petak, Indah Water, repair allowance, fire insurance, and other costs.
- MRTT and MLTT are treated differently because of how each is normally paid:
  - MRTT is a one-time premium; the user chooses whether it is added to the initial cash outflow (upfront) or added to the loan principal (financed).
  - MLTT is a recurring annual premium included in annual property expenses; it is never added to the loan principal or the initial cash outflow.
- Net annual rental cash flow is gross rent minus annual property expenses and loan instalments paid during the year.

### Property Exit Model

- The property is assumed to be sold once at the end of the holding period.
- Exit value is derived from either the expected exit sale price or the annual appreciation assumption applied over the holding period.
- Remaining loan balance is deducted from gross sale proceeds to determine equity released at sale.
- Selling costs are excluded in v1 unless later added by spec revision.

### REIT Model

The REIT comparison evaluates two REIT strategies so that REIT investing commits the same ongoing monthly cash as the property strategy, not a one-time lump sum matched only at the start.

- REIT initial capital is optional and may be zero; the user can start either REIT strategy with no upfront capital.
- REIT Strategy A (instalment-matched) contributes a fixed monthly amount equal to the property strategy's scheduled monthly loan instalment for the same holding period.
- REIT Strategy B (instalment-and-costs-matched) contributes a fixed monthly amount equal to the property strategy's scheduled monthly loan instalment plus the property's monthly-equivalent recurring costs (maintenance, sinking fund, cukai taksiran, cukai tanah or cukai petak, Indah Water, repair allowance, fire insurance, other costs, and the MLTT premium when MLTT is selected).
- Each month's contribution is added at the end of the month, consistent with the contribution convention used in the compound-interest feature.
- REIT growth compounds monthly using the user-supplied annual return assumption, treated as fixed for the full holding period.
- Both REIT strategies use the same initial capital and annual return assumption; only the monthly contribution amount differs between them.

### Summary Metrics

- final property sale proceeds net of remaining loan balance
- cumulative net rental cash flow
- cumulative out-of-pocket cash paid by the user
- final value for each REIT strategy
- net return for the property strategy and for each REIT strategy

## Assumptions

- v1 uses a reducing-balance monthly amortization model for the property loan
- annual expense assumptions remain constant across the holding period unless the user changes them and recalculates
- rental income is modeled as a steady annualized value based on the provided occupancy assumption
- property appreciation or exit sale value follows one fixed user-selected assumption for the whole holding period
- both REIT strategies use one fixed annual return rate for the full holding period, applied with monthly compounding
- REIT initial capital may be zero; a REIT strategy is not required to start with a lump sum
- all outputs are nominal and do not adjust for inflation

## Main Flow

1. The user enters property purchase, financing, rent, expense, holding-period, and exit assumptions.
2. The system calculates the scheduled monthly loan instalment and yearly loan balances across the holding period.
3. The system projects yearly rental inflow, property expenses, loan payments, and net cash flow.
4. The system projects the property's estimated exit value and remaining loan balance at the end of the holding period.
5. The system calculates final property proceeds by applying the exit model.
6. The user enters the optional REIT initial capital (which may be zero) and the REIT annual return assumption for the same holding period.
7. The system derives the two REIT strategies' monthly contribution amounts from the property strategy's scheduled monthly instalment, with and without the property's other monthly costs.
8. The system projects both REIT strategies' value over the same horizon using monthly compounding and end-of-month contributions.
9. The system returns a comparison view that shows yearly progress and final summary metrics for the property strategy and both REIT strategies, and identifies the leading strategy among all three.

## Alternate Flows

- If the user provides an explicit exit sale price, the system uses it instead of the appreciation-rate model.
- If MRTT or MLTT is marked as financed, the loan principal increases before instalment calculation.
- If the holding period equals the full financing tenure, the remaining loan balance at sale is zero.
- If the holding period is shorter than the financing tenure, the property summary must show the remaining loan balance deducted at exit.
- If rental cash flow is negative in any year, that negative amount remains visible as additional out-of-pocket cash burden.
- If the user sets REIT initial capital to zero, both REIT strategies still project growth entirely from their monthly contributions.
- If the property's scheduled monthly instalment or monthly-equivalent costs change because financing or expense inputs changed, both REIT strategies' monthly contribution amounts must be recalculated to stay matched.

## Error and Empty States

- If any required input is missing, the system blocks calculation and highlights the missing field.
- If purchase price, loan amount, tenure, holding period, rent, or capital values are negative, the system rejects the input.
- If holding period exceeds financing tenure, the system rejects the input.
- If occupancy is outside the allowed range, the system rejects the input.
- If financing rate, appreciation rate, or REIT return is negative, the system rejects the input in v1.
- If the user has not entered enough data to compute all three strategies, the result area remains empty and explains what is still required.

## Acceptance Criteria

- The feature compares one buy-to-rent property path against two REIT paths (instalment-matched and instalment-and-costs-matched) within one bounded workflow.
- The property path includes maintenance, sinking fund, cukai taksiran, cukai tanah or cukai petak, Indah Water, repair allowance, fire insurance, other costs, and MRTT or MLTT treatment.
- The property path shows yearly loan balance, yearly net rental cash flow, cumulative user cash outflow, and final exit proceeds.
- Each REIT path shows projected ending value over the same holding period, and its initial capital input accepts zero.
- Both REIT paths' monthly contribution amounts are derived from the property strategy's scheduled monthly instalment, with the second path also including the property's monthly-equivalent recurring costs.
- The result identifies the leading strategy among the property path and both REIT paths using net return over the same horizon.
- If the property is sold before loan maturity, the remaining loan balance is deducted from exit proceeds and shown explicitly.
- Invalid inputs are rejected before comparison results are shown.

## Related Specs

- API: none yet
- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)
