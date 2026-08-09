import type { CarLoanSummary } from "@/features/car-loan/types/car-loan";

interface CalculateFlatRateLoanParams {
  financedPrincipal: number;
  flatAnnualInterestRate: number;
  tenureYears: number;
}

export function calculateFlatRateLoan({
  financedPrincipal,
  flatAnnualInterestRate,
  tenureYears,
}: CalculateFlatRateLoanParams): CarLoanSummary {
  const totalMonths = tenureYears * 12;
  const totalInterest =
    financedPrincipal * (flatAnnualInterestRate / 100) * tenureYears;
  const totalRepayableAmount = financedPrincipal + totalInterest;
  const monthlyInstalment =
    totalMonths === 0 ? 0 : totalRepayableAmount / totalMonths;

  return {
    financedPrincipal,
    totalInterest,
    totalRepayableAmount,
    monthlyInstalment,
    totalMonths,
  };
}
