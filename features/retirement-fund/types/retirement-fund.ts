export const SALARY_GROWTH_MODES = ["percentage", "fixed-amount"] as const;

export type SalaryGrowthMode = (typeof SALARY_GROWTH_MODES)[number];

export const DRAWDOWN_SCENARIOS = [
  "stays-invested",
  "fully-withdrawn",
] as const;

export type DrawdownScenario = (typeof DRAWDOWN_SCENARIOS)[number];

export interface RetirementAccumulationFormValues {
  initialBalance: number;
  yearsToRetirement: number;
  annualReturnRate: number;
  salaryGrowthMode: SalaryGrowthMode;
  annualSalaryIncrementRate: number;
  fixedAnnualSalaryIncrement: number;
  currentMonthlySalary: number;
  employeeContributionRate: number;
  employerContributionRate: number;
}

export interface RetirementDrawdownFormValues {
  startingBalance: number;
  lumpSumWithdrawal: number;
  monthlyWithdrawal: number;
  postRetirementAnnualReturnRate: number;
}

export interface AccumulationYearRow {
  year: number;
  monthlySalary: number;
  monthlyContribution: number;
  endingBalance: number;
}

export interface RetirementAccumulationResult {
  finalCapital: number;
  totalContributions: number;
  totalGrowth: number;
  yearlyProjection: AccumulationYearRow[];
}

export interface DrawdownMonthRow {
  month: number;
  lumpSumWithdrawal: number;
  recurringWithdrawal: number;
  returnCredited: number;
  closingBalance: number;
}

export interface DrawdownScenarioResult {
  depletedAtMonth: number | null;
  depletionYears: number | null;
  depletionRemainingMonths: number | null;
  didNotDeplete: boolean;
  monthlyRows: DrawdownMonthRow[];
}

export interface RetirementDrawdownResult {
  staysInvested: DrawdownScenarioResult;
  fullyWithdrawn: DrawdownScenarioResult;
}
