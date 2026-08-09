import type {
  AccumulationYearRow,
  RetirementAccumulationFormValues,
  RetirementAccumulationResult,
} from "@/features/retirement-fund/types/retirement-fund";
import { roundToCents } from "@/features/retirement-fund/utils/round-to-cents";

export function projectRetirementAccumulation(
  values: RetirementAccumulationFormValues,
): RetirementAccumulationResult {
  let balance = values.initialBalance;
  let totalContributions = 0;
  const yearlyProjection: AccumulationYearRow[] = [];

  for (let year = 1; year <= values.yearsToRetirement; year += 1) {
    // Salary grows at the start of each new year; year 1 uses the entered salary.
    const monthlySalary =
      values.salaryGrowthMode === "percentage"
        ? values.currentMonthlySalary *
          (1 + values.annualSalaryIncrementRate / 100) ** (year - 1)
        : values.currentMonthlySalary +
          values.fixedAnnualSalaryIncrement * (year - 1);

    // Contribution is always a percentage of salary, split employee/employer.
    const monthlyContribution =
      monthlySalary *
      ((values.employeeContributionRate + values.employerContributionRate) /
        100);

    // Contributions accumulate monthly, then return is credited once at year-end.
    const annualContributions = monthlyContribution * 12;
    balance += annualContributions;
    balance *= 1 + values.annualReturnRate / 100;
    totalContributions += annualContributions;

    yearlyProjection.push({
      year,
      monthlySalary: roundToCents(monthlySalary),
      monthlyContribution: roundToCents(monthlyContribution),
      endingBalance: roundToCents(balance),
    });
  }

  return {
    finalCapital: roundToCents(balance),
    totalContributions: roundToCents(totalContributions),
    totalGrowth: roundToCents(
      balance - values.initialBalance - totalContributions,
    ),
    yearlyProjection,
  };
}
