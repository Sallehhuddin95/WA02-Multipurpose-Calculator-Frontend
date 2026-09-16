"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/SegmentedControl";
import { createPropertyInvestmentFormSchema } from "@/features/property-investment/schemas/property-investment-form";
import { projectPropertyInvestment } from "@/features/property-investment/services/project-property-investment";
import type {
  PropertyInvestmentComparisonResult,
  PropertyInvestmentFormValues,
  PropertyInvestmentStrategyId,
} from "@/features/property-investment/types/property-investment";
import { PROPERTY_INVESTMENT_STRATEGY_IDS } from "@/features/property-investment/types/property-investment";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<
  Record<keyof PropertyInvestmentFormValues, string>
>;

const STORAGE_KEY = "property-investment:form:v1";

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

const formSchema = createPropertyInvestmentFormSchema(createTranslator("en"));

function validatePropertyInvestmentForm(
  value: unknown,
): PropertyInvestmentFormValues | null {
  const parsed = formSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const strategyLabelKeys: Record<PropertyInvestmentStrategyId, MessageKey> = {
  property: "property.strategy.property.label",
  "instalment-matched": "property.strategy.instalmentMatched.label",
  "instalment-and-costs-matched":
    "property.strategy.instalmentAndCostsMatched.label",
};

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "property.metric.equityAtSale.term",
    definitionKey: "property.metric.equityAtSale.definition",
  },
  {
    termKey: "property.metric.netRentalCashFlow.term",
    definitionKey: "property.metric.netRentalCashFlow.definition",
  },
  {
    termKey: "property.metric.cumulativeUserCashOutflow.term",
    definitionKey: "property.metric.cumulativeUserCashOutflow.definition",
  },
  {
    termKey: "property.metric.netReturn.term",
    definitionKey: "property.metric.netReturn.definition",
  },
  {
    termKey: "property.metric.totalLoan.term",
    definitionKey: "property.metric.totalLoan.definition",
  },
  {
    termKey: "property.metric.reitMonthlyContribution.term",
    definitionKey: "property.metric.reitMonthlyContribution.definition",
  },
  {
    termKey: "property.metric.mrtt.term",
    definitionKey: "property.metric.mrtt.definition",
  },
  {
    termKey: "property.metric.mltt.term",
    definitionKey: "property.metric.mltt.definition",
  },
];

function getInitialComparison(): PropertyInvestmentComparisonResult {
  return projectPropertyInvestment(defaultValues);
}

export function PropertyInvestmentCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset, isHydrated }] = usePersistedState(
    STORAGE_KEY,
    defaultValues,
    validatePropertyInvestmentForm,
  );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [comparison, setComparison] =
    useState<PropertyInvestmentComparisonResult>(getInitialComparison);
  const [submittedValues, setSubmittedValues] =
    useState<PropertyInvestmentFormValues>(defaultValues);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const recomputedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || recomputedRef.current) {
      return;
    }

    recomputedRef.current = true;
    setComparison(projectPropertyInvestment(values));
    setSubmittedValues(values);
  }, [isHydrated, values]);

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
    reset();
    setErrors({});
    setComparison(getInitialComparison());
    setSubmittedValues(defaultValues);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createPropertyInvestmentFormSchema(t).safeParse(values);

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
        className="grid min-w-0 content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-4 sm:p-6"
      >
          <CalculatorField
            errorMessage={errors.purchasePrice}
            helperText={t("property.field.purchasePrice.helper")}
            inputId="purchasePrice"
            label={t("property.field.purchasePrice.label")}
          >
          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            min="0"
            step="1000"
            value={values.purchasePrice}
            onChange={(event) =>
              handleValueChange("purchasePrice", Number(event.target.value))
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <SegmentedControl
          label={t("property.field.inputMethod")}
          onValueChange={(next) =>
            handleValueChange("inputMode", next as typeof values.inputMode)
          }
          options={[
            { label: t("property.mode.downPayment"), value: "down-payment" },
            {
              label: t("property.mode.loanPrincipal"),
              value: "loan-principal",
            },
          ]}
          value={values.inputMode}
        />

        {values.inputMode === "down-payment" ? (
          <CalculatorField
            errorMessage={errors.downPayment}
            helperText={t("property.field.downPayment.helper")}
            inputId="downPayment"
            label={t("property.field.downPayment.label")}
          >
            <Input
              id="downPayment"
              name="downPayment"
              type="number"
              min="0"
              step="1000"
              value={values.downPayment}
              onChange={(event) =>
                handleValueChange("downPayment", Number(event.target.value))
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : (
          <CalculatorField
            errorMessage={errors.loanPrincipal}
            helperText={t("property.field.loanPrincipal.helper")}
            inputId="loanPrincipal"
            label={t("property.field.loanPrincipal.label")}
          >
            <Input
              id="loanPrincipal"
              name="loanPrincipal"
              type="number"
              min="0"
              step="1000"
              value={values.loanPrincipal}
              onChange={(event) =>
                handleValueChange("loanPrincipal", Number(event.target.value))
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.annualFinancingRate}
            helperText={t("property.field.annualFinancingRate.helper")}
            inputId="annualFinancingRate"
            label={t("property.field.annualFinancingRate.label")}
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.financingTenureYears}
            helperText={t("property.field.financingTenureYears.helper")}
            inputId="financingTenureYears"
            label={t("property.field.financingTenureYears.label")}
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.holdingPeriodYears}
          helperText={t("property.field.holdingPeriodYears.helper")}
          inputId="holdingPeriodYears"
          label={t("property.field.holdingPeriodYears.label")}
        >
          <Input
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
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.monthlyRent}
            helperText={t("property.field.monthlyRent.helper")}
            inputId="monthlyRent"
            label={t("property.field.monthlyRent.label")}
          >
            <Input
              id="monthlyRent"
              name="monthlyRent"
              type="number"
              min="0"
              step="50"
              value={values.monthlyRent}
              onChange={(event) =>
                handleValueChange("monthlyRent", Number(event.target.value))
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.occupancyRatePercent}
            helperText={t("property.field.occupancyRatePercent.helper")}
            inputId="occupancyRatePercent"
            label={t("property.field.occupancyRatePercent.label")}
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        </div>

        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("property.field.expenses")}
          </legend>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.monthlyMaintenanceAllowance}
              helperText={t("property.field.monthlyMaintenanceAllowance.helper")}
              inputId="monthlyMaintenanceAllowance"
              label={t("property.field.monthlyMaintenanceAllowance.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.monthlySinkingFund}
              helperText={t("property.field.monthlySinkingFund.helper")}
              inputId="monthlySinkingFund"
              label={t("property.field.monthlySinkingFund.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTaksiran}
              helperText={t("property.field.annualCukaiTaksiran.helper")}
              inputId="annualCukaiTaksiran"
              label={t("property.field.annualCukaiTaksiran.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTanahOrPetak}
              helperText={t("property.field.annualCukaiTanahOrPetak.helper")}
              inputId="annualCukaiTanahOrPetak"
              label={t("property.field.annualCukaiTanahOrPetak.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualIndahWaterCost}
              helperText={t("property.field.annualIndahWaterCost.helper")}
              inputId="annualIndahWaterCost"
              label={t("property.field.annualIndahWaterCost.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualRepairAllowance}
              helperText={t("property.field.annualRepairAllowance.helper")}
              inputId="annualRepairAllowance"
              label={t("property.field.annualRepairAllowance.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualFireInsurance}
              helperText={t("property.field.annualFireInsurance.helper")}
              inputId="annualFireInsurance"
              label={t("property.field.annualFireInsurance.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualOtherCosts}
              helperText={t("property.field.annualOtherCosts.helper")}
              inputId="annualOtherCosts"
              label={t("property.field.annualOtherCosts.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <SegmentedControl
          label={t("property.field.insurance")}
          onValueChange={(next) =>
            handleValueChange(
              "insuranceType",
              next as typeof values.insuranceType,
            )
          }
          options={[
            { label: t("property.mode.mrtt"), value: "mrtt" },
            { label: t("property.mode.mltt"), value: "mltt" },
          ]}
          value={values.insuranceType}
        />

        {values.insuranceType === "mrtt" ? (
          <>
            <SegmentedControl
              label={t("property.field.mrttPaymentTreatment")}
              onValueChange={(next) =>
                handleValueChange(
                  "mrttPaymentTreatment",
                  next as typeof values.mrttPaymentTreatment,
                )
              }
              options={[
                { label: t("property.mode.mrttUpfront"), value: "upfront" },
                { label: t("property.mode.mrttFinanced"), value: "financed" },
              ]}
              value={values.mrttPaymentTreatment}
            />
              <div className="mt-3">
                <CalculatorField
                  errorMessage={errors.mrttCost}
                  helperText={t("property.field.mrttCost.helper")}
                  inputId="mrttCost"
                  label={t("property.field.mrttCost.label")}
                >
                  <Input
                    id="mrttCost"
                    name="mrttCost"
                    type="number"
                    min="0"
                    step="100"
                    value={values.mrttCost}
                    onChange={(event) =>
                      handleValueChange("mrttCost", Number(event.target.value))
                    }
                    className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                  />
                </CalculatorField>
              </div>
            </>
          ) : (
            <div className="mt-3">
              <CalculatorField
                errorMessage={errors.annualMlttCost}
                helperText={t("property.field.annualMlttCost.helper")}
                inputId="annualMlttCost"
                label={t("property.field.annualMlttCost.label")}
              >
                <Input
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
                  className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                />
              </CalculatorField>
            </div>
          )}

        <SegmentedControl
          label={t("property.field.exitValue")}
          onValueChange={(next) =>
            handleValueChange(
              "exitValueMode",
              next as typeof values.exitValueMode,
            )
          }
          options={[
            {
              label: t("property.mode.appreciationRate"),
              value: "appreciation-rate",
            },
            { label: t("property.mode.exitPrice"), value: "exit-price" },
          ]}
          value={values.exitValueMode}
        />
          <div className="mt-3">
            {values.exitValueMode === "appreciation-rate" ? (
              <CalculatorField
                errorMessage={errors.annualAppreciationRate}
                helperText={t("property.field.annualAppreciationRate.helper")}
                inputId="annualAppreciationRate"
                label={t("property.field.annualAppreciationRate.label")}
              >
                <Input
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
                  className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                />
              </CalculatorField>
            ) : (
              <CalculatorField
                errorMessage={errors.expectedExitPrice}
                helperText={t("property.field.expectedExitPrice.helper")}
                inputId="expectedExitPrice"
                label={t("property.field.expectedExitPrice.label")}
              >
                <Input
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
                  className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                />
              </CalculatorField>
            )}
          </div>

        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("property.field.reitComparison")}
          </legend>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.reitInitialCapital}
              helperText={t("property.field.reitInitialCapital.helper")}
              inputId="reitInitialCapital"
              label={t("property.field.reitInitialCapital.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.reitAnnualReturnRate}
              helperText={t("property.field.reitAnnualReturnRate.helper")}
              inputId="reitAnnualReturnRate"
              label={t("property.field.reitAnnualReturnRate.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("property.button.compare")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
          >
            {t("common.reset")}
          </Button>
        </div>
      </form>

      <div className="grid min-w-0 gap-5">
        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("property.overview.heading")}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              label={t("property.metric.totalLoan.term")}
              value={formatCurrency(comparison.property.loanPrincipal)}
            />
            <MetricCard
              label={t("property.overview.monthlyInstalment")}
              value={formatCurrency(comparison.property.monthlyInstalment)}
            />
            <MetricCard
              label={t("property.overview.projectedExitValue")}
              value={formatCurrency(comparison.property.exitValue)}
            />
            <MetricCard
              label={t("property.overview.remainingLoanBalance")}
              value={formatCurrency(comparison.property.remainingLoanBalance)}
            />
            <MetricCard
              label={t("property.metric.equityAtSale.term")}
              value={formatCurrency(comparison.property.equityAtSale)}
            />
            <MetricCard
              label={t("property.overview.cumulativeNetRentalCashFlow")}
              value={formatCurrency(
                comparison.property.cumulativeNetRentalCashFlow,
              )}
            />
            <MetricCard
              label={t("property.metric.cumulativeUserCashOutflow.term")}
              value={formatCurrency(
                comparison.property.cumulativeUserCashOutflow,
              )}
            />
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {t("property.overview.basis")
              .replace(
                "{rate}",
                formatPercentage(submittedValues.annualFinancingRate),
              )
              .replace(
                "{holding}",
                String(submittedValues.holdingPeriodYears),
              )
              .replace(
                "{tenure}",
                String(submittedValues.financingTenureYears),
              )}
          </p>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("property.reit.heading")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("property.reit.intro")}
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {REIT_STRATEGY_ORDER.map((strategyId) => {
              const strategySummary = comparison.reitStrategies[strategyId];

              return (
                <div
                  key={strategyId}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <p className="text-(--foreground) text-sm font-semibold">
                    {t(strategyLabelKeys[strategyId])}
                  </p>
                  <div className="mt-4 grid gap-3">
                    <MetricCard
                      label={t("property.reit.monthlyContribution")}
                      value={formatCurrency(
                        strategySummary.monthlyContribution,
                      )}
                    />
                    <MetricCard
                      label={t("property.reit.finalValue")}
                      value={formatCurrency(strategySummary.finalValue)}
                    />
                    <MetricCard
                      label={t("property.metric.netReturn.term")}
                      value={formatCurrency(strategySummary.netReturn)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {t("property.reit.basis")
              .replace(
                "{capital}",
                formatCurrency(submittedValues.reitInitialCapital),
              )
              .replace(
                "{rate}",
                formatPercentage(submittedValues.reitAnnualReturnRate),
              )}
          </p>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("property.ranking.heading")}
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("property.ranking.description")}
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
                  <th className="pb-3 pr-4 font-semibold">
                    {t("property.ranking.rank")}
                  </th>
                  <th className="pb-3 pr-4 font-semibold">
                    {t("property.ranking.strategy")}
                  </th>
                  <th className="pb-3 font-semibold">
                    {t("property.ranking.netReturn")}
                  </th>
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
                          ? "bg-accent"
                          : "border-t border-border"
                      }
                    >
                      <td className="py-3 pr-4">
                        <span
                          className={
                            isTopRank
                              ? "bg-primary rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground"
                              : "text-(--foreground) rounded-full border border-border px-3 py-1 text-xs font-semibold"
                          }
                        >
                          #{rank}
                        </span>
                      </td>
                      <td className="text-(--foreground) py-3 pr-4 font-semibold">
                        {t(strategyLabelKeys[strategyId])}
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

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                {t("property.projection.heading")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {t("property.projection.range").replace(
                  "{n}",
                  String(comparison.property.yearlyProjection.length),
                )}
              </h2>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-expanded={isTableOpen}
              aria-label={
                isTableOpen
                  ? t("common.hideYearlyProjection")
                  : t("common.showYearlyProjection")
              }
              onClick={() => setIsTableOpen((prev) => !prev)}
              className="rounded-full border border-border text-muted-foreground hover:bg-card hover:text-(--foreground)"
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
            </Button>
          </div>
          {isTableOpen ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">
                      {t("property.table.year")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("property.table.loanBalance")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("property.table.netRentalCashFlow")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("property.table.cumulativeNetCashFlow")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("property.table.reitInstalment")}
                    </th>
                    <th className="pb-2 font-medium">
                      {t("property.table.reitInstalmentAndCosts")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.property.yearlyProjection.map((row) => (
                    <tr key={row.year} className="bg-card rounded-2xl">
                      <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                        {t("period.year").replace("{n}", String(row.year))}
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
  const t = useTranslations();

  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
      <details>
        <summary className="text-primary cursor-pointer text-sm font-medium uppercase tracking-[0.2em]">
          {t("common.whatDoTheseNumbersMean")}
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitionKeys.map(({ termKey, definitionKey }) => (
            <div key={termKey}>
              <dt className="text-(--foreground) text-sm font-semibold">
                {t(termKey)}
              </dt>
              <dd className="text-muted-foreground mt-1 text-sm leading-6">
                {t(definitionKey)}
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
      <Label htmlFor={inputId} className="font-semibold text-(--foreground)">
        {label}
      </Label>
      {children}
      <p className="mt-2 text-sm text-muted-foreground">{helperText}</p>
      {errorMessage ? (
        <p className="mt-1 text-sm font-medium text-destructive">
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
    <div className="bg-card min-w-0 rounded-3xl border border-border p-4">
      <p className="text-muted-foreground text-sm leading-5">{label}</p>
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) sm:text-lg [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

