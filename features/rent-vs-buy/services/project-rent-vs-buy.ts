import { buildAmortizationSchedule } from "@/lib/financial-math/amortization/build-amortization-schedule";
import { projectMonthlyContributionGrowth } from "@/lib/financial-math/compound-growth/project-monthly-contribution-growth";
import type {
  ComparisonLeader,
  RentVsBuyComparisonResult,
  RentVsBuyFormValues,
  RentVsBuyYearRow,
} from "@/features/rent-vs-buy/types/rent-vs-buy";

function getLeader(buyerEquity: number, renterPortfolioValue: number): ComparisonLeader {
  if (buyerEquity > renterPortfolioValue) {
    return "buy";
  }

  if (buyerEquity < renterPortfolioValue) {
    return "rent";
  }

  return "tied";
}

export function projectRentVsBuy(
  values: RentVsBuyFormValues,
): RentVsBuyComparisonResult {
  const loanPrincipal =
    values.homePrice * (1 - values.downPaymentPercent / 100);

  const amortization = buildAmortizationSchedule({
    principal: loanPrincipal,
    annualInterestRate: values.annualFinancingRate,
    tenureYears: values.financingTenureYears,
  });

  const monthlyInstalment = amortization.monthlyInstalment;
  const monthlyEquivalentOwnershipCosts =
    values.monthlyMaintenance +
    values.otherMonthlyCosts +
    (values.annualCukaiTaksiran +
      values.annualCukaiTanahOrPetak +
      values.annualIndahWaterCost) /
      12;
  const buyMonthlyBudget = monthlyInstalment + monthlyEquivalentOwnershipCosts;
  const renterMonthlyInvestment = Math.max(
    buyMonthlyBudget - values.monthlyRent,
    0,
  );

  const growthPoints = projectMonthlyContributionGrowth({
    initialCapital: 0,
    monthlyContribution: renterMonthlyInvestment,
    annualReturnRate: values.renterAnnualReturnRate,
    totalMonths: values.comparisonHorizonYears * 12,
  });

  const yearlyComparison: RentVsBuyYearRow[] = [];

  for (let year = 1; year <= values.comparisonHorizonYears; year += 1) {
    const scheduleRow = amortization.schedule[year * 12 - 1];
    const remainingLoanBalance = scheduleRow ? scheduleRow.remainingBalance : 0;
    const homeValueAtYearN =
      values.homePrice * (1 + values.annualAppreciationRate / 100) ** year;
    const buyerEquity = homeValueAtYearN - remainingLoanBalance;

    const growthPoint = growthPoints[year * 12 - 1];
    const renterPortfolioValue = growthPoint ? growthPoint.balance : 0;

    yearlyComparison.push({
      year,
      remainingLoanBalance,
      buyerEquity,
      renterPortfolioValue,
      leader: getLeader(buyerEquity, renterPortfolioValue),
    });
  }

  const finalRow = yearlyComparison.at(-1);
  const finalBuyerEquity = finalRow ? finalRow.buyerEquity : 0;
  const finalRenterPortfolioValue = finalRow
    ? finalRow.renterPortfolioValue
    : 0;

  const breakEvenYear =
    yearlyComparison.find(
      (row) => row.buyerEquity >= row.renterPortfolioValue,
    )?.year ?? null;

  return {
    loanPrincipal,
    monthlyInstalment,
    monthlyEquivalentOwnershipCosts,
    buyMonthlyBudget,
    renterMonthlyInvestment,
    finalBuyerEquity,
    finalRenterPortfolioValue,
    breakEvenYear,
    verdict: getLeader(finalBuyerEquity, finalRenterPortfolioValue),
    yearlyComparison,
  };
}
