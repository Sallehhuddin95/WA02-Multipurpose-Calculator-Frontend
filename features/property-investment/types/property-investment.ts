export const PROPERTY_INVESTMENT_INPUT_MODES = [
  "down-payment",
  "loan-principal",
] as const;

export type PropertyInvestmentInputMode =
  (typeof PROPERTY_INVESTMENT_INPUT_MODES)[number];

export const MRTT_MLTT_INSURANCE_TYPES = ["mrtt", "mltt"] as const;

export type MrttMlttInsuranceType = (typeof MRTT_MLTT_INSURANCE_TYPES)[number];

export const MRTT_PAYMENT_TREATMENTS = ["upfront", "financed"] as const;

export type MrttPaymentTreatment = (typeof MRTT_PAYMENT_TREATMENTS)[number];

export const EXIT_VALUE_MODES = ["appreciation-rate", "exit-price"] as const;

export type ExitValueMode = (typeof EXIT_VALUE_MODES)[number];

export interface PropertyInvestmentFormValues {
  purchasePrice: number;
  inputMode: PropertyInvestmentInputMode;
  downPayment: number;
  loanPrincipal: number;
  annualFinancingRate: number;
  financingTenureYears: number;
  holdingPeriodYears: number;
  monthlyRent: number;
  occupancyRatePercent: number;
  monthlyMaintenanceAllowance: number;
  monthlySinkingFund: number;
  annualCukaiTaksiran: number;
  annualCukaiTanahOrPetak: number;
  annualIndahWaterCost: number;
  annualRepairAllowance: number;
  annualFireInsurance: number;
  annualOtherCosts: number;
  insuranceType: MrttMlttInsuranceType;
  mrttPaymentTreatment: MrttPaymentTreatment;
  mrttCost: number;
  annualMlttCost: number;
  exitValueMode: ExitValueMode;
  annualAppreciationRate: number;
  expectedExitPrice: number;
  reitInitialCapital: number;
  reitAnnualReturnRate: number;
}

export interface PropertyInvestmentYearRow {
  year: number;
  loanBalance: number;
  grossAnnualRent: number;
  annualExpenses: number;
  annualLoanPayment: number;
  netRentalCashFlow: number;
  cumulativeNetRentalCashFlow: number;
}

export interface PropertyInvestmentSummary {
  loanPrincipal: number;
  monthlyInstalment: number;
  exitValue: number;
  remainingLoanBalance: number;
  equityAtSale: number;
  cumulativeNetRentalCashFlow: number;
  cumulativeUserCashOutflow: number;
  netReturn: number;
  yearlyProjection: PropertyInvestmentYearRow[];
}

export interface ReitYearRow {
  year: number;
  reitValue: number;
}

export const REIT_STRATEGY_IDS = [
  "instalment-matched",
  "instalment-and-costs-matched",
] as const;

export type ReitStrategyId = (typeof REIT_STRATEGY_IDS)[number];

export interface ReitStrategySummary {
  monthlyContribution: number;
  finalValue: number;
  cumulativeContributions: number;
  netReturn: number;
  yearlyProjection: ReitYearRow[];
}

export const PROPERTY_INVESTMENT_STRATEGY_IDS = [
  "property",
  ...REIT_STRATEGY_IDS,
] as const;

export type PropertyInvestmentStrategyId =
  (typeof PROPERTY_INVESTMENT_STRATEGY_IDS)[number];

export interface PropertyInvestmentComparisonResult {
  property: PropertyInvestmentSummary;
  reitStrategies: Record<ReitStrategyId, ReitStrategySummary>;
  leadingStrategyId: PropertyInvestmentStrategyId;
}
