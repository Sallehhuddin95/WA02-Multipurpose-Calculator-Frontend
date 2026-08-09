# ASB Financing Comparison

## Status

Draft

## Goal

Help a user compare three ways of committing money toward ASB growth over the same analysis horizon:

- take ASB financing and let dividends remain invested
- take ASB financing and use dividends to offset future monthly instalments
- skip financing and contribute the same monthly cash amount directly into ASB

The feature exists to make the tradeoff between leverage, cash commitment, and projected ending value explicit under one consistent projection model.

## Scope

This feature includes:

- one ASB financing scenario with user-defined principal, tenure, and financing rate assumptions
- one shared annual dividend-rate assumption applied across all comparison strategies
- one shared annual side-investment return-rate assumption for cash the dividend-offset strategy frees up from the user's monthly commitment
- one explicit v1 projection model for instalment and dividend treatment
- one equal-total-monthly-cash-commitment principle so all three strategies commit the same user cash over the same horizon
- one comparison view covering all three strategies on the same horizon
- a documented surrender value for both financed strategies so users evaluating early termination can see equity paid down separately from dividend or side-investment profit
- a plain-language glossary explaining every summary metric label on the same page
- a ranked comparison table showing final profit across all three strategies, with the top strategy visually distinguished
- yearly projection outputs for balance growth, dividends, loan balance, side-investment value, and user cash outflow
- a summary comparison of final asset value, total user cash paid, and net position

## Out of Scope

- bank-specific ASBF product variations, fees, and legal documentation differences
- variable dividend rates by year in the initial version
- exact replication of every bank's ASBF repayment convention or ASB's internal day-count mechanics when they differ from the documented v1 model used here
- refinancing, restructuring, missed payments, or default scenarios
- tax, zakat, inflation adjustment, and opportunity-cost modeling beyond the defined comparison strategies
- saving scenarios to a server or sharing them across user accounts

## Actors

- retail investor evaluating whether ASB financing improves projected wealth accumulation compared with direct ASB contributions

## Preconditions

- the user provides a financing principal
- the user provides a financing tenure in years
- the user provides a financing rate assumption
- the user provides an annual ASB dividend-rate assumption
- the user provides an annual side-investment return-rate assumption
- the user provides an analysis horizon that does not exceed the financing tenure

## Inputs

- financing principal
- financing tenure in years
- annual financing rate
- annual ASB dividend rate
- annual side-investment return rate
- analysis horizon in years

## Calculation Model

The initial release uses one explicit projection model so all three strategies can be compared consistently.

### Financing Instalment Model

- The financing strategy uses a standard reducing-balance amortizing loan model.
- The scheduled monthly instalment is computed from principal, annual financing rate, and tenure.
- Monthly financing interest is derived from the annual financing rate divided by 12.
- Each monthly payment reduces interest due first and principal second.

### Dividend Projection Model

- The annual dividend rate is fixed for the entire analysis horizon.
- Dividends are projected and credited once per analysis year.
- Each year's dividend is calculated from the projected ASB balance at the end of that year before dividend crediting.
- Once credited, dividends become part of the ASB balance for subsequent years unless the strategy explicitly redirects them.

### Side-Investment Model

- Only the dividend-offset strategy produces a side investment; the other two strategies always show zero side-investment value.
- The side investment receives a monthly contribution whenever the user's monthly allocated money is not needed in full to cover that month's instalment.
- The annual side-investment return rate is fixed for the entire analysis horizon.
- Side-investment growth is credited once per analysis year on the side-investment balance before crediting, using the same once-per-year crediting cadence as the ASB dividend model.

### Surrender Value Model

- Surrender value represents the equity a user would recover from the bank if the financing were terminated at the end of the analysis horizon, before adding any dividend or side-investment profit.
- Surrender value is defined as financing principal minus the remaining loan balance at the end of the analysis horizon. It uses no other inputs and does not include dividends, side-investment value, or ASB balance growth.
- Surrender value applies only to the compounding and dividend-offset strategies, since both involve financing. It is not applicable to the direct ASB strategy, which has no loan and therefore nothing to surrender.
- Net position for a financed strategy is equal to surrender value plus that strategy's accumulated profit bucket (cumulative dividends reinvested in ASB for the compounding strategy, or final side-investment value for the dividend-offset strategy). This decomposition must hold exactly; a strategy's accumulated profit must never be counted both inside its ASB balance and again as a separate addition, since that would double-count the same dividends.

### Strategy-Specific Treatment

- Compounding strategy:
  - the full financed principal is invested into ASB at the start of year 1
  - dividends remain in ASB and compound
  - the user pays the full monthly instalment out of pocket throughout the horizon
- Dividend-offset strategy:
  - the full financed principal is invested into ASB at the start of year 1
  - the user's monthly allocated money equals the scheduled monthly instalment from the compounding strategy, identical to the amount committed in the other two strategies
  - yearly dividends are generated using the same dividend model and are added to an instalment reserve instead of remaining invested in ASB
  - each month, the reserve is applied against that month's instalment before any other treatment:
    - if the reserve does not fully cover the instalment, the reserve covers what it can, the user pays the remaining shortfall from the monthly allocated money, the portion of the monthly allocated money the reserve covered is contributed to the side investment, and the reserve becomes zero
    - if the reserve fully covers the instalment, the user pays nothing out of pocket that month, the entire monthly allocated money is contributed to the side investment, and the instalment amount is deducted from the reserve
  - the reserve carries forward from month to month for as long as it has a positive balance; it is never reset to zero or swept into ASB except by being spent down against instalments
  - the side investment accumulates the monthly contributions described above and grows using the documented side-investment model
- Direct ASB strategy:
  - no loan is created
  - the monthly contribution amount equals the scheduled monthly instalment from the compounding strategy
  - monthly contributions accumulate throughout each year
  - the annual dividend is calculated on the end-of-year projected balance before dividend crediting

### Summary Metrics

- final ASB value
- cumulative dividends generated
- final side-investment value (dividend-offset strategy only; zero for the other two strategies)
- cumulative side-investment contributions (dividend-offset strategy only; zero for the other two strategies)
- cumulative out-of-pocket cash paid by the user
- remaining loan balance for financed strategies
- surrender value for financed strategies (not applicable to the direct ASB strategy), defined as financing principal minus remaining loan balance
- net position defined as final ASB value plus final side-investment value minus remaining loan balance

## Result Presentation

### Metric Glossary

- The page must provide a plain-language definition for every summary metric label shown on the page: final ASB value, cumulative dividends, side-investment value, cash paid by you, remaining loan balance, surrender value, and net position.
- Definitions follow the shared metric-glossary pattern in the UI spec: one consolidated glossary section on the same page, reachable via a keyboard- and tap-reachable disclosure, not hover-only tooltips repeated per card.
- Each definition is one short, plain-language sentence, consistent with the existing form helper-text tone, and must not use jargon to explain jargon. For example: "Surrender value: the amount of your original financing you would get back from the bank if you ended the facility today, before counting any dividend or side-investment profit."

### Strategy Ranking Table

- The page must show one ranked comparison table listing all three strategies ordered from highest to lowest final profit for the selected analysis horizon.
- Final profit in this table is exactly the existing net position value for each strategy; the table must not introduce a second or different profit calculation.
- The table and the existing per-strategy "leading strategy" indicator must be driven by the same net position ranking and must never disagree with each other.
- The first-ranked strategy uses a distinct visual emphasis (a green accent). The second and third-ranked strategies use the same normal, neutral styling as each other; no strategy is styled as a negative or warning outcome based on rank alone.
- Rank is always shown as an explicit text or numeric indicator (for example "#1" or "Rank 2") alongside any colour treatment; colour alone must never be the only way rank is communicated.

## Assumptions

- v1 uses a reducing-balance monthly amortization model for financing
- the annual dividend rate is fixed across the full analysis horizon
- dividends are credited once per year using the documented projection model in this spec
- the annual side-investment return rate is fixed across the full analysis horizon and credited once per year using the same cadence as the ASB dividend model
- all outputs are nominal and do not adjust for inflation
- the direct ASB strategy uses the same baseline monthly cash commitment as the scheduled monthly instalment in the compounding strategy
- all three strategies commit the same total monthly cash amount from the user over the same horizon; strategies differ only in where that committed cash and its growth end up
- no withdrawals are made from ASB in the dividend-offset strategy; dividends are redirected into the reserve instead of being credited to ASB, and the reserve is only ever reduced by being spent against monthly instalments, never swept back into ASB or reset early

## Main Flow

1. The user enters the financing principal, tenure, financing rate, annual dividend rate, annual side-investment return rate, and analysis horizon.
2. The system calculates the scheduled monthly instalment for the financing scenario.
3. The system simulates the compounding strategy:
   - the financed principal is treated as the starting ASB amount
   - dividends are added back into the ASB balance each year
   - the user pays the full monthly instalment out of pocket throughout the horizon
4. The system simulates the dividend-offset strategy:
   - the financed principal is treated as the starting ASB amount
   - dividends are generated each year from the projected ASB balance and added to an instalment reserve instead of remaining invested
   - each month, the instalment is deducted from the reserve whenever the reserve can cover it, in which case that month's monthly allocated money is contributed to the side investment; any shortfall the reserve cannot cover is paid by the user; the reserve carries forward from month to month until depleted
   - the side investment grows using the documented annual side-investment return-rate assumption
5. The system simulates the direct ASB strategy:
   - no financing is created
   - the user contributes a monthly amount equal to the scheduled monthly instalment from the compounding strategy
   - the ASB balance grows using the same annual dividend-rate assumption
6. The system returns a comparison view that shows yearly progress and final summary metrics for all three strategies.
7. The system identifies the leading strategy for the selected horizon based on net position and shows the supporting summary values.

## Alternate Flows

- If the analysis horizon equals the full financing tenure, the comparison runs to loan maturity.
- If the analysis horizon is shorter than the financing tenure, the summary must still show the remaining loan balance for financed strategies.
- If the reserve in the dividend-offset strategy does not fully cover a given month's instalment, the remaining instalment amount stays payable by the user, the reserve-covered portion of that month's allocated money is contributed to the side investment, and the reserve becomes zero.
- If the reserve fully covers a given month's instalment, the user pays nothing out of pocket that month, the entire monthly allocated money is contributed to the side investment, and the instalment amount is deducted from the reserve, leaving any remainder to carry forward to the next month.
- A reserve large enough to cover multiple consecutive months of instalments must free the user's monthly allocated money into the side investment for every one of those months, not only the first month after the dividend is credited.
- If the financing rate is zero, the instalment is still computed over the tenure using straight principal repayment with zero financing interest.
- If the dividend rate is zero, all strategies still project balances and cash flow without dividend growth.
- If the side-investment return rate is zero, the side investment still accumulates contributions without growth.

## Error and Empty States

- If any required numeric input is missing, the system blocks calculation and highlights the missing field.
- If principal, tenure, or horizon is zero or negative, the system rejects the input.
- If the analysis horizon exceeds the financing tenure, the system rejects the input.
- If the financing rate, dividend rate, or side-investment return rate is negative, the system rejects the input.
- If the financing tenure or horizon is not a whole number of years, the system rejects the input in v1.
- If the user has not entered enough inputs to compute the comparison, the result area remains empty and explains what is still required.

## Acceptance Criteria

- The feature compares exactly three strategies within one bounded ASB financing workflow.
- The direct ASB strategy uses the financed strategy's scheduled monthly instalment as the comparison contribution amount.
- All three strategies use the same analysis horizon and annual dividend-rate assumption.
- The result includes, at minimum, yearly projected ASB value, yearly dividends, cumulative user cash outflow, final side-investment value where applicable, and final net position for each strategy.
- Financed strategies show remaining loan balance whenever the analysis horizon ends before loan maturity.
- Financed strategies show a surrender value, defined as financing principal minus remaining loan balance, distinct from and shown alongside net position; the direct ASB strategy does not show a surrender value.
- For each financed strategy, net position is verifiably equal to surrender value plus that strategy's accumulated profit bucket, with no dividend or side-investment amount counted more than once.
- The page shows a plain-language definition for every summary metric label listed in this spec, reachable without relying on hover-only interaction.
- The page shows one ranked comparison table of all three strategies ordered by net position; the top-ranked strategy is visually distinguished and rank is never conveyed by colour alone.
- The ranking table and the leading-strategy indicator on each strategy card always agree, since both are driven by the same net position value.
- The dividend-offset strategy never hides unpaid instalment amounts; any uncovered amount remains visible as user out-of-pocket cash flow.
- All three strategies commit the same total monthly cash amount from the user over the same analysis horizon; the dividend-offset strategy never reduces the user's total committed cash relative to the other strategies, it only changes where that cash and its growth end up.
- The dividend-offset strategy's freed-up monthly cash is tracked in a documented side investment using its own annual return-rate assumption and never disappears from the comparison.
- The dividend-offset strategy's reserve carries forward month-to-month and is only reduced by covering instalments; a single year's dividend that exceeds one month's instalment must free the user's monthly allocated money into the side investment for every month it covers, not just the first month after crediting.
- The feature uses one documented reducing-balance financing model for both financed strategies and does not silently switch formulas by bank.
- The feature uses one documented annual dividend-crediting model for all strategies and exposes that assumption in the UI.
- Invalid inputs are rejected before projection results are shown.

## Related Specs

- API: none yet
- UI: none yet
- Acceptance: none yet
