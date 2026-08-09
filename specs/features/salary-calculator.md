# Salary Calculator

## Status

Draft

## Goal

Help a user calculate the net take-home salary and employer cost for a given monthly gross salary under the Malaysian statutory payroll framework.

The feature decomposes a gross salary into all mandatory and optional deductions - EPF (KWSP), SOCSO (PERKESO), EIS (SIP), and PCB (MTD) - plus the optional Lindung24 protection scheme. It supports three worker categories (Malaysian citizen, permanent resident, and foreign worker) with different deduction applicability rules per category, and surfaces both the employee-side net salary and the employer-side total cost in one view.

The feature exists to make the full statutory picture visible so a user can understand what they actually take home, what their employer actually pays, and how optional items like Lindung24 affect the monthly outcome.

## Scope

This feature includes:

- one monthly gross salary input
- one worker category selector with three options: Malaysian citizen, permanent resident, and foreign worker
- age input (whole years) to drive EPF and SOCSO age-tier contribution rates
- EPF contribution calculation for both employee and employer portions, using the latest statutory rate schedule keyed by age group and gross salary band
- an EPF employee contribution rate selector for Malaysians and permanent residents who wish to contribute above the statutory minimum, with options matching the rates the EPF allows members to elect (the selector defaults to the statutory rate)
- foreign worker EPF treatment as optional: the user may toggle foreign worker EPF participation on or off; when toggled on, foreign worker EPF follows the statutory contribution schedule
- SOCSO contribution calculation for both employee and employer portions under the Employment Injury Scheme and, where applicable, the Invalidity Scheme, using the published PERKESO contribution schedule keyed by gross salary bracket
- EIS (SIP) contribution calculation for both employee and employer portions for applicable worker categories and ages, with the RM4,000 salary ceiling applied
- PCB (MTD) monthly tax deduction calculation for applicable worker categories using the LHDN PCB schedule with progressive tax brackets, after accounting for allowable monthly EPF relief
- a flat 30% PCB rate for foreign workers, consistent with the non-resident tax withholding rule
- Lindung24 as an optional single-checkbox opt-in; when enabled, the feature determines the applicable premium from the published Lindung24 premium table keyed by the worker's SOCSO contribution bracket and deducts the premium from the net salary
- an employer cost summary showing gross salary, employer EPF, employer SOCSO, employer EIS, and total employer cost
- an employee-side result panel showing gross salary, each deduction line with its amount and a brief label, Lindung24 premium (if opted in), and net take-home salary
- an annualised projection table showing the same breakdown summed over 12 months to give a full-year view

## Out of Scope

- variable or mid-year rate changes; v1 uses a single rate schedule snapshot
- multiple concurrent employments or secondary income streams
- PCB with spousal relief, child relief, or other personal tax relief inputs beyond the default single-status treatment
- zakat, tabung haji, union fees, cooperative deductions, or other non-statutory salary deductions
- bonus, commission, allowance, benefit-in-kind, or irregular income tax treatment
- overtime, shift allowance, or variable-pay components
- employer HRDF (Human Resources Development Fund) levy calculation
- retroactive or backdated payroll corrections
- server-side persistence or account-based scenario management
- payroll year-end EA/EC form or CP38 deduction-order logic

## Actors

- employee or jobseeker evaluating take-home salary under Malaysian statutory deductions for a given gross salary offer
- employer or HR practitioner estimating total employment cost for a given gross salary
- foreign worker evaluating take-home pay under the foreign-worker deduction regime

## Preconditions

- the user provides a gross monthly salary
- the user selects a worker category
- the user provides the worker's age as a whole number of years
- for Malaysians and permanent residents, the EPF employee rate selector defaults to the statutory minimum and the user may change it
- for foreign workers, the EPF participation toggle defaults to off and the user may enable it
- the Lindung24 opt-in defaults to off

## Inputs

### Required (all categories)

- gross monthly salary (RM) - must be positive; no upper ceiling enforced by the calculator
- worker category - exactly one of: Malaysian citizen, permanent resident, foreign worker
- age at last birthday - whole years; must be at least 16

### Category-conditional

- EPF employee contribution rate selector - visible only for Malaysian citizen and permanent resident categories; defaults to the statutory rate; available options must match the rates the EPF allows a member to elect (the latest election-eligible rates); the selector must not allow a rate below the statutory minimum for the given age group
- foreign worker EPF participation toggle - visible only for the foreign worker category; defaults to off; when toggled on, the statutory foreign-worker EPF contribution schedule from the latest EPF rate table is applied

### Optional

- Lindung24 opt-in checkbox - visible for all categories; defaults to off

## Calculation Model

The initial release uses one explicit, deterministic salary-breakdown model so results remain predictable and explainable. Every deduction is calculated independently from the same gross salary input; deductions do not cascade (one deduction does not change the base for another deduction) except for PCB, which applies the statutory EPF relief deduction before computing taxable income.

### Worker Category Deduction Applicability Matrix

| Deduction | Malaysian Citizen | Permanent Resident | Foreign Worker |
|---|---|---|---|
| EPF (employee) | Mandatory | Mandatory | Optional (toggle) |
| EPF (employer) | Mandatory | Mandatory | Optional (follows toggle) |
| SOCSO Employment Injury (employee) | Mandatory | Mandatory | Mandatory |
| SOCSO Employment Injury (employer) | Mandatory | Mandatory | Mandatory |
| SOCSO Invalidity (employee) | Mandatory (< 60); not applicable (≥ 60) | Mandatory (< 60); not applicable (≥ 60) | Not applicable |
| SOCSO Invalidity (employer) | Mandatory (< 60); not applicable (≥ 60) | Mandatory (< 60); not applicable (≥ 60) | Not applicable |
| EIS (employee) | Mandatory (< 60); not applicable (≥ 60) | Mandatory (< 60); not applicable (≥ 60) | Not applicable |
| EIS (employer) | Mandatory (< 60); not applicable (≥ 60) | Mandatory (< 60); not applicable (≥ 60) | Not applicable |
| PCB / MTD | Mandatory | Mandatory | Mandatory (flat 30%) |
| Lindung24 | Optional | Optional | Optional |

### EPF (KWSP) Contribution Model

- EPF contribution rates are determined by the worker's age group and gross monthly salary band per the statutory EPF contribution schedule.
- Both the employee contribution rate and the employer contribution rate are read from the schedule for the applicable age group and salary band.
- For Malaysians and permanent residents, the employee contribution rate defaults to the statutory rate for the applicable age group and salary band. The rate selector offers election-eligible rates only and must not allow a value below the statutory minimum.
- For foreign workers with EPF participation toggled on, the employee and employer rates follow the foreign-worker row of the statutory EPF schedule.
- For foreign workers with EPF participation toggled off, no EPF contribution is calculated for either party.
- The employee EPF amount is `grossMonthlySalary × employeeEpfRate`.
- The employer EPF amount is `grossMonthlySalary × employerEpfRate`.

### SOCSO (PERKESO) Contribution Model

- SOCSO contributions are determined by the worker's gross monthly salary band per the published PERKESO contribution schedule.
- The Employment Injury Scheme contribution applies to all worker categories at all ages. Both an employee share and an employer share are read from the schedule for the applicable salary bracket.
- The Invalidity Scheme contribution applies to Malaysian citizens and permanent residents under age 60. Both an employee share and an employer share are read from the schedule for the applicable salary bracket. No Invalidity Scheme contribution is calculated for workers aged 60 and above or for foreign workers of any age.
- The employee SOCSO amount is the sum of the Employment Injury Scheme employee share and, where applicable, the Invalidity Scheme employee share.
- The employer SOCSO amount is the sum of the Employment Injury Scheme employer share and, where applicable, the Invalidity Scheme employer share.

### EIS (SIP) Contribution Model

- EIS applies to Malaysian citizens and permanent residents under age 60 only.
- EIS does not apply to foreign workers of any age or to workers aged 60 and above.
- EIS is calculated on a capped salary of RM4,000. If gross monthly salary exceeds RM4,000, the contribution is calculated as if the salary were RM4,000.
- The employee EIS rate is 0.2% of the capped salary.
- The employer EIS rate is 0.2% of the capped salary.
- The employee EIS amount is `min(grossMonthlySalary, 4000) × 0.002`.
- The employer EIS amount is `min(grossMonthlySalary, 4000) × 0.002`.

### PCB (MTD) Monthly Tax Deduction Model

- PCB is calculated using the LHDN Monthly Tax Deduction schedule. The feature reads the schedule as a static data table containing income brackets and the corresponding formula or fixed deduction amount per bracket.
- For PCB calculation, the chargeable monthly income is:
  `grossMonthlySalary − allowableEpfRelief`
  where `allowableEpfRelief` is the lesser of the actual employee EPF contribution for that month and RM4,000 / 12 (the monthly equivalent of the annual RM4,000 EPF relief cap, floored or rounded to the schedule's convention).
- For Malaysian citizens and permanent residents: the chargeable income is matched against the progressive bracket table, and the monthly PCB amount is computed from the bracket's formula (typically `(chargeableIncome − bracketFloor) × bracketRate + cumulativeTaxAtFloor`).
- For foreign workers: PCB is a flat 30% of the gross monthly salary. No EPF relief or progressive bracket applies. The chargeable-income and bracket logic is bypassed entirely.
- PCB is computed per month independently; there is no cumulative year-to-date tracking in v1.

### Lindung24 Optional Deduction Model

- Lindung24 is a PERKESO-provided optional protection scheme offering 24-hour coverage beyond work-related incidents.
- Lindung24 premium amounts are published by PERKESO in a table keyed by SOCSO contribution category (which corresponds to a salary bracket).
- When the Lindung24 opt-in checkbox is checked, the feature determines the worker's SOCSO contribution bracket from the gross monthly salary, reads the corresponding Lindung24 monthly premium from the published premium table, and adds it as an employee-side deduction.
- The Lindung24 premium is deducted from the net salary after all statutory deductions have been applied, so it does not affect EPF, SOCSO, EIS, or PCB calculations.
- When the opt-in is unchecked, no Lindung24 premium is deducted.

### Rate Schedule Currency

- All statutory rate tables (EPF, SOCSO, EIS, PCB brackets, Lindung24 premiums) must use the latest published schedules. The feature should reference the schedule publication date or effective date so the currency of the data is transparent to the user.
- Rate schedules are stored as static data constants within the feature module for the initial release, consistent with the frontend-only calculator architecture documented in ADR 0005.

## Result Presentation

### Employee-Side Result Panel

The employee result panel displays:
- gross monthly salary
- each applicable deduction as a line item with its amount and a short label (e.g., "EPF (Employee)", "SOCSO", "EIS", "PCB", "Lindung24")
- the Lindung24 line item appears only when the opt-in is checked
- total deductions
- net take-home monthly salary (gross salary minus total deductions)

### Employer-Side Cost Panel

The employer cost panel displays:
- gross monthly salary
- employer EPF contribution
- employer SOCSO contribution
- employer EIS contribution
- total employer cost per month (gross salary plus all employer contributions)

### Annualised Projection Table

An annualised projection table shows each of the above employee line items and employer line items summed over 12 months, yielding an annual take-home salary, annual total deductions, and annual total employer cost.

The annualised projection table is collapsed and hidden by default. The user can expand it by activating a keyboard- and tap-reachable disclosure control on the same page. This matches the accessible expand/collapse convention used for projection tables across other calculator features in this repo.

## Assumptions

- v1 uses a single point-in-time rate schedule snapshot for all statutory contributions and tax brackets.
- The feature does not simulate monthly payroll runs across a full calendar year; the annualised view is a straight 12× multiplication of the monthly figures.
- The EPF employee rate selector for Malaysians and permanent residents offers only the rates the EPF currently allows members to elect above the statutory minimum; rates below the statutory minimum are not offered.
- Foreign worker EPF participation defaults to off and uses the statutory foreign-worker EPF schedule when toggled on.
- PCB for Malaysians and permanent residents uses the single-status (unmarried, no children) default from the LHDN schedule; no additional personal relief inputs are exposed in v1.
- PCB for foreign workers is a flat 30% with no reliefs or progressive bracket logic.
- Workers aged 60 and above are not eligible for the SOCSO Invalidity Scheme or EIS, per the statutory framework.
- The minimum worker age is 16, consistent with Malaysian employment law.
- All monetary inputs and outputs are in Malaysian Ringgit (RM).
- Rate schedules are assumed to be the latest published versions at the time of implementation; the spec does not prescribe specific rate values, only the calculation behaviour derived from those schedules.

## Main Flow

1. The user enters a gross monthly salary.
2. The user selects a worker category: Malaysian citizen, permanent resident, or foreign worker.
3. The user enters the worker's age as a whole number of years.
4. If the selected category is Malaysian citizen or permanent resident, the EPF employee contribution rate selector appears with the statutory rate pre-selected. The user may change the rate to a higher election-eligible rate.
5. If the selected category is foreign worker, the EPF participation toggle appears, defaulting to off. The user may toggle it on.
6. The user may check the Lindung24 opt-in checkbox.
7. The system determines the applicable deductions based on the category, age, EPF participation toggle (if foreign worker), and EPF employee rate selection.
8. The system calculates each applicable deduction: employee EPF, employer EPF, employee SOCSO (Employment Injury plus Invalidity where applicable), employer SOCSO, employee EIS where applicable, employer EIS, and PCB using the category-appropriate PCB model.
9. If Lindung24 is opted in, the system determines the SOCSO contribution bracket, reads the premium, and adds it to the employee-side deductions.
10. The system computes the employee net salary and total employer cost.
11. The system populates the employee result panel, employer cost panel, and annualised projection table.
12. The annualised projection table is collapsed by default; the user may expand it via the disclosure control.

## Alternate Flows

- If the worker category is changed after results have been calculated, the system clears all results and reapplies the deduction applicability matrix for the new category.
- If the age is changed after results have been calculated, the system recalculates all age-sensitive deductions (EPF age tier, SOCSO Invalidity eligibility, EIS eligibility).
- If the EPF employee rate is changed, the system recalculates the employee EPF amount and the PCB (since PCB depends on the EPF deduction amount through the allowable EPF relief cap).
- If the foreign worker EPF toggle is changed, the system adds or removes both employee and employer EPF contributions.
- If Lindung24 is toggled on after results are shown, the system adds the premium deduction and updates the net salary without affecting any other deductions.
- If the gross salary is zero or negative, the system rejects the input before any calculation and highlights the field.
- If the age is below 16, the system rejects the input before any calculation and highlights the field.
- If the age is above a reasonable upper bound (e.g., 100), the system does not reject the input but may display a non-blocking advisory note; this is a UX decision for implementation.

## Error and Empty States

### Gross Salary

- If gross salary is missing, the system blocks calculation and highlights the field.
- If gross salary is zero or negative, the system rejects the input with an inline validation message and blocks calculation.

### Worker Category

- If no worker category is selected, the system blocks calculation and prompts the user to select a category.

### Age

- If age is missing, the system blocks calculation and highlights the field.
- If age is less than 16, the system rejects the input with a message stating the minimum employment age and blocks calculation.
- If age is not a whole number, the system rejects the input.

### Lindung24

- Lindung24 has no blocking validation; it is purely optional. If the opt-in is checked but the system cannot determine a SOCSO contribution bracket (e.g., because gross salary is not yet entered), the Lindung24 premium line item shows a dash or is hidden until all prerequisite inputs are valid.

### General Empty State

- Before any calculation has been performed, the employee result panel, employer cost panel, and annualised projection table are hidden or display placeholder text indicating that results will appear after inputs are completed and calculation is triggered.

## Acceptance Criteria

- The feature accepts a gross monthly salary, worker category, and age as input.
- The worker category selector offers exactly three options: Malaysian citizen, permanent resident, and foreign worker.
- For Malaysian citizen and permanent resident categories, the EPF employee contribution rate selector is visible and defaults to the statutory rate for the given age group and salary band; the selector offers only election-eligible rates and does not allow selection of a rate below the statutory minimum for the given age group.
- For the foreign worker category, the EPF participation toggle is visible and defaults to off; when toggled on, employee and employer EPF contributions are calculated per the statutory foreign-worker EPF schedule.
- SOCSO Employment Injury Scheme contributions are calculated for all categories at all ages for both employee and employer sides.
- SOCSO Invalidity Scheme contributions are calculated for Malaysian citizens and permanent residents under age 60 for both employee and employer sides, and are not calculated for workers aged 60 and above or for foreign workers.
- EIS contributions are calculated for Malaysian citizens and permanent residents under age 60 only, at 0.2% each for employee and employer, capped at a RM4,000 salary ceiling.
- PCB is calculated using the progressive bracket method for Malaysian citizens and permanent residents, with the allowable monthly EPF relief applied per the LHDN schedule convention.
- PCB for foreign workers is exactly 30% of gross monthly salary with no reliefs, brackets, or EPF deduction offset.
- Lindung24 premium is added as a deduction only when the opt-in checkbox is checked, and the premium amount is read from the published premium table keyed by the worker's SOCSO contribution bracket.
- Lindung24 premium does not affect any other statutory deduction calculation; it is deducted only from the final net salary.
- The employee result panel displays every applicable deduction line item with its amount and a short label, total deductions, and net take-home salary.
- The employer cost panel displays employer EPF, employer SOCSO, employer EIS, and total employer cost per month.
- The annualised projection table shows each line item summed over 12 months for both employee and employer sides.
- The annualised projection table is collapsed by default and is expandable via a keyboard- and tap-reachable disclosure control.
- Invalid inputs (missing salary, zero or negative salary, age below 16, non-whole-number age) are rejected with inline validation and block calculation.
- Changing the worker category, age, EPF rate, or foreign worker EPF toggle after calculation recalculates all affected deductions and updates all result panels.
- Toggling Lindung24 on or off after calculation adds or removes only the Lindung24 line item without affecting the other deductions.
- All rate schedule lookups use the latest published statutory schedules at the time of implementation; the implementation must document which schedule publication date or effective date it references.

## Related Specs

- API: none yet
- UI: none yet
- Acceptance: none yet
