import type {
  DrawdownMonthRow,
  DrawdownScenarioResult,
  RetirementDrawdownFormValues,
  RetirementDrawdownResult,
} from "@/features/retirement-fund/types/retirement-fund";
import { roundToCents } from "@/features/retirement-fund/utils/round-to-cents";

const MAX_MONTHS = 1200; // 100-year cap — spec correctness requirement

function runScenario(
  startingBalance: number,
  lumpSumWithdrawal: number,
  monthlyWithdrawal: number,
  annualReturnRate: number,
): DrawdownScenarioResult {
  let balance = startingBalance;
  const monthlyRows: DrawdownMonthRow[] = [];

  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    const isFirstMonth = month === 1;

    // Deduct lump sum then recurring; each clamped so balance never goes negative.
    const scheduledLump = isFirstMonth ? lumpSumWithdrawal : 0;
    const actualLump = Math.min(scheduledLump, balance);
    balance -= actualLump;

    const actualRecurring = Math.min(monthlyWithdrawal, balance);
    balance -= actualRecurring;

    // Return is credited once per year at year-end after all monthly withdrawals.
    let returnCredited = 0;
    if (annualReturnRate > 0 && month % 12 === 0 && balance > 0) {
      returnCredited = balance * (annualReturnRate / 100);
      balance += returnCredited;
    }

    monthlyRows.push({
      month,
      lumpSumWithdrawal: roundToCents(actualLump),
      recurringWithdrawal: roundToCents(actualRecurring),
      returnCredited: roundToCents(returnCredited),
      closingBalance: roundToCents(balance),
    });

    if (balance <= 0) {
      return {
        depletedAtMonth: month,
        // month N means fund lasted N full months — year/month decomposition follows
        depletionYears: Math.floor(month / 12),
        depletionRemainingMonths: month % 12,
        didNotDeplete: false,
        monthlyRows,
      };
    }
  }

  return {
    depletedAtMonth: null,
    depletionYears: null,
    depletionRemainingMonths: null,
    didNotDeplete: true,
    monthlyRows,
  };
}

export function projectRetirementDrawdown(
  values: RetirementDrawdownFormValues,
): RetirementDrawdownResult {
  const staysInvested = runScenario(
    values.startingBalance,
    values.lumpSumWithdrawal,
    values.monthlyWithdrawal,
    values.postRetirementAnnualReturnRate,
  );

  // Fully-withdrawn scenario always uses 0% return by spec.
  const fullyWithdrawn = runScenario(
    values.startingBalance,
    values.lumpSumWithdrawal,
    values.monthlyWithdrawal,
    0,
  );

  return { staysInvested, fullyWithdrawn };
}
