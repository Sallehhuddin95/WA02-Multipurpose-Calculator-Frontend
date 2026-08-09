# Car Loan and Early Settlement

## Status

Draft

## Goal

Help a user understand the regular repayment cost of a car loan and, optionally, the projected settlement amount if the loan is paid off early.

The Hire-Purchase (Amendment) Act 2026 (effective 1 June 2026) replaced the flat-rate and Rule of 78 methods with a reducing-balance method and Effective Interest Rate (EIR) disclosure for new hire-purchase agreements, while allowing existing flat-rate agreements to continue under a transition period. The feature exists to make the cost of financing, the remaining obligation, and the effect of an early payoff explicit under two documented v1 models: a variable-rate reducing-balance model reflecting current law, and a fixed-rate flat-rate model retained for users comparing against or holding a legacy agreement.

## Scope

This feature includes:

- one car loan scenario with user-defined vehicle price, down payment, tenure, and rate-mode assumptions
- two selectable rate modes presented as tabs: variable rate (reducing balance, selected by default) and fixed rate (flat rate with Rule of 78, legacy)
- one standard repayment view for the full loan term, always shown regardless of rate mode
- one optional early-settlement view for a selected settlement month, shown only when the user opts in; unchecked by default
- one explicit v1 interest model per rate mode, and one settlement calculation appropriate to the selected rate mode
- a plain-language glossary explaining every summary metric label on the same page, following the shared metric-glossary UI pattern
- monthly and summary outputs appropriate to the selected rate mode

## Out of Scope

- bank-specific hire-purchase agreements, fees, or legal wording differences
- late-payment penalties, missed payments, arrears, or restructuring scenarios
- simulated future changes to the variable reference rate during the projection horizon; the rate is treated as fixed for the full horizon in v1
- enforcement of regulatory interest-rate ceilings beyond informational display
- refinancing into a new lender or debt-consolidation scenarios
- tax, insurance, road tax, maintenance, or total-cost-of-ownership modeling beyond the loan itself
- server-side persistence or account-based scenario management

## Actors

- retail borrower evaluating a car loan before signing
- existing borrower estimating how much would be payable if the loan is settled early

## Preconditions

- the user provides a vehicle price or loan principal basis
- the user provides either a down payment amount or a final financed principal
- the user provides a loan tenure in years
- the user selects a rate mode: variable rate or fixed rate
- the user provides an annual interest rate appropriate to the selected rate mode
- the user provides an early-settlement month only if early settlement is enabled

## Inputs

- vehicle price
- down payment amount or percentage
- financed principal if entered directly
- loan tenure in years
- rate mode selection: variable rate or fixed rate
- annual interest rate (labeled as Effective Interest Rate for variable rate; flat annual interest rate for fixed rate)
- early settlement enabled toggle (unchecked by default)
- early-settlement month number, required only when early settlement is enabled

## Calculation Model

The initial release supports two rate-mode calculation models so the tool reflects both Malaysia's current reducing-balance hire-purchase rules and legacy flat-rate agreements still in force. The user selects exactly one rate mode at a time; the two models are never blended in the same result.

### Principal Derivation

- Financed principal derivation from vehicle price and down payment, or from a directly entered financed principal, is identical for both rate modes.

### Variable-Rate Model (Reducing Balance)

- This is the default rate mode, reflecting the Hire-Purchase (Amendment) Act 2026 reducing-balance requirement for new agreements effective 1 June 2026.
- Monthly interest is calculated on the outstanding balance, not the original principal, using the same shared reducing-balance amortization engine already used by the ASB financing feature; this mode must not implement a second, separate reducing-balance calculation.
- The scheduled monthly instalment, total interest, and total repayable amount are derived from that amortization schedule.
- The annual rate entered for this mode represents the Effective Interest Rate (EIR) and is treated as fixed for the entire projection horizon.
- When early settlement is enabled, the settlement amount is the outstanding loan balance at the selected month, taken directly from the amortization schedule. No separate rebate formula is used, consistent with the Act's intent that early settlement reflect the true remaining principal.

### Fixed-Rate Model (Flat Rate, Rule of 78)

- This is the legacy rate mode, retained for users comparing against or holding an older-style flat-rate agreement.
- Total interest is calculated from financed principal multiplied by flat annual interest rate and loan tenure.
- Total repayable amount is financed principal plus total interest.
- Scheduled monthly instalment is total repayable amount divided evenly across the full number of months in the tenure.
- When early settlement is enabled, the settlement amount uses a Rule of 78 style rebate model: earned interest is determined by the elapsed portion of the tenure using the Rule of 78 weighting, unearned interest is the remaining portion of flat-rate interest not yet earned under that same weighting, and the settlement amount is the remaining principal obligation plus earned interest minus the unearned-interest rebate.
- The feature must describe in the UI that the fixed-rate early-settlement result is based on a documented Rule of 78 style projection, not a lender-specific payoff quote.

### Summary Metrics

- financed principal (both rate modes)
- scheduled monthly instalment (both rate modes)
- total interest over the full term (both rate modes; labeled as total flat interest for the fixed-rate mode)
- total repayable amount (both rate modes)
- total paid up to the selected settlement month (both rate modes, only when early settlement is enabled)
- earned interest up to the selected settlement month (fixed-rate mode only, when early settlement is enabled)
- unearned-interest rebate (fixed-rate mode only, when early settlement is enabled)
- remaining loan balance at the selected settlement month (variable-rate mode only, when early settlement is enabled)
- projected settlement amount (both rate modes, only when early settlement is enabled)

## Assumptions

- v1 supports exactly two rate modes, variable rate (reducing balance) and fixed rate (flat rate with Rule of 78); the two models are never mixed for the same scenario
- variable rate is the default selected mode, reflecting the Hire-Purchase (Amendment) Act 2026 reducing-balance requirement effective 1 June 2026
- fixed rate remains available for users holding or comparing against a legacy flat-rate agreement, consistent with existing agreements being grandfathered under the Act's transition provisions
- the annual rate for either mode is treated as fixed for the full projection horizon; v1 does not simulate future reference-rate or OPR changes
- early settlement is optional and disabled by default; the early-settlement input and its result only appear once the user opts in
- the variable-rate model reuses the same shared reducing-balance amortization engine as the ASB financing feature rather than a separate implementation
- v1 does not enforce regulatory interest-rate ceilings; any rate cap guidance shown is informational only
- all outputs are nominal and do not adjust for inflation

## Main Flow

1. The user enters vehicle price, down payment or financed principal, and loan tenure.
2. The user selects a rate mode: variable rate (default) or fixed rate.
3. The user enters the annual interest rate appropriate to the selected rate mode.
4. The system derives the financed principal if the user started from vehicle price and down payment.
5. The system calculates the scheduled monthly instalment, total interest, and total repayable amount using the model for the selected rate mode.
6. The system displays the full-loan summary for the selected rate mode.
7. The user may optionally enable early settlement; when enabled, the user enters an early-settlement month.
8. If early settlement is enabled, the system calculates the settlement amount and supporting figures using the model appropriate to the selected rate mode.
9. The system returns a comparison between staying on schedule and settling early at the selected month, only when early settlement is enabled.

## Alternate Flows

- If the user enters financed principal directly, the system does not require vehicle price and down payment to compute the loan.
- If the user switches rate mode, the system recalculates using the newly selected mode's model without mixing results from the previously selected mode.
- If early settlement is not enabled, no early-settlement input or result is shown.
- If early settlement is enabled and the settlement month is month 1, the result still reflects that month under the selected rate mode's model.
- If early settlement is enabled and the settlement month equals the final month of the tenure, the settlement amount is zero: for variable rate because the amortization schedule reaches full repayment, and for fixed rate because all scheduled payments are assumed complete.
- If the fixed annual interest rate is zero, total repayable amount equals financed principal and no interest rebate applies.
- If the variable annual interest rate is zero, total interest is zero and the monthly instalment equals financed principal divided by total months.

## Error and Empty States

- If any required input is missing, the system blocks calculation and highlights the missing field.
- If vehicle price, financed principal, down payment, or tenure is negative, the system rejects the input.
- If down payment exceeds vehicle price when both are provided, the system rejects the input.
- If the annual interest rate for either rate mode is negative, the system rejects the input.
- If the tenure is zero or not a whole number of years in v1, the system rejects the input.
- If early settlement is not enabled, the system does not require or validate an early-settlement month.
- If early settlement is enabled and the settlement month is less than 1 or greater than the total loan months, the system rejects the input.
- If the user has not entered enough inputs to compute the selected rate mode, the result area remains empty and explains what is still required.

## Acceptance Criteria

- The feature supports exactly two rate modes, variable rate and fixed rate, presented as tabs, with variable rate selected by default.
- The variable-rate mode uses the shared reducing-balance amortization engine also used by the ASB financing feature and does not duplicate that calculation logic.
- The fixed-rate mode preserves the existing flat-rate and Rule of 78 behavior unchanged for users who select it.
- Early settlement is optional and unchecked by default; the early-settlement input and result only appear once the user opts in.
- When early settlement is enabled under variable rate, the settlement amount equals the outstanding loan balance at the selected month.
- When early settlement is enabled under fixed rate, the settlement amount uses the existing documented Rule of 78 model unchanged.
- The result always includes, at minimum, financed principal, total interest, total repayable amount, and scheduled monthly instalment for the selected rate mode.
- When early settlement is enabled, the result includes total paid to date and projected settlement amount, plus earned interest and unearned-interest rebate for fixed rate, or remaining loan balance for variable rate.
- The page provides a plain-language glossary for every summary metric label shown, following the shared metric-glossary UI pattern, reachable without relying on hover-only interaction.
- Invalid inputs are rejected before loan or settlement results are shown, regardless of the selected rate mode.

## Related Specs

- API: none yet
- UI: none yet
- Acceptance: none yet
