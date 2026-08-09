export interface AsbFinancingFormValues {
  financingPrincipal: number;
  financingTenureYears: number;
  annualFinancingRate: number;
  annualDividendRate: number;
  annualSideInvestmentReturnRate: number;
  analysisHorizonYears: number;
}

export interface AsbStrategyYearlyRow {
  year: number;
  asbBalance: number;
  dividendCredited: number;
  sideInvestmentValue: number;
  cumulativeUserCashOutflow: number;
  remainingLoanBalance: number;
}

export interface AsbStrategySummary {
  finalAsbValue: number;
  cumulativeDividends: number;
  finalSideInvestmentValue: number;
  cumulativeSideInvestmentContributions: number;
  cumulativeUserCashOutflow: number;
  remainingLoanBalance: number;
  surrenderValue: number;
  netPosition: number;
  yearlyProjection: AsbStrategyYearlyRow[];
}

export const ASB_STRATEGY_IDS = [
  "compounding",
  "dividend-offset",
  "direct-contribution",
] as const;

export type AsbStrategyId = (typeof ASB_STRATEGY_IDS)[number];

export interface AsbFinancingComparisonResult {
  monthlyInstalment: number;
  strategies: Record<AsbStrategyId, AsbStrategySummary>;
  leadingStrategyId: AsbStrategyId;
}
