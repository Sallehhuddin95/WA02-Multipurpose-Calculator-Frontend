# Retirement Fund Calculator

## Status

Draft

## Goal

Help a user plan for retirement under a Malaysian private-sector EPF-style savings model. The feature addresses two connected but distinct planning questions: how much a retirement fund can accumulate between now and retirement given ongoing contributions and an investment return assumption, and how long that accumulated fund will last under a withdrawal pattern designed to replicate the lump-sum gratuity and recurring pension structure of a government servant's retirement benefit.

The feature exists to make the full lifecycle of private-sector retirement saving — accumulation through working years and drawdown through retirement — visible under one consistent set of assumptions, so a user can evaluate whether an EPF-style savings plan can replicate the security of a defined government pension.

## Scope

This feature includes:

- one accumulation phase projection (Section A: Retirement Savings Projection) that grows a starting savings balance with monthly contributions over a user-defined horizon to retirement
- two contribution input modes for Section A — percentage of salary and fixed ringgit amount — with exactly one mode active at a time
- an optional employer contribution rate in percentage-of-salary mode for EPF-style combined employee-employer contribution modeling
- one drawdown phase simulation (Section B: Retirement Fund Longevity Simulation) that evaluates how long a lump sum lasts under a gratuity-equivalent one-time withdrawal and a pension-equivalent recurring monthly withdrawal
- two drawdown scenarios in Section B — stays invested and fully withdrawn — presented side by side within one comparison view, both visible simultaneously without the user switching between them
- a starting balance for Section B that defaults to Section A's final capital output but remains directly editable for standalone use
- one annual-crediting model for investment return in both sections, consistent with the ASB financing dividend-crediting convention used in this repo
- a 100-year simulation horizon cap for Section B to bound the case where the stays-invested balance never depletes
- a yearly projection table for Section A and a per-scenario depletion table for Section B, each collapsed by default and expandable via a keyboard- and tap-reachable disclosure control

## Out of Scope

- variable return rates by year or period in v1
- inflation, tax, zakat, EPF withdrawal rule enforcement, or regulatory contribution limits
- Monte Carlo or stochastic simulation
- defined-benefit pension calculation for government servants
- multiple contribution phases, step-up contribution schedules, or contribution holidays in v1
- EPF or bank provider-specific product rules, fees, or administrative conventions
- server-side persistence or account-based scenario management
- salary band or career-progression modeling beyond a single fixed annual salary increment rate

## Actors

- private-sector employee projecting how an EPF-style savings plan accumulates through working years and how long the accumulated fund lasts under a gratuity-and-pension drawdown structure

## Preconditions

- the user provides a starting savings balance for Section A, which may be zero
- the user provides a years-to-retirement horizon for Section A as a whole number of years
- the user provides an annual investment return rate for Section A
- the user selects a contribution input mode for Section A and provides the required inputs for that mode
- the user may enter Section B directly with a manually entered starting balance, or proceed from Section A in which case the starting balance defaults to Section A's final capital

## Inputs

### Section A: Retirement Savings Projection

- initial savings balance (RM) — the user's current retirement savings; may be zero
- years to retirement — whole years only; must be at least one year
- annual investment or dividend return rate (%) — fixed for the full accumulation horizon
- annual salary increment rate (%) — may be zero; drives salary growth once per year
- contribution input mode — exactly one of the following two modes is active at any time:
  - **Percentage of salary:** requires current monthly salary (RM) and an employee contribution rate (%) applied to that salary; an employer contribution rate (%) is also available in this mode and defaults to zero when not entered
  - **Fixed ringgit amount:** requires a fixed monthly contribution amount (RM) that does not scale with the annual salary increment rate

### Section B: Retirement Fund Longevity Simulation

- starting balance (RM) — defaults to Section A's final capital when Section A has been calculated, but remains directly editable; may be entered independently when Section B is used without running Section A first
- one-time lump-sum withdrawal (RM) — deducted at the start of month 1; may be zero
- fixed recurring monthly withdrawal (RM) — deducted every month beginning in month 1; may be zero for a lump-sum-only simulation
- post-retirement annual return rate (%) — applies to the stays-invested scenario only; this is a separate input from Section A's annual return rate, defaulting to the same value as Section A's return rate when Section A has been run, and must be confirmed or entered before Section B calculates; this matches the convention in this repo of giving each phase its own rate assumption rather than forcing reuse across phases

## Calculation Model

The initial release uses one explicit accumulation model for Section A and one explicit drawdown model for Section B so results remain predictable and explainable.

### Section A: Accumulation Model

#### Salary and Contribution Growth Model

- Monthly contributions accumulate throughout each year.
- In percentage-of-salary mode, the total monthly contribution is the sum of the employee contribution rate and the employer contribution rate, both applied to the current monthly salary. When the employer contribution rate is zero, the total monthly contribution equals the employee rate only.
- In fixed ringgit amount mode, the monthly contribution is the user-entered fixed amount throughout the entire projection. This amount does not change when salary grows. The fixed contribution is deliberately decoupled from the salary increment rate; this is a design decision, not an omission.
- Salary grows once per year by the annual salary increment rate at the start of each new projection year. The first projection year uses the current monthly salary as entered.
- Because the total contribution in percentage-of-salary mode is derived from salary, it also grows once per year when salary grows by the salary increment rate.
- The employer contribution rate applies only in percentage-of-salary mode and has no effect in fixed ringgit amount mode.

#### Annual Dividend Crediting Model

- The annual investment or dividend return rate is fixed for the entire accumulation horizon.
- Return is credited once per year on the end-of-year balance before crediting. Monthly contributions accumulate throughout the year, and the year's return is then applied once to the resulting end-of-year balance before crediting. This is the same once-per-year crediting cadence documented in the ASB financing dividend model in this repo: contributions or cash flows occur throughout the year, and the annual return is credited in a single year-end operation.
- Return is not compounded monthly within each year. This is a deliberate choice consistent with real EPF dividend crediting behavior and with the ASB financing annual-crediting convention already documented in this repo.
- Once credited, the return becomes part of the balance and is included in subsequent years' calculations.

#### Summary Metrics — Section A

- final capital: the ending balance at the close of the last projection year
- total contributions: the cumulative sum of all monthly contributions paid in across all years, including both employee and employer portions
- total growth: final capital minus initial savings balance minus total contributions
- yearly projection table: one row per year showing year number, monthly salary for that year, total monthly contribution for that year (employee plus employer), and ending balance for that year after return crediting

### Section B: Drawdown Model

#### Month 1 Order of Operations

- In month 1, both the one-time lump-sum withdrawal and the first recurring monthly withdrawal are deducted. The total month-1 outflow is the sum of the lump-sum withdrawal amount and the monthly withdrawal amount. Neither withdrawal is deferred to a later month.
- This order of operations applies identically to both the stays-invested and fully-withdrawn scenarios.

#### Stays Invested Scenario

- After the month-1 deductions, the remaining balance continues to earn the post-retirement annual return rate.
- Return is credited once per year on the year-end balance after that year's monthly withdrawals have been deducted but before the annual return is added. This is the same mixed-cadence model used in the ASB financing spec: annual return crediting occurs once per year in a single year-end operation, while withdrawals are deducted every month throughout the year. The annual return crediting does not interrupt or adjust the monthly withdrawal schedule.
- Monthly withdrawals of the fixed recurring amount continue every month from month 1 until the balance reaches zero or the 100-year simulation cap is reached, whichever comes first.
- If a monthly withdrawal would reduce the balance below zero, the depletion point is that month; the recorded final withdrawal for that month is the actual remaining balance rather than the full scheduled withdrawal amount.

#### Fully Withdrawn Scenario

- No growth is applied. This scenario represents the user withdrawing the entire sum from their investment account into cash, so no investment return continues to accrue after withdrawal.
- After the month-1 deductions, the balance decreases by exactly the fixed recurring monthly withdrawal amount each month with no growth applied.
- The post-retirement annual return rate input has no effect on this scenario; the return is zero by design.
- If a monthly withdrawal would reduce the balance below zero, the same depletion rule applies as in the stays-invested scenario.

#### Simulation Horizon Cap

- The simulation runs for a maximum of 100 years, equivalent to 1,200 months.
- If the stays-invested balance has not reached zero by the end of month 1,200, the system stops the simulation and reports that the fund does not deplete within the 100-year simulation horizon. The system does not continue looping beyond month 1,200 and does not report an undefined, infinite, or blank result.
- This cap is a correctness requirement, not a soft limit. A sufficiently high post-retirement return rate relative to the monthly withdrawal will cause the stays-invested balance to grow rather than deplete. The system must handle this case explicitly and report it clearly.
- The fully-withdrawn scenario always depletes within a finite number of months given any positive monthly withdrawal; the 100-year cap applies as a general safety constraint and is most relevant for the stays-invested scenario.

#### Summary Metrics — Section B

- time to fund depletion for each scenario: expressed as years and months from the start of Section B until the balance first reaches zero; if the stays-invested scenario does not deplete within 100 years, the output states this explicitly in place of a numeric depletion time
- depletion table for each scenario: one row per month showing month number, lump-sum withdrawal (month 1 only), recurring withdrawal for that month, return credited in that period (stays-invested only, credited as a single entry at year-end), and closing balance; for long simulations this table may aggregate results per year instead of per month

## Result Presentation

### Side-by-Side Drawdown Comparison

- Section B always presents both drawdown scenarios — stays invested and fully withdrawn — side by side in one comparison view. The user does not need to toggle between scenarios to see both outcomes; both results are visible simultaneously at all times after calculation.
- The time-to-depletion result is the primary metric displayed prominently for each scenario in the comparison view.
- This matches the multi-strategy side-by-side presentation pattern established in the ASB financing comparison and the property-investment comparison features.

### Projection and Depletion Tables

- The Section A yearly projection table is collapsed and hidden by default. The user can expand it by activating a keyboard- and tap-reachable disclosure control on the same page. This matches the accessible expand/collapse convention used for the compound-interest yearly projection table and the property-investment yearly projection table in this repo.
- The Section B depletion table for each scenario is also collapsed and hidden by default and is expandable via the same kind of keyboard- and tap-reachable disclosure control.
- When collapsed, no row-level projection or depletion data is shown. The disclosure control must be operable without a pointer device.

## Assumptions

- v1 uses a fixed annual investment or dividend return rate for the full accumulation horizon in Section A
- annual return in Section A is credited once per year on the end-of-year balance before crediting, not with monthly compounding; this is a deliberate consistency choice with the ASB financing dividend model and with real EPF dividend behavior
- the fixed ringgit amount contribution mode does not escalate with the salary increment rate; this decoupling is by design
- the employer contribution rate in percentage-of-salary mode defaults to zero when not entered; when zero, the total monthly contribution equals the employee portion only
- the employer contribution rate has no effect in fixed ringgit amount mode
- Section B uses a separate post-retirement annual return rate input rather than sharing Section A's accumulation rate; each phase of the model has its own rate assumption, consistent with the repo convention of giving distinct phases and strategies distinct rate inputs
- Section B's starting balance defaults to Section A's final capital but is independently editable; Section B can be calculated without running Section A
- annual return in Section B's stays-invested scenario is credited once per year while withdrawals are deducted every month — the same mixed cadence as the ASB financing dividend model
- the fully-withdrawn scenario applies exactly zero growth; the post-retirement return rate has no effect on this scenario by design
- all outputs are nominal and do not adjust for inflation
- the simulation in Section B runs for a maximum of 100 years; if the stays-invested balance does not deplete within that horizon, the system reports a non-depletion outcome rather than an undefined or unbounded result

## Main Flow

1. The user enters initial savings balance, years to retirement, annual investment return rate, and annual salary increment rate for Section A.
2. The user selects a contribution input mode: percentage of salary or fixed ringgit amount.
3. In percentage-of-salary mode, the user enters current monthly salary and employee contribution rate; the user may also enter an employer contribution rate, which defaults to zero if not entered.
4. In fixed ringgit amount mode, the user enters a fixed monthly contribution amount.
5. The system projects the accumulation using the documented accumulation model: contributions accumulate monthly throughout each year, salary and percentage-mode contributions grow once per year by the salary increment rate, and annual return is credited once per year on the end-of-year balance.
6. The system returns final capital, total contributions, and total growth. The yearly projection table is present but collapsed; the user may expand it to see year-by-year salary, contribution, and ending balance.
7. The user proceeds to Section B. The starting balance field pre-fills with Section A's final capital and may be edited before Section B is calculated.
8. The user enters the lump-sum withdrawal, fixed recurring monthly withdrawal, and post-retirement annual return rate.
9. The system simultaneously simulates both the stays-invested and fully-withdrawn scenarios using the documented drawdown model: in month 1 it deducts the lump-sum withdrawal and the first monthly withdrawal in the same month for both scenarios; from month 2 onward it deducts the monthly withdrawal each month; for the stays-invested scenario it credits annual return once per year at the year-end balance.
10. The system runs each simulation until the balance reaches zero or the 100-year cap is reached, whichever comes first.
11. The system presents both scenario results side by side. Time to depletion is shown for each. If the stays-invested balance does not reach zero within 100 years, the system reports that the fund does not deplete within the simulation horizon.
12. The depletion tables for both scenarios are present but collapsed; the user may expand either table to view the balance timeline.

## Alternate Flows

- If Section A has not been run when the user opens Section B, the starting balance field is empty and must be entered manually before Section B can calculate.
- If the annual salary increment rate is zero, salary and percentage-mode contributions remain constant throughout the entire Section A projection.
- If the annual return rate for Section A is zero, the fund grows only from contributions with no investment or dividend growth.
- If the employer contribution rate is zero or not entered in percentage-of-salary mode, the total monthly contribution equals the employee rate applied to salary only.
- If the lump-sum withdrawal equals or exceeds the starting balance, the combined month-1 outflow depletes the fund immediately; both scenarios report depletion at month 1.
- If the monthly withdrawal is zero and the lump-sum withdrawal is also zero, no drawdown occurs; both scenarios report that the fund does not deplete within the simulation horizon.
- If the monthly withdrawal is zero and the lump-sum withdrawal is positive, the balance after month 1 decreases no further from monthly withdrawals; the stays-invested scenario may grow from that point and will report non-depletion; the fully-withdrawn scenario holds steady at the post-lump-sum balance and also reports non-depletion.
- If the stays-invested return rate is large enough that the annual return credited each year exceeds the total annual withdrawals, the balance grows rather than depletes; the simulation runs to the 100-year cap and reports non-depletion.
- If the user edits Section A inputs after Section B has already been calculated, Section B's starting balance updates to reflect the new Section A final capital; the user must recalculate Section B to see results based on the updated starting balance.

## Error and Empty States

**Section A inputs:**

- If initial savings balance is missing, the system blocks calculation and highlights the field.
- If initial savings balance is negative, the system rejects the input.
- If years to retirement is missing, zero, or negative, the system rejects the input.
- If years to retirement is not a whole number, the system rejects the input.
- If annual investment return rate is missing, the system blocks calculation and highlights the field.
- If annual investment return rate is negative, the system rejects the input.
- If annual salary increment rate is negative, the system rejects the input.
- If percentage-of-salary mode is selected and current monthly salary is missing, the system blocks calculation and highlights the field.
- If current monthly salary is zero or negative, the system rejects the input.
- If percentage-of-salary mode is selected and employee contribution rate is missing, the system blocks calculation and highlights the field.
- If employee contribution rate is negative or greater than 100, the system rejects the input.
- If employer contribution rate is entered and is negative or greater than 100, the system rejects the input.
- If the sum of the employee and employer contribution rates exceeds 100, the system rejects the input.
- If fixed ringgit amount mode is selected and fixed monthly contribution is missing, the system blocks calculation and highlights the field.
- If fixed monthly contribution is negative, the system rejects the input.

**Section B inputs:**

- If starting balance is missing, the system blocks calculation and highlights the field.
- If starting balance is negative, the system rejects the input.
- If lump-sum withdrawal is negative, the system rejects the input.
- If fixed recurring monthly withdrawal is missing, the system blocks calculation and highlights the field.
- If fixed recurring monthly withdrawal is negative, the system rejects the input.
- If post-retirement annual return rate is missing, the system blocks calculation and highlights the field.
- If post-retirement annual return rate is negative, the system rejects the input.
- If the user has not entered enough inputs to compute Section A or Section B, the result area for that section remains empty and explains what is still required.

## Acceptance Criteria

- The feature provides two connected sections — Retirement Savings Projection and Retirement Fund Longevity Simulation — within one bounded calculator workflow.
- Section A supports both percentage-of-salary and fixed ringgit amount contribution input modes; exactly one mode is active at any time, and only the inputs that belong to the active mode are required.
- In percentage-of-salary mode, the total monthly contribution is the sum of the employee and employer contribution rates applied to the current monthly salary; the employer contribution rate defaults to zero when not entered and has no effect in fixed ringgit amount mode.
- The combined employee and employer contribution rate must not exceed 100; the system rejects the input before results are shown if it does.
- In fixed ringgit amount mode, the fixed monthly contribution does not change as salary grows; the annual salary increment rate has no effect on the fixed contribution amount.
- Section A credits annual return once per year on the end-of-year balance before crediting and does not apply monthly compounding within each year.
- Section A's result includes, at minimum, final capital, total contributions, and total growth above contributed capital.
- The Section A yearly projection table is collapsed and hidden by default and can be expanded via a keyboard- and tap-reachable disclosure control without requiring a pointer device; when expanded, it shows at minimum year number, monthly salary for that year, total monthly contribution for that year, and ending balance for that year.
- Section B's starting balance pre-fills with Section A's final capital when Section A has been calculated, and the user can edit this value directly before running Section B.
- Section B presents the stays-invested and fully-withdrawn scenarios side by side in one comparison view without requiring the user to toggle between them; both results are visible simultaneously.
- In Section B, the total month-1 outflow is exactly the lump-sum withdrawal amount plus the first monthly withdrawal amount; both are deducted in month 1 and neither is deferred.
- The stays-invested scenario credits annual return once per year while deducting monthly withdrawals every month; the fully-withdrawn scenario applies zero growth and the post-retirement return rate has no effect on it.
- If the stays-invested balance has not reached zero after 100 years of simulation, the system reports that the fund does not deplete within the 100-year simulation horizon rather than producing an undefined, infinite, or blank result.
- Section B's depletion tables for both scenarios are collapsed and hidden by default and can be expanded via a keyboard- and tap-reachable disclosure control without requiring a pointer device.
- Section A blocks calculation and highlights missing required fields when inputs are incomplete; negative values for initial savings balance, annual return rate, salary, contribution rates, and contribution amounts are rejected before results are shown.
- Section B blocks calculation and highlights missing required fields when inputs are incomplete; negative values for starting balance, lump-sum withdrawal, monthly withdrawal, and post-retirement return rate are rejected before results are shown.
- The feature uses one documented annual-crediting model for return in both Section A and Section B, consistent with the ASB financing dividend-crediting convention, and does not apply monthly compounding within any single year.

## Related Specs

- API: none yet
- UI: none yet
- Acceptance: none yet
