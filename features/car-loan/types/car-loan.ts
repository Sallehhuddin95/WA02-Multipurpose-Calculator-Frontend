export const CAR_LOAN_INPUT_MODES = [
  "vehicle-price",
  "financed-principal",
] as const;

export type CarLoanInputMode = (typeof CAR_LOAN_INPUT_MODES)[number];

export const CAR_LOAN_RATE_MODES = ["variable-rate", "fixed-rate"] as const;

export type CarLoanRateMode = (typeof CAR_LOAN_RATE_MODES)[number];

export interface CarLoanFormValues {
  inputMode: CarLoanInputMode;
  vehiclePrice: number;
  downPayment: number;
  financedPrincipal: number;
  rateMode: CarLoanRateMode;
  fixedAnnualInterestRate: number;
  variableAnnualInterestRate: number;
  tenureYears: number;
  earlySettlementEnabled: boolean;
  earlySettlementMonth: number;
}

export interface CarLoanSummary {
  financedPrincipal: number;
  totalInterest: number;
  totalRepayableAmount: number;
  monthlyInstalment: number;
  totalMonths: number;
}

export interface CarLoanSettlementSummary {
  settlementMonth: number;
  totalPaidToDate: number;
  earnedInterest: number;
  unearnedInterestRebate: number;
  projectedSettlementAmount: number;
}

export interface CarLoanVariableSettlementSummary {
  settlementMonth: number;
  totalPaidToDate: number;
  projectedSettlementAmount: number;
}

export type CarLoanSettlement =
  | { rateMode: "fixed-rate"; summary: CarLoanSettlementSummary }
  | { rateMode: "variable-rate"; summary: CarLoanVariableSettlementSummary };

export interface CarLoanProjectionResult {
  loanSummary: CarLoanSummary;
  settlement: CarLoanSettlement | null;
}
