import type { CarLoanSettlementSummary } from "@/features/car-loan/types/car-loan";

interface CalculateRuleOf78SettlementParams {
  financedPrincipal: number;
  monthlyInstalment: number;
  settlementMonth: number;
  totalInterest: number;
  totalMonths: number;
  totalRepayableAmount: number;
}

export function calculateRuleOf78Settlement({
  monthlyInstalment,
  settlementMonth,
  totalInterest,
  totalMonths,
  totalRepayableAmount,
}: CalculateRuleOf78SettlementParams): CarLoanSettlementSummary {
  if (settlementMonth >= totalMonths) {
    return {
      settlementMonth,
      totalPaidToDate: totalRepayableAmount,
      earnedInterest: totalInterest,
      unearnedInterestRebate: 0,
      projectedSettlementAmount: 0,
    };
  }

  const sumOfDigits = (totalMonths * (totalMonths + 1)) / 2;
  const earnedDigits =
    (settlementMonth * (2 * totalMonths - settlementMonth + 1)) / 2;
  const earnedInterest =
    sumOfDigits === 0 ? 0 : totalInterest * (earnedDigits / sumOfDigits);
  const unearnedInterestRebate = totalInterest - earnedInterest;
  const totalPaidToDate = monthlyInstalment * settlementMonth;
  const projectedSettlementAmount = Math.max(
    totalRepayableAmount - totalPaidToDate - unearnedInterestRebate,
    0,
  );

  return {
    settlementMonth,
    totalPaidToDate,
    earnedInterest,
    unearnedInterestRebate,
    projectedSettlementAmount,
  };
}
