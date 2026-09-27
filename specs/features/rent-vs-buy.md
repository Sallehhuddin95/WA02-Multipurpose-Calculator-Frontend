# Rent Versus Buy Comparison

## Status

Draft

## Goal

Help a user decide whether buying a home with a mortgage is projected to build more equity over a chosen horizon than renting the same home and investing the monthly cost difference in a growth portfolio.

The feature makes the full monthly cost of owning visible, then answers one question: at the end of the comparison horizon, does the buyer's home equity beat the renter's investment portfolio, and if so, in which year does the buyer pull ahead?

## Scope

This feature includes:

- one buy path: a home purchased at a user-defined price with a reducing-balance amortizing mortgage sized by the down payment percent
- one rent path: a flat monthly rent, where the renter invests the difference between the buy path's monthly budget and the rent
- user-defined home price, down payment percent, annual financing rate, financing tenure, comparison horizon, recurring ownership costs, rent, appreciation, and renter return assumptions
- buyer equity projection from home appreciation minus remaining loan balance
- renter portfolio projection using monthly contributions with monthly compounding
- a year-by-year comparison table showing remaining loan balance, buyer equity, renter portfolio value, and the leader for each year
- a break-even year, defined as the first year buyer equity is greater than or equal to the renter portfolio value
- a verdict identifying the leading path at the end of the horizon

## Out of Scope

- one-off costs: down payment cash, legal fees, stamp duty, agent fees
- MRTT or MLTT insurance and any other insurance premiums
- occupancy or vacancy assumptions
- exit-price mode; only the appreciation-rate model is used
- rent escalation, rental deposits, or any rent-side costs beyond the flat monthly rent
- RPGT, income tax, zakat, or inflation modeling
- refinancing, restructuring, or default scenarios
- selling costs at exit
- multiple properties in one scenario
- stochastic market simulation or Monte Carlo analysis
- server-side persistence or account-based scenario management

## Route, Copy, and Storage Conventions

- top-level route: `/rent-vs-buy`
- feature module: `features/rent-vs-buy/` following the standard feature structure (components, hooks, schemas, services, types, index barrel)
- i18n namespace: `rentBuy.*`
- route copy: `route.rentVsBuy.*`
- navigation entry: `nav.rentVsBuy`
- home card copy: `home.rentVsBuy.*`
- storage key: `rent-vs-buy:form:v1`, following the `<feature>:form:v<N>` convention from the form state persistence spec

## Actors

- a prospective home buyer or renter comparing the two paths over a chosen horizon

## Preconditions

- the user provides a home price
- the user provides a down payment percent between 0 and 100 inclusive
- the user provides an annual financing rate and financing tenure in years
- the user provides a comparison horizon in years that is at least 1 and does not exceed the financing tenure
- the user provides recurring ownership costs (maintenance, cukai taksiran, cukai tanah or cukai petak, Indah Water, other monthly costs)
- the user provides a flat monthly rent
- the user provides an annual appreciation rate and an annual renter return assumption

## Inputs

Buy path:

- home price
- down payment percent (0 to 100 inclusive; 0 is allowed)
- annual financing rate
- financing tenure in years
- comparison horizon in years (default 5, user-editable)
- monthly maintenance
- annual cukai taksiran
- annual cukai tanah or cukai petak
- annual Indah Water cost
- other monthly costs

Rent path:

- flat monthly rent

Assumptions:

- annual home appreciation rate (default 3, user-editable)
- annual renter return rate (default 5, user-editable)

Derived values (not user-entered):

- loan principal, sized by home price and down payment percent only
- scheduled monthly instalment
- monthly-equivalent ownership costs
- buy monthly budget
- renter monthly investment

## Calculation Model

### Loan and Ownership Cost Model

- Loan principal is `homePrice * (1 - downPaymentPercent / 100)`.
- The down payment percent sizes the loan only. The down payment cash itself is excluded from all costs because one-off costs are out of scope.
- The loan uses a standard reducing-balance amortizing monthly model via `buildAmortizationSchedule`, with monthly rate equal to the annual rate divided by 12 and interest paid first, principal second.
- Scheduled monthly instalment is `amortization.monthlyInstalment`.
- Monthly-equivalent ownership costs are:

  `monthlyEquivalentOwnershipCosts = monthlyMaintenance + otherMonthlyCosts + (annualCukaiTaksiran + annualCukaiTanahOrPetak + annualIndahWaterCost) / 12`

- Buy monthly budget is:

  `buyMonthlyBudget = monthlyInstalment + monthlyEquivalentOwnershipCosts`

### Buyer Equity Model

- Home value at year N is:

  `homeValueAtYearN = homePrice * (1 + appreciationRate / 100) ^ N`

- Remaining loan balance at year N is `amortization.schedule[N * 12 - 1].remainingBalance`. Because the horizon never exceeds the financing tenure, the row always exists.
- Buyer equity at year N is:

  `buyerEquityAtYearN = homeValueAtYearN - remainingLoanBalanceAtYearN`

### Renter Portfolio Model

- Renter monthly investment is:

  `renterMonthlyInvestment = max(buyMonthlyBudget - monthlyRent, 0)`

- The portfolio projects via `projectMonthlyContributionGrowth` with zero initial capital:

  `projectMonthlyContributionGrowth({ initialCapital: 0, monthlyContribution: renterMonthlyInvestment, annualReturnRate: renterAnnualReturn, totalMonths: horizonYears * 12 })`

- Growth uses monthly compounding, and contributions are added at the end of each month (interest accrues first, then the contribution is added), matching the helper's convention.
- Renter portfolio value at year N is `growthPoints[N * 12 - 1].balance`.

### Comparison Outputs

- final buyer equity and final renter portfolio value at the horizon
- year-by-year table rows with year, remaining loan balance, buyer equity, renter portfolio value, and leader (buy, rent, or tied)
- break-even year: the first year N where `buyerEquityAtYearN >= renterPortfolioValueAtYearN`; none if no year satisfies it
- verdict: the leading path at the end of the horizon (buy, rent, or tied on exact equality)

## Reuse

This feature consumes the same shared helpers used by the property investment feature, following the consumption pattern in `features/property-investment/services/project-property-investment.ts`:

- `buildAmortizationSchedule` from `lib/financial-math/amortization/build-amortization-schedule.ts` for the loan schedule, instalment, and yearly remaining balances
- `projectMonthlyContributionGrowth` from `lib/financial-math/compound-growth/project-monthly-contribution-growth.ts` for the renter portfolio projection

No new financial-math helper is required for v1.

## Assumptions

- the mortgage uses a reducing-balance monthly amortization model
- down payment cash and all one-off acquisition costs are ignored; only the loan and recurring ownership costs are modeled
- the appreciation rate is fixed for the whole horizon and applied with annual compounding on the home value
- the renter return rate is fixed for the whole horizon and applied with monthly compounding
- rent is flat for the whole horizon; there is no escalation and no deposit
- ownership costs remain constant across the horizon unless the user changes them and recalculates
- renter contributions are made at the end of each month and the portfolio starts with zero capital
- all outputs are nominal and do not adjust for inflation

## Main Flow

1. The user opens `/rent-vs-buy` and enters home price, down payment percent, financing rate, financing tenure, comparison horizon, ownership costs, rent, appreciation, and renter return.
2. The system validates the inputs.
3. The system derives loan principal from home price and down payment percent.
4. The system builds the amortization schedule, reads the monthly instalment, and computes monthly-equivalent ownership costs and the buy monthly budget.
5. The system computes the renter monthly investment as the positive difference between the buy budget and rent.
6. The system projects home value and remaining loan balance for each year of the horizon and derives buyer equity per year.
7. The system projects the renter portfolio for the same horizon using end-of-month contributions and monthly compounding.
8. The system builds the year-by-year comparison table, finds the break-even year, and derives the verdict.
9. The system shows the summary, the comparison table, the break-even year, and the verdict.

## Alternate Flows

- If rent is greater than or equal to the buy monthly budget, the renter monthly investment is 0 and the renter portfolio stays at 0. The UI must state that the renter invests nothing. This is not an error.
- If the down payment percent is 0, the loan is fully financed and the loan principal equals the home price.
- If the horizon equals the financing tenure, the remaining loan balance at the final year is 0.
- If the horizon is shorter than the financing tenure, the remaining loan balance stays visible in each row and is subtracted from home value.
- If buyer equity and the renter portfolio value are exactly equal in a year, the leader column shows tied for that year.
- If no year satisfies `buyerEquityAtYearN >= renterPortfolioValueAtYearN`, there is no break-even year, and the verdict is rent.
- If the final values are exactly equal, the verdict states that the two paths are tied.

## Error and Empty States

- If any required input is missing, the system blocks calculation and highlights the missing field.
- If home price, ownership costs, rent, or any rate is negative, the system rejects the input.
- If the comparison horizon is less than 1, the system rejects the input.
- If the comparison horizon exceeds the financing tenure, the system rejects the input.
- If the down payment percent is outside 0 to 100 inclusive, the system rejects the input; 0 remains valid.
- If the user has not entered enough data to compute both paths, the result area remains empty and explains what is still required.
- The rent-greater-than-budget case (renter invests nothing) is a valid state with its own notice, not an error.

## Acceptance Criteria

- The feature compares one buy path and one rent path within one bounded workflow at route `/rent-vs-buy`, with feature module `features/rent-vs-buy/`, i18n namespace `rentBuy.*`, route copy `route.rentVsBuy.*`, nav entry `nav.rentVsBuy`, and home card copy `home.rentVsBuy.*`.
- The loan principal is derived from home price and down payment percent only, and the down payment cash is excluded from all costs.
- The scheduled monthly instalment and yearly loan balances come from the reducing-balance amortization model.
- The buy monthly budget equals the monthly instalment plus monthly-equivalent ownership costs, where annual cukai and Indah Water amounts are divided by 12.
- The renter monthly investment equals `max(buyMonthlyBudget - monthlyRent, 0)`, and when rent is greater than or equal to the buy budget the UI states that the renter invests nothing.
- The renter portfolio projects with zero initial capital, end-of-month contributions, monthly compounding, and a default 5 percent annual return that the user can edit.
- Buyer equity at year N equals `homePrice * (1 + appreciationRate / 100) ^ N` minus the remaining loan balance at year N, with a default 3 percent appreciation that the user can edit.
- The year-by-year table shows year, remaining loan balance, buyer equity, renter portfolio value, and the leader for each year.
- The break-even year is the first year buyer equity is greater than or equal to the renter portfolio value, and is reported as none if no such year exists.
- The verdict identifies the leading path at the end of the horizon, and reports tied on exact equality.
- Validation rejects negative values, horizons below 1, horizons above the financing tenure, negative rates, and down payment percents outside 0 to 100 inclusive.
- One-off costs, deposits, rent escalation, insurance, occupancy, and exit-price mode are not present in v1.

## Related Specs

- Features: [specs/features/form-state-persistence.md](./form-state-persistence.md) (storage key `rent-vs-buy:form:v1`)
- API: none yet
- UI: [specs/ui/initial-calculator-app.md](../ui/initial-calculator-app.md)
- Acceptance: [specs/acceptance/initial-calculator-release.md](../acceptance/initial-calculator-release.md)