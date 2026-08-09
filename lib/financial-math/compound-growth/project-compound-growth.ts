import type {
  CompoundInterestProjection,
  CompoundInterestSummary,
  CompoundingFrequency,
} from "@/features/compound-interest/types/compound-interest";

interface ProjectCompoundGrowthParams {
  annualRate: number;
  durationYears: number;
  compoundingFrequency: CompoundingFrequency;
  monthlyContribution: number;
  startingPrincipal: number;
}

const periodsPerYearByFrequency: Record<CompoundingFrequency, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

export function projectCompoundGrowth({
  annualRate,
  durationYears,
  compoundingFrequency,
  monthlyContribution,
  startingPrincipal,
}: ProjectCompoundGrowthParams): CompoundInterestSummary {
  const periodsPerYear = periodsPerYearByFrequency[compoundingFrequency];
  const totalPeriods = Math.floor(durationYears * periodsPerYear);
  const periodicRate = annualRate / 100 / periodsPerYear;
  const monthlyRate = annualRate / 100 / 12;

  let currentBalance = startingPrincipal;
  let totalContributions = startingPrincipal;
  const projection: CompoundInterestProjection[] = [];

  if (totalPeriods === 0) {
    return {
      finalProjectedBalance: startingPrincipal,
      totalContributions,
      totalGrowth: 0,
      projection: [
        {
          period: 0,
          year: 0,
          totalContributions,
          totalGrowth: 0,
          endingBalance: startingPrincipal,
        },
      ],
    };
  }

  for (let period = 1; period <= totalPeriods; period += 1) {
    currentBalance *= 1 + periodicRate;

    const contributionMonthsPerPeriod = 12 / periodsPerYear;

    if (monthlyContribution > 0) {
      for (
        let contributionIndex = 0;
        contributionIndex < contributionMonthsPerPeriod;
        contributionIndex += 1
      ) {
        currentBalance *= 1 + monthlyRate;
        currentBalance += monthlyContribution;
        totalContributions += monthlyContribution;
      }
    }

    projection.push({
      period,
      year: period / periodsPerYear,
      totalContributions,
      totalGrowth: currentBalance - totalContributions,
      endingBalance: currentBalance,
    });
  }

  return {
    finalProjectedBalance: currentBalance,
    totalContributions,
    totalGrowth: currentBalance - totalContributions,
    projection,
  };
}
