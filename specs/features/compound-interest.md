# Compound Interest Calculator

## Status

Draft

## Goal

Help a user estimate how money grows over time under compound returns, with optional recurring contributions.

The feature exists to provide a simple, reusable projection tool for users who want to understand the effect of rate, time, compounding frequency, and contribution discipline.

## Scope

This feature includes:

- one principal-based growth scenario
- optional recurring contributions
- configurable annual interest or return rate
- configurable compounding frequency
- configurable projection duration
- time-series outputs and summary metrics for ending balance, total contributions, and total growth

## Out of Scope

- variable rates by period in v1
- tax, inflation, fees, or zakat adjustments
- stochastic market simulation or Monte Carlo analysis
- withdrawals or contribution holidays in v1
- scenario saving, server-side persistence, or account-based management

## Actors

- user estimating future value from a starting balance and optional recurring contributions

## Preconditions

- the user provides a starting principal amount
- the user provides an annual rate assumption
- the user provides a projection duration
- the user provides a compounding frequency

## Inputs

- starting principal
- annual interest or return rate
- duration in years
- compounding frequency
- optional recurring contribution amount
- recurring contribution frequency

## Calculation Model

The initial release uses one explicit compound-growth model so results remain predictable and explainable.

### Base Growth Model

- The annual rate is fixed for the full projection duration.
- Compounding occurs according to the selected compounding frequency.
- If there are no recurring contributions, future value is calculated using the standard compound-interest formula.

### Recurring Contribution Model

- Recurring contributions are optional.
- When contributions are enabled, each contribution is added at the end of its contribution period in v1.
- If contribution frequency differs from compounding frequency, the system must use a consistent period-based projection method rather than mixing formulas informally.
- The result must reflect both principal growth and contribution-driven growth.

### Summary Metrics

- final projected balance
- total principal and recurring contributions paid in
- total growth above contributed capital
- optional time-series points for charting by period or year

## Assumptions

- v1 uses a fixed annual rate for the full duration
- recurring contributions, when present, are made at the end of each contribution period
- all outputs are nominal and do not adjust for inflation, tax, or fees
- the calculator does not model losses beyond what a negative rate input would imply, and negative rates are rejected in v1

## Main Flow

1. The user enters starting principal, annual rate, duration, and compounding frequency.
2. The user optionally enters a recurring contribution amount and contribution frequency.
3. The system calculates projected growth using the documented compound-growth model.
4. The system returns the ending balance, total contributions, total growth, and a time-series projection suitable for charts or tables.

## Alternate Flows

- If recurring contribution amount is zero or omitted, the system runs a principal-only projection.
- If annual rate is zero, the ending balance equals total contributed capital with no growth.
- If the duration is zero, the ending balance equals the starting principal plus any contributions already due at time zero, which is none in v1.

## Error and Empty States

- If any required input is missing, the system blocks calculation and highlights the missing field.
- If starting principal or duration is negative, the system rejects the input.
- If the annual rate is negative, the system rejects the input in v1.
- If a recurring contribution amount is negative, the system rejects the input.
- If compounding frequency or contribution frequency is outside the supported set, the system rejects the input.
- If the user has not entered enough inputs to compute the projection, the result area remains empty and explains what is still required.

## Acceptance Criteria

- The feature supports principal-only projections and projections with recurring contributions within one bounded workflow.
- The feature uses one documented fixed-rate compound-growth model and does not silently switch formulas across inputs.
- The result includes, at minimum, final projected balance, total contributions, and total growth.
- When contributions are enabled, the result incorporates them using a documented end-of-period assumption.
- Invalid inputs are rejected before projection results are shown.

## Related Specs

- API: none yet
- UI: none yet
- Acceptance: none yet
