import {
  buildAmortizationSchedule,
  type AmortizationRow,
} from "@/lib/financial-math/amortization/build-amortization-schedule";
import {
  ASB_STRATEGY_IDS,
  type AsbFinancingComparisonResult,
  type AsbFinancingFormValues,
  type AsbStrategyId,
  type AsbStrategySummary,
  type AsbStrategyYearlyRow,
} from "@/features/asb-financing/types/asb-financing";

function getRemainingLoanBalanceAtMonth(
  schedule: AmortizationRow[],
  month: number,
): number {
  const row = schedule[month - 1];
  return row ? row.remainingBalance : 0;
}

interface StrategyParams {
  financingPrincipal: number;
  monthlyInstalment: number;
  dividendRate: number;
  analysisHorizonYears: number;
  amortizationSchedule: AmortizationRow[];
}

function simulateCompoundingStrategy({
  financingPrincipal,
  monthlyInstalment,
  dividendRate,
  analysisHorizonYears,
  amortizationSchedule,
}: StrategyParams): AsbStrategySummary {
  let asbBalance = financingPrincipal;
  let cumulativeDividends = 0;
  const yearlyProjection: AsbStrategyYearlyRow[] = [];

  for (let year = 1; year <= analysisHorizonYears; year += 1) {
    const dividendCredited = asbBalance * dividendRate;
    asbBalance += dividendCredited;
    cumulativeDividends += dividendCredited;

    const monthsElapsed = year * 12;
    const cumulativeUserCashOutflow = monthlyInstalment * monthsElapsed;
    const remainingLoanBalance = getRemainingLoanBalanceAtMonth(
      amortizationSchedule,
      monthsElapsed,
    );

    yearlyProjection.push({
      year,
      asbBalance,
      dividendCredited,
      sideInvestmentValue: 0,
      cumulativeUserCashOutflow,
      remainingLoanBalance,
    });
  }

  const finalRow = yearlyProjection.at(-1)!;

  return {
    finalAsbValue: finalRow.asbBalance,
    cumulativeDividends,
    finalSideInvestmentValue: 0,
    cumulativeSideInvestmentContributions: 0,
    cumulativeUserCashOutflow: finalRow.cumulativeUserCashOutflow,
    remainingLoanBalance: finalRow.remainingLoanBalance,
    surrenderValue: financingPrincipal - finalRow.remainingLoanBalance,
    netPosition: finalRow.asbBalance - finalRow.remainingLoanBalance,
    yearlyProjection,
  };
}

interface DividendOffsetStrategyParams extends StrategyParams {
  sideInvestmentReturnRate: number;
}

function simulateDividendOffsetStrategy({
  financingPrincipal,
  monthlyInstalment,
  dividendRate,
  sideInvestmentReturnRate,
  analysisHorizonYears,
  amortizationSchedule,
}: DividendOffsetStrategyParams): AsbStrategySummary {
  let asbBalance = financingPrincipal;
  let reserve = 0;
  let sideInvestmentBalance = 0;
  let cumulativeDividends = 0;
  let cumulativeSideInvestmentContributions = 0;
  let cumulativeUserCashOutflow = 0;
  const yearlyProjection: AsbStrategyYearlyRow[] = [];

  for (let year = 1; year <= analysisHorizonYears; year += 1) {
    for (let monthInYear = 1; monthInYear <= 12; monthInYear += 1) {
      if (reserve >= monthlyInstalment) {
        reserve -= monthlyInstalment;
        sideInvestmentBalance += monthlyInstalment;
        cumulativeSideInvestmentContributions += monthlyInstalment;
      } else {
        const amountCoveredByReserve = reserve;
        const outOfPocket = monthlyInstalment - amountCoveredByReserve;
        reserve = 0;
        cumulativeUserCashOutflow += outOfPocket;
        sideInvestmentBalance += amountCoveredByReserve;
        cumulativeSideInvestmentContributions += amountCoveredByReserve;
      }
    }

    const dividendCredited = asbBalance * dividendRate;
    reserve += dividendCredited;
    cumulativeDividends += dividendCredited;

    const sideInvestmentGrowth =
      sideInvestmentBalance * sideInvestmentReturnRate;
    sideInvestmentBalance += sideInvestmentGrowth;

    const monthsElapsed = year * 12;
    const remainingLoanBalance = getRemainingLoanBalanceAtMonth(
      amortizationSchedule,
      monthsElapsed,
    );

    yearlyProjection.push({
      year,
      asbBalance,
      dividendCredited,
      sideInvestmentValue: sideInvestmentBalance,
      cumulativeUserCashOutflow,
      remainingLoanBalance,
    });
  }

  const finalRow = yearlyProjection.at(-1)!;

  return {
    finalAsbValue: finalRow.asbBalance,
    cumulativeDividends,
    finalSideInvestmentValue: finalRow.sideInvestmentValue,
    cumulativeSideInvestmentContributions,
    cumulativeUserCashOutflow: finalRow.cumulativeUserCashOutflow,
    remainingLoanBalance: finalRow.remainingLoanBalance,
    surrenderValue: financingPrincipal - finalRow.remainingLoanBalance,
    netPosition:
      finalRow.asbBalance +
      finalRow.sideInvestmentValue -
      finalRow.remainingLoanBalance,
    yearlyProjection,
  };
}

interface DirectContributionParams {
  monthlyInstalment: number;
  dividendRate: number;
  analysisHorizonYears: number;
}

function simulateDirectContributionStrategy({
  monthlyInstalment,
  dividendRate,
  analysisHorizonYears,
}: DirectContributionParams): AsbStrategySummary {
  let asbBalance = 0;
  let cumulativeDividends = 0;
  let cumulativeUserCashOutflow = 0;
  const yearlyProjection: AsbStrategyYearlyRow[] = [];

  for (let year = 1; year <= analysisHorizonYears; year += 1) {
    const yearlyContribution = monthlyInstalment * 12;
    asbBalance += yearlyContribution;
    cumulativeUserCashOutflow += yearlyContribution;

    const dividendCredited = asbBalance * dividendRate;
    asbBalance += dividendCredited;
    cumulativeDividends += dividendCredited;

    yearlyProjection.push({
      year,
      asbBalance,
      dividendCredited,
      sideInvestmentValue: 0,
      cumulativeUserCashOutflow,
      remainingLoanBalance: 0,
    });
  }

  const finalRow = yearlyProjection.at(-1)!;

  return {
    finalAsbValue: finalRow.asbBalance,
    cumulativeDividends,
    finalSideInvestmentValue: 0,
    cumulativeSideInvestmentContributions: 0,
    cumulativeUserCashOutflow: finalRow.cumulativeUserCashOutflow,
    remainingLoanBalance: 0,
    surrenderValue: 0,
    netPosition: finalRow.asbBalance,
    yearlyProjection,
  };
}

export function projectAsbFinancing(
  values: AsbFinancingFormValues,
): AsbFinancingComparisonResult {
  const {
    financingPrincipal,
    financingTenureYears,
    annualFinancingRate,
    annualDividendRate,
    annualSideInvestmentReturnRate,
    analysisHorizonYears,
  } = values;

  const amortization = buildAmortizationSchedule({
    principal: financingPrincipal,
    annualInterestRate: annualFinancingRate,
    tenureYears: financingTenureYears,
  });

  const monthlyInstalment = amortization.monthlyInstalment;
  const dividendRate = annualDividendRate / 100;
  const sideInvestmentReturnRate = annualSideInvestmentReturnRate / 100;

  const strategyParams: StrategyParams = {
    financingPrincipal,
    monthlyInstalment,
    dividendRate,
    analysisHorizonYears,
    amortizationSchedule: amortization.schedule,
  };

  const strategies: Record<AsbStrategyId, AsbStrategySummary> = {
    compounding: simulateCompoundingStrategy(strategyParams),
    "dividend-offset": simulateDividendOffsetStrategy({
      ...strategyParams,
      sideInvestmentReturnRate,
    }),
    "direct-contribution": simulateDirectContributionStrategy({
      monthlyInstalment,
      dividendRate,
      analysisHorizonYears,
    }),
  };

  const leadingStrategyId = (
    Object.keys(strategies) as AsbStrategyId[]
  ).reduce<AsbStrategyId>(
    (leaderId, currentId) =>
      strategies[currentId].netPosition > strategies[leaderId].netPosition
        ? currentId
        : leaderId,
    ASB_STRATEGY_IDS[0],
  );

  return {
    monthlyInstalment,
    strategies,
    leadingStrategyId,
  };
}
