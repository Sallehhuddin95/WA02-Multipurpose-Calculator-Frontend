"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { propertyInvestmentFormSchema } from "@/features/property-investment/schemas/property-investment-form";
import { projectPropertyInvestment } from "@/features/property-investment/services/project-property-investment";
import type {
  PropertyInvestmentComparisonResult,
  PropertyInvestmentFormValues,
  PropertyInvestmentStrategyId,
} from "@/features/property-investment/types/property-investment";
import { PROPERTY_INVESTMENT_STRATEGY_IDS } from "@/features/property-investment/types/property-investment";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<
  Record<keyof PropertyInvestmentFormValues, string>
>;

const defaultValues: PropertyInvestmentFormValues = {
  purchasePrice: 450000,
  inputMode: "down-payment",
  downPayment: 45000,
  loanPrincipal: 405000,
  annualFinancingRate: 4,
  financingTenureYears: 35,
  holdingPeriodYears: 10,
  monthlyRent: 1800,
  occupancyRatePercent: 90,
  monthlyMaintenanceAllowance: 250,
  monthlySinkingFund: 50,
  annualCukaiTaksiran: 500,
  annualCukaiTanahOrPetak: 200,
  annualIndahWaterCost: 120,
  annualRepairAllowance: 400,
  annualFireInsurance: 100,
  annualOtherCosts: 0,
  insuranceType: "mrtt",
  mrttPaymentTreatment: "upfront",
  mrttCost: 15000,
  annualMlttCost: 0,
  exitValueMode: "appreciation-rate",
  annualAppreciationRate: 3,
  expectedExitPrice: 550000,
  reitInitialCapital: 90000,
  reitAnnualReturnRate: 6,
};

const strategyLabels: Record<PropertyInvestmentStrategyId, string> = {
  property: "Buy-to-rent property",
  "instalment-matched": "REIT (instalment-matched)",
  "instalment-and-costs-matched": "REIT (instalment + costs)",
};

const metricDefinitions: ReadonlyArray<{ term: string; definition: string }> = [
  {
    term: "Equity at sale",
    definition:
      "The projected sale value of the property minus the remaining loan balance at the end of the holding period.",
  },
  {
    term: "Net rental cash flow",
    definition:
      "Rental income minus property expenses and loan instalments for one year; negative years mean you cover the shortfall out of pocket.",
  },
  {
    term: "Cumulative user cash outflow",
    definition:
      "Total cash you put in: the initial down payment (and any upfront MRTT or MLTT cost) plus any yearly rental shortfalls.",
  },
  {
    term: "Net return",
    definition:
      "What a strategy nets overall: money received minus money you put in, over the same holding period.",
  },
  {
    term: "Total loan",
    definition:
      "The full loan principal used to calculate the instalment, including any MRTT premium you choose to finance.",
  },
  {
    term: "REIT monthly contribution",
    definition:
      "How much is added to each REIT strategy every month: the property's instalment alone, or the instalment plus its other monthly costs.",
  },
  {
    term: "MRTT",
    definition:
      "A one-time mortgage insurance premium you can pay upfront or add to the loan.",
  },
  {
    term: "MLTT",
    definition:
      "A recurring annual mortgage insurance premium paid alongside your other yearly property costs, not financed into the loan.",
  },
];

function getInitialComparison(): PropertyInvestmentComparisonResult {
  return projectPropertyInvestment(defaultValues);
}

export function PropertyInvestmentCalculator() {
  const [values, setValues] =
    useState<PropertyInvestmentFormValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [comparison, setComparison] =
    useState<PropertyInvestmentComparisonResult>(getInitialComparison);
  const [submittedValues, setSubmittedValues] =
    useState<PropertyInvestmentFormValues>(defaultValues);
  const [isTableOpen, setIsTableOpen] = useState(false);

  function handleValueChange<K extends keyof PropertyInvestmentFormValues>(
    key: K,
    nextValue: PropertyInvestmentFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleReset() {
    setValues(defaultValues);
    setErrors({});
    setComparison(getInitialComparison());
    setSubmittedValues(defaultValues);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = propertyInvestmentFormSchema.safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof PropertyInvestmentFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setComparison(projectPropertyInvestment(parsedValues.data));
    setSubmittedValues(parsedValues.data);
  }

  const rankedStrategies = PROPERTY_INVESTMENT_STRATEGY_IDS.map(
    (strategyId) => ({
      strategyId,
      netReturn:
        strategyId === "property"
          ? comparison.property.netReturn
          : comparison.reitStrategies[strategyId].netReturn,
    }),
  ).sort((a, b) => b.netReturn - a.netReturn);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid content-start gap-5 self-start rounded-[1.75rem] border border-(--line) bg-white/75 p-6"
      >
        <CalculatorField
          errorMessage={errors.purchasePrice}
          helperText="The agreed property purchase price."
          inputId="purchasePrice"
          label="Purchase price"
        >
          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            min="0"
            step="1000"
            value={values.purchasePrice}
            onChange={(event) =>
              handleValueChange("purchasePrice", Number(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Financing input method
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.inputMode === "down-payment"}
              label="Down payment"
              onClick={() => handleValueChange("inputMode", "down-payment")}
            />
            <ModeButton
              isActive={values.inputMode === "loan-principal"}
              label="Loan principal directly"
              onClick={() => handleValueChange("inputMode", "loan-principal")}
            />
          </div>
        </fieldset>

        {values.inputMode === "down-payment" ? (
          <CalculatorField
            errorMessage={errors.downPayment}
            helperText="Cash paid up front before financing begins."
            inputId="downPayment"
            label="Down payment"
          >
            <input
              id="downPayment"
              name="downPayment"
              type="number"
              min="0"
              step="1000"
              value={values.downPayment}
              onChange={(event) =>
                handleValueChange("downPayment", Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        ) : (
          <CalculatorField
            errorMessage={errors.loanPrincipal}
            helperText="Use this when you already know the exact loan amount."
            inputId="loanPrincipal"
            label="Loan principal"
          >
            <input
              id="loanPrincipal"
              name="loanPrincipal"
              type="number"
              min="0"
              step="1000"
              value={values.loanPrincipal}
              onChange={(event) =>
                handleValueChange("loanPrincipal", Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.annualFinancingRate}
            helperText="Annual reducing-balance financing rate."
            inputId="annualFinancingRate"
            label="Annual financing rate (%)"
          >
            <input
              id="annualFinancingRate"
              name="annualFinancingRate"
              type="number"
              min="0"
              step="0.1"
              value={values.annualFinancingRate}
              onChange={(event) =>
                handleValueChange(
                  "annualFinancingRate",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.financingTenureYears}
            helperText="Whole number of years for the property loan."
            inputId="financingTenureYears"
            label="Financing tenure (years)"
          >
            <input
              id="financingTenureYears"
              name="financingTenureYears"
              type="number"
              min="1"
              step="1"
              value={values.financingTenureYears}
              onChange={(event) =>
                handleValueChange(
                  "financingTenureYears",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.holdingPeriodYears}
          helperText="Cannot exceed the financing tenure."
          inputId="holdingPeriodYears"
          label="Holding period (years)"
        >
          <input
            id="holdingPeriodYears"
            name="holdingPeriodYears"
            type="number"
            min="1"
            step="1"
            value={values.holdingPeriodYears}
            onChange={(event) =>
              handleValueChange(
                "holdingPeriodYears",
                Number(event.target.value),
              )
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.monthlyRent}
            helperText="Expected gross monthly rent at full occupancy."
            inputId="monthlyRent"
            label="Monthly rent"
          >
            <input
              id="monthlyRent"
              name="monthlyRent"
              type="number"
              min="0"
              step="50"
              value={values.monthlyRent}
              onChange={(event) =>
                handleValueChange("monthlyRent", Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.occupancyRatePercent}
            helperText="Share of the year the unit is expected to be tenanted."
            inputId="occupancyRatePercent"
            label="Occupancy rate (%)"
          >
            <input
              id="occupancyRatePercent"
              name="occupancyRatePercent"
              type="number"
              min="0"
              max="100"
              step="1"
              value={values.occupancyRatePercent}
              onChange={(event) =>
                handleValueChange(
                  "occupancyRatePercent",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        </div>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Property expenses
          </legend>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.monthlyMaintenanceAllowance}
              helperText="Monthly maintenance allowance."
              inputId="monthlyMaintenanceAllowance"
              label="Maintenance allowance (monthly)"
            >
              <input
                id="monthlyMaintenanceAllowance"
                name="monthlyMaintenanceAllowance"
                type="number"
                min="0"
                step="50"
                value={values.monthlyMaintenanceAllowance}
                onChange={(event) =>
                  handleValueChange(
                    "monthlyMaintenanceAllowance",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.monthlySinkingFund}
              helperText="Monthly sinking fund contribution."
              inputId="monthlySinkingFund"
              label="Sinking fund (monthly)"
            >
              <input
                id="monthlySinkingFund"
                name="monthlySinkingFund"
                type="number"
                min="0"
                step="10"
                value={values.monthlySinkingFund}
                onChange={(event) =>
                  handleValueChange(
                    "monthlySinkingFund",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTaksiran}
              helperText="Yearly assessment tax (cukai taksiran)."
              inputId="annualCukaiTaksiran"
              label="Cukai taksiran"
            >
              <input
                id="annualCukaiTaksiran"
                name="annualCukaiTaksiran"
                type="number"
                min="0"
                step="10"
                value={values.annualCukaiTaksiran}
                onChange={(event) =>
                  handleValueChange(
                    "annualCukaiTaksiran",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTanahOrPetak}
              helperText="Yearly quit rent (cukai tanah or cukai petak)."
              inputId="annualCukaiTanahOrPetak"
              label="Cukai tanah or petak"
            >
              <input
                id="annualCukaiTanahOrPetak"
                name="annualCukaiTanahOrPetak"
                type="number"
                min="0"
                step="10"
                value={values.annualCukaiTanahOrPetak}
                onChange={(event) =>
                  handleValueChange(
                    "annualCukaiTanahOrPetak",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualIndahWaterCost}
              helperText="Yearly Indah Water sewerage cost."
              inputId="annualIndahWaterCost"
              label="Indah Water cost"
            >
              <input
                id="annualIndahWaterCost"
                name="annualIndahWaterCost"
                type="number"
                min="0"
                step="10"
                value={values.annualIndahWaterCost}
                onChange={(event) =>
                  handleValueChange(
                    "annualIndahWaterCost",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualRepairAllowance}
              helperText="Yearly allowance for repairs."
              inputId="annualRepairAllowance"
              label="Repair allowance"
            >
              <input
                id="annualRepairAllowance"
                name="annualRepairAllowance"
                type="number"
                min="0"
                step="50"
                value={values.annualRepairAllowance}
                onChange={(event) =>
                  handleValueChange(
                    "annualRepairAllowance",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualFireInsurance}
              helperText="Yearly fire insurance premium."
              inputId="annualFireInsurance"
              label="Fire insurance"
            >
              <input
                id="annualFireInsurance"
                name="annualFireInsurance"
                type="number"
                min="0"
                step="10"
                value={values.annualFireInsurance}
                onChange={(event) =>
                  handleValueChange(
                    "annualFireInsurance",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualOtherCosts}
              helperText="Any other recurring yearly cost not covered above."
              inputId="annualOtherCosts"
              label="Other costs"
            >
              <input
                id="annualOtherCosts"
                name="annualOtherCosts"
                type="number"
                min="0"
                step="10"
                value={values.annualOtherCosts}
                onChange={(event) =>
                  handleValueChange(
                    "annualOtherCosts",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Mortgage insurance (MRTT or MLTT)
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.insuranceType === "mrtt"}
              label="MRTT (single premium)"
              onClick={() => handleValueChange("insuranceType", "mrtt")}
            />
            <ModeButton
              isActive={values.insuranceType === "mltt"}
              label="MLTT (recurring premium)"
              onClick={() => handleValueChange("insuranceType", "mltt")}
            />
          </div>

          {values.insuranceType === "mrtt" ? (
            <>
              <div className="mt-3 flex flex-wrap gap-3">
                <ModeButton
                  isActive={values.mrttPaymentTreatment === "upfront"}
                  label="Upfront cash cost"
                  onClick={() =>
                    handleValueChange("mrttPaymentTreatment", "upfront")
                  }
                />
                <ModeButton
                  isActive={values.mrttPaymentTreatment === "financed"}
                  label="Financed into the loan"
                  onClick={() =>
                    handleValueChange("mrttPaymentTreatment", "financed")
                  }
                />
              </div>
              <div className="mt-3">
                <CalculatorField
                  errorMessage={errors.mrttCost}
                  helperText="One-time MRTT premium, paid upfront or added to the loan."
                  inputId="mrttCost"
                  label="MRTT cost"
                >
                  <input
                    id="mrttCost"
                    name="mrttCost"
                    type="number"
                    min="0"
                    step="100"
                    value={values.mrttCost}
                    onChange={(event) =>
                      handleValueChange("mrttCost", Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
                  />
                </CalculatorField>
              </div>
            </>
          ) : (
            <div className="mt-3">
              <CalculatorField
                errorMessage={errors.annualMlttCost}
                helperText="Recurring annual MLTT premium, paid alongside your other yearly property costs. It is never financed into the loan."
                inputId="annualMlttCost"
                label="Annual MLTT cost"
              >
                <input
                  id="annualMlttCost"
                  name="annualMlttCost"
                  type="number"
                  min="0"
                  step="50"
                  value={values.annualMlttCost}
                  onChange={(event) =>
                    handleValueChange(
                      "annualMlttCost",
                      Number(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
                />
              </CalculatorField>
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Exit value assumption
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.exitValueMode === "appreciation-rate"}
              label="Annual appreciation rate"
              onClick={() =>
                handleValueChange("exitValueMode", "appreciation-rate")
              }
            />
            <ModeButton
              isActive={values.exitValueMode === "exit-price"}
              label="Expected exit price"
              onClick={() => handleValueChange("exitValueMode", "exit-price")}
            />
          </div>
          <div className="mt-3">
            {values.exitValueMode === "appreciation-rate" ? (
              <CalculatorField
                errorMessage={errors.annualAppreciationRate}
                helperText="Fixed annual appreciation assumption for the full holding period."
                inputId="annualAppreciationRate"
                label="Annual appreciation rate (%)"
              >
                <input
                  id="annualAppreciationRate"
                  name="annualAppreciationRate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={values.annualAppreciationRate}
                  onChange={(event) =>
                    handleValueChange(
                      "annualAppreciationRate",
                      Number(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
                />
              </CalculatorField>
            ) : (
              <CalculatorField
                errorMessage={errors.expectedExitPrice}
                helperText="Use this when you already have an expected sale price."
                inputId="expectedExitPrice"
                label="Expected exit price"
              >
                <input
                  id="expectedExitPrice"
                  name="expectedExitPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={values.expectedExitPrice}
                  onChange={(event) =>
                    handleValueChange(
                      "expectedExitPrice",
                      Number(event.target.value),
                    )
                  }
                  className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
                />
              </CalculatorField>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            REIT comparison
          </legend>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.reitInitialCapital}
              helperText="Optional starting capital for both REIT strategies; enter 0 to start with none."
              inputId="reitInitialCapital"
              label="REIT initial capital"
            >
              <input
                id="reitInitialCapital"
                name="reitInitialCapital"
                type="number"
                min="0"
                step="1000"
                value={values.reitInitialCapital}
                onChange={(event) =>
                  handleValueChange(
                    "reitInitialCapital",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.reitAnnualReturnRate}
              helperText="Fixed annual total return assumption for the REIT."
              inputId="reitAnnualReturnRate"
              label="REIT annual return rate (%)"
            >
              <input
                id="reitAnnualReturnRate"
                name="reitAnnualReturnRate"
                type="number"
                min="0"
                step="0.1"
                value={values.reitAnnualReturnRate}
                onChange={(event) =>
                  handleValueChange(
                    "reitAnnualReturnRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="bg-(--accent) hover:bg-(--accent-strong) rounded-full px-5 py-3 text-sm font-semibold text-white transition"
          >
            Compare property and REIT
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-(--foreground) hover:border-(--accent) rounded-full border border-(--line) bg-white px-5 py-3 text-sm font-semibold transition"
          >
            Reset inputs
          </button>
        </div>
      </form>

      <div className="grid min-w-0 gap-5">
        <section className="min-w-0 rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
            Property Overview
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label="Total loan"
              value={formatCurrency(comparison.property.loanPrincipal)}
            />
            <MetricCard
              label="Monthly instalment"
              value={formatCurrency(comparison.property.monthlyInstalment)}
            />
            <MetricCard
              label="Projected exit value"
              value={formatCurrency(comparison.property.exitValue)}
            />
            <MetricCard
              label="Remaining loan balance"
              value={formatCurrency(comparison.property.remainingLoanBalance)}
            />
            <MetricCard
              label="Equity at sale"
              value={formatCurrency(comparison.property.equityAtSale)}
            />
            <MetricCard
              label="Cumulative net rental cash flow"
              value={formatCurrency(
                comparison.property.cumulativeNetRentalCashFlow,
              )}
            />
            <MetricCard
              label="Cumulative user cash outflow"
              value={formatCurrency(
                comparison.property.cumulativeUserCashOutflow,
              )}
            />
          </div>
          <p className="text-(--muted) mt-5 text-sm leading-6">
            Based on a reducing-balance amortized loan at{" "}
            {formatPercentage(submittedValues.annualFinancingRate)} over a{" "}
            {submittedValues.holdingPeriodYears}-year holding period within a{" "}
            {submittedValues.financingTenureYears}-year tenure.
          </p>
        </section>

        <section className="min-w-0 rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
            REIT Overview
          </p>
          <p className="text-(--muted) mt-2 text-sm leading-6">
            Both strategies start from the same capital and grow monthly; only
            the monthly contribution amount differs.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {REIT_STRATEGY_ORDER.map((strategyId) => {
              const strategySummary = comparison.reitStrategies[strategyId];

              return (
                <div
                  key={strategyId}
                  className="rounded-2xl border border-(--line) bg-(--panel) p-5"
                >
                  <p className="text-(--foreground) text-sm font-semibold">
                    {strategyLabels[strategyId]}
                  </p>
                  <div className="mt-4 grid gap-3">
                    <MetricCard
                      label="Monthly contribution"
                      value={formatCurrency(
                        strategySummary.monthlyContribution,
                      )}
                    />
                    <MetricCard
                      label="Final value"
                      value={formatCurrency(strategySummary.finalValue)}
                    />
                    <MetricCard
                      label="Net return"
                      value={formatCurrency(strategySummary.netReturn)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-(--muted) mt-5 text-sm leading-6">
            Based on {formatCurrency(submittedValues.reitInitialCapital)}{" "}
            starting capital at a fixed{" "}
            {formatPercentage(submittedValues.reitAnnualReturnRate)} annual
            return, compounded monthly.
          </p>
        </section>

        <section className="min-w-0 rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
            Strategy Ranking
          </p>
          <p className="text-(--muted) mt-2 text-sm leading-6">
            Strategies ranked by net return for this holding period.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-(--muted) text-xs uppercase tracking-[0.14em]">
                  <th className="pb-3 pr-4 font-semibold">Rank</th>
                  <th className="pb-3 pr-4 font-semibold">Strategy</th>
                  <th className="pb-3 font-semibold">Net return</th>
                </tr>
              </thead>
              <tbody>
                {rankedStrategies.map(({ strategyId, netReturn }, index) => {
                  const rank = index + 1;
                  const isTopRank = rank === 1;

                  return (
                    <tr
                      key={strategyId}
                      className={
                        isTopRank
                          ? "bg-(--accent-soft)"
                          : "border-t border-(--line)"
                      }
                    >
                      <td className="py-3 pr-4">
                        <span
                          className={
                            isTopRank
                              ? "bg-(--accent) rounded-full px-3 py-1 text-xs font-semibold text-white"
                              : "text-(--foreground) rounded-full border border-(--line) px-3 py-1 text-xs font-semibold"
                          }
                        >
                          #{rank}
                        </span>
                      </td>
                      <td className="text-(--foreground) py-3 pr-4 font-semibold">
                        {strategyLabels[strategyId]}
                      </td>
                      <td className="text-(--foreground) py-3 font-semibold">
                        {formatCurrency(netReturn)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="min-w-0 rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-(--warning) text-sm font-medium uppercase tracking-[0.2em]">
                Yearly Projection
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Year 1 to {comparison.property.yearlyProjection.length}
              </h2>
            </div>
            <button
              type="button"
              aria-expanded={isTableOpen}
              aria-label={
                isTableOpen
                  ? "Hide yearly projection"
                  : "Show yearly projection"
              }
              onClick={() => setIsTableOpen((prev) => !prev)}
              className="text-(--muted) hover:text-(--foreground) hover:bg-(--panel) flex h-9 w-9 items-center justify-center rounded-full border border-(--line) transition"
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-200 ${
                  isTableOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          {isTableOpen ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-(--muted)">
                    <th className="pb-2 pr-4 font-medium">Year</th>
                    <th className="pb-2 pr-4 font-medium">Loan balance</th>
                    <th className="pb-2 pr-4 font-medium">
                      Net rental cash flow
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      Cumulative net cash flow
                    </th>
                    <th className="pb-2 pr-4 font-medium">REIT (instalment)</th>
                    <th className="pb-2 font-medium">
                      REIT (instalment + costs)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.property.yearlyProjection.map((row) => (
                    <tr key={row.year} className="bg-(--panel) rounded-2xl">
                      <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                        Year {row.year}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.loanBalance)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.netRentalCashFlow)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.cumulativeNetRentalCashFlow)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(
                          comparison.reitStrategies["instalment-matched"]
                            .yearlyProjection[row.year - 1]?.reitValue ?? 0,
                        )}
                      </td>
                      <td className="rounded-r-2xl px-4 py-3">
                        {formatCurrency(
                          comparison.reitStrategies[
                            "instalment-and-costs-matched"
                          ].yearlyProjection[row.year - 1]?.reitValue ?? 0,
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>

        <MetricGlossary />
      </div>
    </div>
  );
}

const REIT_STRATEGY_ORDER: readonly Exclude<
  PropertyInvestmentStrategyId,
  "property"
>[] = ["instalment-matched", "instalment-and-costs-matched"];

function MetricGlossary() {
  return (
    <section className="min-w-0 rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
      <details>
        <summary className="text-(--accent) cursor-pointer text-sm font-medium uppercase tracking-[0.2em]">
          What do these numbers mean?
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitions.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-(--foreground) text-sm font-semibold">
                {term}
              </dt>
              <dd className="text-(--muted) mt-1 text-sm leading-6">
                {definition}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

interface CalculatorFieldProps {
  readonly children: ReactNode;
  errorMessage?: string;
  helperText: string;
  inputId: string;
  label: string;
}

function CalculatorField({
  children,
  errorMessage,
  helperText,
  inputId,
  label,
}: Readonly<CalculatorFieldProps>) {
  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-(--foreground) text-sm font-semibold"
      >
        {label}
      </label>
      {children}
      <p className="text-(--muted) mt-2 text-sm">{helperText}</p>
      {errorMessage ? (
        <p className="mt-1 text-sm font-medium text-[#9f2f27]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
}

function MetricCard({ label, value }: Readonly<MetricCardProps>) {
  return (
    <div className="bg-(--panel) min-w-0 rounded-3xl border border-(--line) p-4">
      <p className="text-(--muted) text-sm leading-5">{label}</p>
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) sm:text-lg [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

interface ModeButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ModeButton({ isActive, label, onClick }: Readonly<ModeButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-(--accent) border-(--accent) text-white"
          : "text-(--foreground) border-(--line) bg-white/60 hover:border-(--accent)",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
