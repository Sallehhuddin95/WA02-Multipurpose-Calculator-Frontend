import { calculateSalaryBreakdown } from "@/features/salary-calculator/services/calculate-salary";
import type {
  SalaryCalculatorFormValues,
  SalaryProjectionFormValues,
  SalaryProjectionResult,
  SalaryProjectionYearRow,
} from "@/features/salary-calculator/types/salary-calculator";
import { roundToCents } from "@/utils/round-to-cents";

export function projectSalary(
  baseValues: SalaryCalculatorFormValues,
  projection: SalaryProjectionFormValues,
): SalaryProjectionResult {
  const yearlyProjection: SalaryProjectionYearRow[] = [];
  let cumulativeNetSalary = 0;
  let cumulativeEmployerCost = 0;

  // s(0) is the base gross monthly salary. Year 1 applies only year-1 one-offs;
  // recurring growth starts in year 2.
  let grossMonthlySalary = baseValues.grossMonthlySalary;

  for (let year = 1; year <= projection.projectionYears; year += 1) {
    if (year > 1) {
      switch (projection.incrementMode) {
        case "percentage":
          grossMonthlySalary *= 1 + projection.annualIncrementRate / 100;
          break;
        case "fixed-amount":
          grossMonthlySalary += projection.fixedAnnualIncrement;
          break;
        case "none":
          break;
      }
    }

    for (const oneOff of projection.oneOffIncrements) {
      if (oneOff.year !== year) {
        continue;
      }

      if (oneOff.type === "amount") {
        grossMonthlySalary += oneOff.value;
      } else {
        grossMonthlySalary *= 1 + oneOff.value / 100;
      }
    }

    const breakdown = calculateSalaryBreakdown({
      ...baseValues,
      grossMonthlySalary,
    });

    yearlyProjection.push({
      year,
      grossMonthlySalary: roundToCents(breakdown.grossMonthlySalary),
      netMonthlySalary: roundToCents(breakdown.netMonthlySalary),
      totalEmployeeDeductions: roundToCents(breakdown.totalEmployeeDeductions),
      totalEmployerCost: roundToCents(breakdown.totalEmployerCost),
    });

    cumulativeNetSalary += breakdown.netMonthlySalary * 12;
    cumulativeEmployerCost += breakdown.totalEmployerCost * 12;
  }

  const finalYear = yearlyProjection[yearlyProjection.length - 1];

  return {
    finalGrossMonthlySalary: finalYear.grossMonthlySalary,
    finalNetMonthlySalary: finalYear.netMonthlySalary,
    cumulativeNetSalary: roundToCents(cumulativeNetSalary),
    cumulativeEmployerCost: roundToCents(cumulativeEmployerCost),
    yearlyProjection,
  };
}
