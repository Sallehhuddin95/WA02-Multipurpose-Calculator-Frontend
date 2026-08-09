import { buildAmortizationSchedule } from "@/lib/financial-math/amortization/build-amortization-schedule";
import { calculateFlatRateLoan } from "@/lib/financial-math/flat-rate-loans/calculate-flat-rate-loan";
import { calculateRuleOf78Settlement } from "@/lib/financial-math/rule-of-78/calculate-rule-of-78-settlement";
import type {
  CarLoanFormValues,
  CarLoanProjectionResult,
  CarLoanSummary,
} from "@/features/car-loan/types/car-loan";

function getFinancedPrincipal(values: CarLoanFormValues): number {
  if (values.inputMode === "financed-principal") {
    return values.financedPrincipal;
  }

  return Math.max(values.vehiclePrice - values.downPayment, 0);
}

export function projectCarLoan(
  values: CarLoanFormValues,
): CarLoanProjectionResult {
  const financedPrincipal = getFinancedPrincipal(values);

  if (values.rateMode === "variable-rate") {
    const amortization = buildAmortizationSchedule({
      principal: financedPrincipal,
      annualInterestRate: values.variableAnnualInterestRate,
      tenureYears: values.tenureYears,
    });

    const loanSummary: CarLoanSummary = {
      financedPrincipal,
      totalInterest: amortization.totalInterest,
      totalRepayableAmount: amortization.totalRepayableAmount,
      monthlyInstalment: amortization.monthlyInstalment,
      totalMonths: amortization.totalMonths,
    };

    if (!values.earlySettlementEnabled) {
      return { loanSummary, settlement: null };
    }

    const settlementRow =
      amortization.schedule[values.earlySettlementMonth - 1];
    const projectedSettlementAmount = settlementRow
      ? settlementRow.remainingBalance
      : 0;

    return {
      loanSummary,
      settlement: {
        rateMode: "variable-rate",
        summary: {
          settlementMonth: values.earlySettlementMonth,
          totalPaidToDate:
            loanSummary.monthlyInstalment * values.earlySettlementMonth,
          projectedSettlementAmount,
        },
      },
    };
  }

  const loanSummary = calculateFlatRateLoan({
    financedPrincipal,
    flatAnnualInterestRate: values.fixedAnnualInterestRate,
    tenureYears: values.tenureYears,
  });

  if (!values.earlySettlementEnabled) {
    return { loanSummary, settlement: null };
  }

  const settlementSummary = calculateRuleOf78Settlement({
    financedPrincipal: loanSummary.financedPrincipal,
    monthlyInstalment: loanSummary.monthlyInstalment,
    settlementMonth: values.earlySettlementMonth,
    totalInterest: loanSummary.totalInterest,
    totalMonths: loanSummary.totalMonths,
    totalRepayableAmount: loanSummary.totalRepayableAmount,
  });

  return {
    loanSummary,
    settlement: {
      rateMode: "fixed-rate",
      summary: settlementSummary,
    },
  };
}
