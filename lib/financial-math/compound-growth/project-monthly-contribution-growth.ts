export interface MonthlyContributionGrowthPoint {
  month: number;
  contributionToDate: number;
  balance: number;
}

interface ProjectMonthlyContributionGrowthParams {
  initialCapital: number;
  monthlyContribution: number;
  annualReturnRate: number;
  totalMonths: number;
}

export function projectMonthlyContributionGrowth({
  initialCapital,
  monthlyContribution,
  annualReturnRate,
  totalMonths,
}: ProjectMonthlyContributionGrowthParams): MonthlyContributionGrowthPoint[] {
  const monthlyRate = annualReturnRate / 100 / 12;
  let balance = initialCapital;
  let contributionToDate = initialCapital;
  const points: MonthlyContributionGrowthPoint[] = [];

  for (let month = 1; month <= totalMonths; month += 1) {
    balance *= 1 + monthlyRate;
    balance += monthlyContribution;
    contributionToDate += monthlyContribution;

    points.push({ month, contributionToDate, balance });
  }

  return points;
}
