export interface AmortizationRow {
  period: number;
  paymentAmount: number;
  interestPortion: number;
  principalPortion: number;
  remainingBalance: number;
}

export interface AmortizationSummary {
  monthlyInstalment: number;
  totalInterest: number;
  totalRepayableAmount: number;
  totalMonths: number;
  schedule: AmortizationRow[];
}

interface CalculateMonthlyAmortizedPaymentParams {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
}

export function calculateMonthlyAmortizedPayment({
  principal,
  annualInterestRate,
  tenureYears,
}: CalculateMonthlyAmortizedPaymentParams): number {
  const totalMonths = tenureYears * 12;

  if (totalMonths === 0) {
    return 0;
  }

  const monthlyRate = annualInterestRate / 100 / 12;

  if (monthlyRate === 0) {
    return principal / totalMonths;
  }

  const growthFactor = (1 + monthlyRate) ** totalMonths;

  return (principal * monthlyRate * growthFactor) / (growthFactor - 1);
}

interface BuildAmortizationScheduleParams {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
}

export function buildAmortizationSchedule({
  principal,
  annualInterestRate,
  tenureYears,
}: BuildAmortizationScheduleParams): AmortizationSummary {
  const totalMonths = tenureYears * 12;
  const monthlyRate = annualInterestRate / 100 / 12;
  const monthlyInstalment = calculateMonthlyAmortizedPayment({
    principal,
    annualInterestRate,
    tenureYears,
  });

  let remainingBalance = principal;
  let totalInterest = 0;
  const schedule: AmortizationRow[] = [];

  for (let period = 1; period <= totalMonths; period += 1) {
    const interestPortion = remainingBalance * monthlyRate;
    const rawPrincipalPortion = monthlyInstalment - interestPortion;
    const principalPortion = Math.min(rawPrincipalPortion, remainingBalance);
    remainingBalance = Math.max(remainingBalance - principalPortion, 0);
    totalInterest += interestPortion;

    schedule.push({
      period,
      paymentAmount: interestPortion + principalPortion,
      interestPortion,
      principalPortion,
      remainingBalance,
    });
  }

  return {
    monthlyInstalment,
    totalInterest,
    totalRepayableAmount: principal + totalInterest,
    totalMonths,
    schedule,
  };
}
