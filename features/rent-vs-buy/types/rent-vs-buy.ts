export const COMPARISON_LEADERS = ["buy", "rent", "tied"] as const;

export type ComparisonLeader = (typeof COMPARISON_LEADERS)[number];

export interface RentVsBuyFormValues {
  homePrice: number;
  downPaymentPercent: number;
  annualFinancingRate: number;
  financingTenureYears: number;
  comparisonHorizonYears: number;
  monthlyMaintenance: number;
  annualCukaiTaksiran: number;
  annualCukaiTanahOrPetak: number;
  annualIndahWaterCost: number;
  otherMonthlyCosts: number;
  monthlyRent: number;
  annualAppreciationRate: number;
  renterAnnualReturnRate: number;
}

export interface RentVsBuyYearRow {
  year: number;
  remainingLoanBalance: number;
  buyerEquity: number;
  renterPortfolioValue: number;
  leader: ComparisonLeader;
}

export interface RentVsBuyComparisonResult {
  loanPrincipal: number;
  monthlyInstalment: number;
  monthlyEquivalentOwnershipCosts: number;
  buyMonthlyBudget: number;
  renterMonthlyInvestment: number;
  finalBuyerEquity: number;
  finalRenterPortfolioValue: number;
  breakEvenYear: number | null;
  verdict: ComparisonLeader;
  yearlyComparison: RentVsBuyYearRow[];
}
