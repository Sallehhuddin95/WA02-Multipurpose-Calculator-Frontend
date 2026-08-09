import { buildAmortizationSchedule } from "@/lib/financial-math/amortization/build-amortization-schedule";
import { projectMonthlyContributionGrowth } from "@/lib/financial-math/compound-growth/project-monthly-contribution-growth";
import type {
  PropertyInvestmentComparisonResult,
  PropertyInvestmentFormValues,
  PropertyInvestmentStrategyId,
  PropertyInvestmentYearRow,
  ReitStrategyId,
  ReitStrategySummary,
  ReitYearRow,
} from "@/features/property-investment/types/property-investment";
import { REIT_STRATEGY_IDS } from "@/features/property-investment/types/property-investment";

function getFinancedMrttCost(values: PropertyInvestmentFormValues): number {
  return values.insuranceType === "mrtt" &&
    values.mrttPaymentTreatment === "financed"
    ? values.mrttCost
    : 0;
}

function getUpfrontMrttCost(values: PropertyInvestmentFormValues): number {
  return values.insuranceType === "mrtt" &&
    values.mrttPaymentTreatment === "upfront"
    ? values.mrttCost
    : 0;
}

function getAnnualMlttCost(values: PropertyInvestmentFormValues): number {
  return values.insuranceType === "mltt" ? values.annualMlttCost : 0;
}

function getLoanPrincipal(values: PropertyInvestmentFormValues): number {
  const basePrincipal =
    values.inputMode === "loan-principal"
      ? values.loanPrincipal
      : Math.max(values.purchasePrice - values.downPayment, 0);

  return basePrincipal + getFinancedMrttCost(values);
}

function getDownPaymentAmount(values: PropertyInvestmentFormValues): number {
  if (values.inputMode === "loan-principal") {
    return Math.max(values.purchasePrice - values.loanPrincipal, 0);
  }

  return values.downPayment;
}

function getExitValue(values: PropertyInvestmentFormValues): number {
  if (values.exitValueMode === "exit-price") {
    return values.expectedExitPrice;
  }

  return (
    values.purchasePrice *
    (1 + values.annualAppreciationRate / 100) ** values.holdingPeriodYears
  );
}

export function projectPropertyInvestment(
  values: PropertyInvestmentFormValues,
): PropertyInvestmentComparisonResult {
  const loanPrincipal = getLoanPrincipal(values);
  const downPaymentAmount = getDownPaymentAmount(values);

  const amortization = buildAmortizationSchedule({
    principal: loanPrincipal,
    annualInterestRate: values.annualFinancingRate,
    tenureYears: values.financingTenureYears,
  });

  const grossAnnualRent =
    values.monthlyRent * 12 * (values.occupancyRatePercent / 100);
  const annualExpenses =
    values.monthlyMaintenanceAllowance * 12 +
    values.monthlySinkingFund * 12 +
    values.annualCukaiTaksiran +
    values.annualCukaiTanahOrPetak +
    values.annualIndahWaterCost +
    values.annualRepairAllowance +
    values.annualFireInsurance +
    values.annualOtherCosts +
    getAnnualMlttCost(values);
  const annualLoanPayment = amortization.monthlyInstalment * 12;
  const netRentalCashFlow =
    grossAnnualRent - annualExpenses - annualLoanPayment;

  const propertyYearlyProjection: PropertyInvestmentYearRow[] = [];
  let cumulativeNetRentalCashFlow = 0;
  let cumulativeOutOfPocketCash = 0;

  for (let year = 1; year <= values.holdingPeriodYears; year += 1) {
    const scheduleRow = amortization.schedule[year * 12 - 1];
    const loanBalance = scheduleRow ? scheduleRow.remainingBalance : 0;

    cumulativeNetRentalCashFlow += netRentalCashFlow;

    if (netRentalCashFlow < 0) {
      cumulativeOutOfPocketCash += Math.abs(netRentalCashFlow);
    }

    propertyYearlyProjection.push({
      year,
      loanBalance,
      grossAnnualRent,
      annualExpenses,
      annualLoanPayment,
      netRentalCashFlow,
      cumulativeNetRentalCashFlow,
    });
  }

  const remainingLoanBalance =
    propertyYearlyProjection.at(-1)?.loanBalance ?? loanPrincipal;
  const exitValue = getExitValue(values);
  const equityAtSale = exitValue - remainingLoanBalance;
  const upfrontMrttMlttCost = getUpfrontMrttCost(values);
  const initialCashOutflow = downPaymentAmount + upfrontMrttMlttCost;
  const cumulativeUserCashOutflow =
    initialCashOutflow + cumulativeOutOfPocketCash;
  const propertyNetReturn =
    equityAtSale + cumulativeNetRentalCashFlow - initialCashOutflow;

  const totalMonths = values.holdingPeriodYears * 12;
  const monthlyOtherCosts = annualExpenses / 12;
  const monthlyContributionByStrategy: Record<ReitStrategyId, number> = {
    "instalment-matched": amortization.monthlyInstalment,
    "instalment-and-costs-matched":
      amortization.monthlyInstalment + monthlyOtherCosts,
  };

  const reitStrategies = Object.fromEntries(
    REIT_STRATEGY_IDS.map((strategyId) => {
      const monthlyContribution = monthlyContributionByStrategy[strategyId];
      const growthPoints = projectMonthlyContributionGrowth({
        initialCapital: values.reitInitialCapital,
        monthlyContribution,
        annualReturnRate: values.reitAnnualReturnRate,
        totalMonths,
      });

      const yearlyProjection: ReitYearRow[] = [];

      for (let year = 1; year <= values.holdingPeriodYears; year += 1) {
        const point = growthPoints[year * 12 - 1];

        yearlyProjection.push({
          year,
          reitValue: point ? point.balance : values.reitInitialCapital,
        });
      }

      const lastPoint = growthPoints.at(-1);
      const finalValue = lastPoint
        ? lastPoint.balance
        : values.reitInitialCapital;
      const cumulativeContributions = lastPoint
        ? lastPoint.contributionToDate
        : values.reitInitialCapital;

      const summary: ReitStrategySummary = {
        monthlyContribution,
        finalValue,
        cumulativeContributions,
        netReturn: finalValue - cumulativeContributions,
        yearlyProjection,
      };

      return [strategyId, summary];
    }),
  ) as Record<ReitStrategyId, ReitStrategySummary>;

  const netReturnByStrategy: Record<PropertyInvestmentStrategyId, number> = {
    property: propertyNetReturn,
    "instalment-matched": reitStrategies["instalment-matched"].netReturn,
    "instalment-and-costs-matched":
      reitStrategies["instalment-and-costs-matched"].netReturn,
  };

  const leadingStrategyId = (
    Object.keys(netReturnByStrategy) as PropertyInvestmentStrategyId[]
  ).reduce<PropertyInvestmentStrategyId>(
    (leadingId, candidateId) =>
      netReturnByStrategy[candidateId] > netReturnByStrategy[leadingId]
        ? candidateId
        : leadingId,
    "property",
  );

  return {
    property: {
      loanPrincipal,
      monthlyInstalment: amortization.monthlyInstalment,
      exitValue,
      remainingLoanBalance,
      equityAtSale,
      cumulativeNetRentalCashFlow,
      cumulativeUserCashOutflow,
      netReturn: propertyNetReturn,
      yearlyProjection: propertyYearlyProjection,
    },
    reitStrategies,
    leadingStrategyId,
  };
}
