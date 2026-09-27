"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericInput } from "@/components/NumericInput";
import { createRentVsBuyFormSchema } from "@/features/rent-vs-buy/schemas/rent-vs-buy-form";
import { projectRentVsBuy } from "@/features/rent-vs-buy/services/project-rent-vs-buy";
import type {
  ComparisonLeader,
  RentVsBuyComparisonResult,
  RentVsBuyFormValues,
} from "@/features/rent-vs-buy/types/rent-vs-buy";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof RentVsBuyFormValues, string>>;

const STORAGE_KEY = "rent-vs-buy:form:v1";

const defaultValues: RentVsBuyFormValues = {
  homePrice: 500000,
  downPaymentPercent: 10,
  annualFinancingRate: 4,
  financingTenureYears: 35,
  comparisonHorizonYears: 5,
  monthlyMaintenance: 250,
  annualCukaiTaksiran: 500,
  annualCukaiTanahOrPetak: 200,
  annualIndahWaterCost: 120,
  otherMonthlyCosts: 0,
  monthlyRent: 1800,
  annualAppreciationRate: 3,
  renterAnnualReturnRate: 5,
};

const formSchema = createRentVsBuyFormSchema(createTranslator("en"));

function validateRentVsBuyForm(value: unknown): RentVsBuyFormValues | null {
  const parsed = formSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const verdictLabelKeys: Record<ComparisonLeader, MessageKey> = {
  buy: "rentBuy.verdict.buy",
  rent: "rentBuy.verdict.rent",
  tied: "rentBuy.verdict.tied",
};

const leaderLabelKeys: Record<ComparisonLeader, MessageKey> = {
  buy: "rentBuy.table.leaderBuy",
  rent: "rentBuy.table.leaderRent",
  tied: "rentBuy.table.leaderTied",
};

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "rentBuy.metric.loanPrincipal.term",
    definitionKey: "rentBuy.metric.loanPrincipal.definition",
  },
  {
    termKey: "rentBuy.metric.monthlyInstalment.term",
    definitionKey: "rentBuy.metric.monthlyInstalment.definition",
  },
  {
    termKey: "rentBuy.metric.monthlyOwnershipCosts.term",
    definitionKey: "rentBuy.metric.monthlyOwnershipCosts.definition",
  },
  {
    termKey: "rentBuy.metric.buyMonthlyBudget.term",
    definitionKey: "rentBuy.metric.buyMonthlyBudget.definition",
  },
  {
    termKey: "rentBuy.metric.renterMonthlyInvestment.term",
    definitionKey: "rentBuy.metric.renterMonthlyInvestment.definition",
  },
  {
    termKey: "rentBuy.metric.buyerEquity.term",
    definitionKey: "rentBuy.metric.buyerEquity.definition",
  },
  {
    termKey: "rentBuy.metric.renterPortfolioValue.term",
    definitionKey: "rentBuy.metric.renterPortfolioValue.definition",
  },
];

function getInitialComparison(): RentVsBuyComparisonResult {
  return projectRentVsBuy(defaultValues);
}

export function RentVsBuyCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset, isHydrated }] = usePersistedState(
    STORAGE_KEY,
    defaultValues,
    validateRentVsBuyForm,
  );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [comparison, setComparison] =
    useState<RentVsBuyComparisonResult>(getInitialComparison);
  const [submittedValues, setSubmittedValues] =
    useState<RentVsBuyFormValues>(defaultValues);
  const [isTableOpen, setIsTableOpen] = useState(false);

  const recomputedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || recomputedRef.current) {
      return;
    }

    recomputedRef.current = true;
    setComparison(projectRentVsBuy(values));
    setSubmittedValues(values);
  }, [isHydrated, values]);

  function handleValueChange<K extends keyof RentVsBuyFormValues>(
    key: K,
    nextValue: RentVsBuyFormValues[K],
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

    const parsedValues = createRentVsBuyFormSchema(t).safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof RentVsBuyFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setComparison(projectRentVsBuy(parsedValues.data));
    setSubmittedValues(parsedValues.data);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid min-w-0 content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-4 sm:p-6"
      >
        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("rentBuy.field.buyPath")}
          </legend>
          <div className="mt-3 grid gap-5">
            <CalculatorField
              errorMessage={errors.homePrice}
              helperText={t("rentBuy.field.homePrice.helper")}
              inputId="homePrice"
              label={t("rentBuy.field.homePrice.label")}
            >
              <NumericInput
                id="homePrice"
                name="homePrice"
                min="0"
                step="1000"
                value={values.homePrice}
                onValueChange={(next) => handleValueChange("homePrice", next)}
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.downPaymentPercent}
              helperText={t("rentBuy.field.downPaymentPercent.helper")}
              inputId="downPaymentPercent"
              label={t("rentBuy.field.downPaymentPercent.label")}
            >
              <NumericInput
                id="downPaymentPercent"
                name="downPaymentPercent"
                min="0"
                max="100"
                step="1"
                value={values.downPaymentPercent}
                onValueChange={(next) =>
                  handleValueChange("downPaymentPercent", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualFinancingRate}
              helperText={t("rentBuy.field.annualFinancingRate.helper")}
              inputId="annualFinancingRate"
              label={t("rentBuy.field.annualFinancingRate.label")}
            >
              <NumericInput
                id="annualFinancingRate"
                name="annualFinancingRate"
                min="0"
                step="0.1"
                value={values.annualFinancingRate}
                onValueChange={(next) =>
                  handleValueChange("annualFinancingRate", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.financingTenureYears}
              helperText={t("rentBuy.field.financingTenureYears.helper")}
              inputId="financingTenureYears"
              label={t("rentBuy.field.financingTenureYears.label")}
            >
              <NumericInput
                id="financingTenureYears"
                name="financingTenureYears"
                min="1"
                step="1"
                value={values.financingTenureYears}
                onValueChange={(next) =>
                  handleValueChange("financingTenureYears", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.comparisonHorizonYears}
              helperText={t("rentBuy.field.comparisonHorizonYears.helper")}
              inputId="comparisonHorizonYears"
              label={t("rentBuy.field.comparisonHorizonYears.label")}
            >
              <NumericInput
                id="comparisonHorizonYears"
                name="comparisonHorizonYears"
                min="1"
                step="1"
                value={values.comparisonHorizonYears}
                onValueChange={(next) =>
                  handleValueChange("comparisonHorizonYears", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("rentBuy.field.ownershipCosts")}
          </legend>
          <div className="mt-3 grid gap-5">
            <CalculatorField
              errorMessage={errors.monthlyMaintenance}
              helperText={t("rentBuy.field.monthlyMaintenance.helper")}
              inputId="monthlyMaintenance"
              label={t("rentBuy.field.monthlyMaintenance.label")}
            >
              <NumericInput
                id="monthlyMaintenance"
                name="monthlyMaintenance"
                min="0"
                step="50"
                value={values.monthlyMaintenance}
                onValueChange={(next) =>
                  handleValueChange("monthlyMaintenance", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTaksiran}
              helperText={t("rentBuy.field.annualCukaiTaksiran.helper")}
              inputId="annualCukaiTaksiran"
              label={t("rentBuy.field.annualCukaiTaksiran.label")}
            >
              <NumericInput
                id="annualCukaiTaksiran"
                name="annualCukaiTaksiran"
                min="0"
                step="10"
                value={values.annualCukaiTaksiran}
                onValueChange={(next) =>
                  handleValueChange("annualCukaiTaksiran", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualCukaiTanahOrPetak}
              helperText={t("rentBuy.field.annualCukaiTanahOrPetak.helper")}
              inputId="annualCukaiTanahOrPetak"
              label={t("rentBuy.field.annualCukaiTanahOrPetak.label")}
            >
              <NumericInput
                id="annualCukaiTanahOrPetak"
                name="annualCukaiTanahOrPetak"
                min="0"
                step="10"
                value={values.annualCukaiTanahOrPetak}
                onValueChange={(next) =>
                  handleValueChange("annualCukaiTanahOrPetak", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.annualIndahWaterCost}
              helperText={t("rentBuy.field.annualIndahWaterCost.helper")}
              inputId="annualIndahWaterCost"
              label={t("rentBuy.field.annualIndahWaterCost.label")}
            >
              <NumericInput
                id="annualIndahWaterCost"
                name="annualIndahWaterCost"
                min="0"
                step="10"
                value={values.annualIndahWaterCost}
                onValueChange={(next) =>
                  handleValueChange("annualIndahWaterCost", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.otherMonthlyCosts}
              helperText={t("rentBuy.field.otherMonthlyCosts.helper")}
              inputId="otherMonthlyCosts"
              label={t("rentBuy.field.otherMonthlyCosts.label")}
            >
              <NumericInput
                id="otherMonthlyCosts"
                name="otherMonthlyCosts"
                min="0"
                step="50"
                value={values.otherMonthlyCosts}
                onValueChange={(next) =>
                  handleValueChange("otherMonthlyCosts", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("rentBuy.field.rentPath")}
          </legend>
          <div className="mt-3 grid gap-5">
            <CalculatorField
              errorMessage={errors.monthlyRent}
              helperText={t("rentBuy.field.monthlyRent.helper")}
              inputId="monthlyRent"
              label={t("rentBuy.field.monthlyRent.label")}
            >
              <NumericInput
                id="monthlyRent"
                name="monthlyRent"
                min="0"
                step="50"
                value={values.monthlyRent}
                onValueChange={(next) => handleValueChange("monthlyRent", next)}
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        </fieldset>

        <fieldset className="min-w-0">
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("rentBuy.field.assumptions")}
          </legend>
          <div className="mt-3 grid gap-5">
            <CalculatorField
              errorMessage={errors.annualAppreciationRate}
              helperText={t("rentBuy.field.annualAppreciationRate.helper")}
              inputId="annualAppreciationRate"
              label={t("rentBuy.field.annualAppreciationRate.label")}
            >
              <NumericInput
                id="annualAppreciationRate"
                name="annualAppreciationRate"
                min="0"
                step="0.1"
                value={values.annualAppreciationRate}
                onValueChange={(next) =>
                  handleValueChange("annualAppreciationRate", next)
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.renterAnnualReturnRate}
              helperText={t("rentBuy.field.renterAnnualReturnRate.helper")}
              inputId="renterAnnualReturnRate"
              label={t("rentBuy.field.renterAnnualReturnRate.label")}
            >
              <NumericInput
                id="renterAnnualReturnRate"
                name="renterAnnualReturnRate"
                min="0"
                step="0.1"
                value={values.renterAnnualReturnRate}
                onValueChange={(next) =>
                  handleValueChange("renterAnnualReturnRate", next)
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
            {t("rentBuy.button.compare")}
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
            {t("rentBuy.overview.heading")}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <MetricCard
              label={t("rentBuy.metric.loanPrincipal.term")}
              value={formatCurrency(comparison.loanPrincipal)}
            />
            <MetricCard
              label={t("rentBuy.overview.monthlyInstalment")}
              value={formatCurrency(comparison.monthlyInstalment)}
            />
            <MetricCard
              label={t("rentBuy.metric.monthlyOwnershipCosts.term")}
              value={formatCurrency(comparison.monthlyEquivalentOwnershipCosts)}
            />
            <MetricCard
              label={t("rentBuy.metric.buyMonthlyBudget.term")}
              value={formatCurrency(comparison.buyMonthlyBudget)}
            />
            <MetricCard
              label={t("rentBuy.metric.renterMonthlyInvestment.term")}
              value={formatCurrency(comparison.renterMonthlyInvestment)}
            />
            <MetricCard
              label={t("rentBuy.metric.buyerEquity.term")}
              value={formatCurrency(comparison.finalBuyerEquity)}
            />
            <MetricCard
              label={t("rentBuy.metric.renterPortfolioValue.term")}
              value={formatCurrency(comparison.finalRenterPortfolioValue)}
            />
          </div>
          {comparison.renterMonthlyInvestment === 0 ? (
            <p className="text-muted-foreground mt-5 text-sm leading-6">
              {t("rentBuy.verdict.renterInvestsNothing")}
            </p>
          ) : null}
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {t("rentBuy.overview.basis")
              .replace(
                "{rate}",
                formatPercentage(submittedValues.annualFinancingRate),
              )
              .replace(
                "{horizon}",
                String(submittedValues.comparisonHorizonYears),
              )
              .replace(
                "{tenure}",
                String(submittedValues.financingTenureYears),
              )}
          </p>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("rentBuy.verdict.heading")}
          </p>
          <p className="text-(--foreground) mt-4 text-xl font-semibold leading-8">
            {t(verdictLabelKeys[comparison.verdict])}
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {comparison.breakEvenYear !== null
              ? t("rentBuy.verdict.breakEvenYear").replace(
                  "{year}",
                  String(comparison.breakEvenYear),
                )
              : t("rentBuy.verdict.noBreakEven")}
          </p>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                {t("rentBuy.projection.heading")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {t("rentBuy.projection.range").replace(
                  "{n}",
                  String(comparison.yearlyComparison.length),
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
                      {t("rentBuy.table.year")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("rentBuy.table.remainingLoanBalance")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("rentBuy.table.buyerEquity")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("rentBuy.table.renterPortfolioValue")}
                    </th>
                    <th className="pb-2 font-medium">
                      {t("rentBuy.table.leader")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.yearlyComparison.map((row) => (
                    <tr key={row.year} className="bg-card rounded-2xl">
                      <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                        {t("period.year").replace("{n}", String(row.year))}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.remainingLoanBalance)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.buyerEquity)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(row.renterPortfolioValue)}
                      </td>
                      <td className="rounded-r-2xl px-4 py-3 font-semibold">
                        {t(leaderLabelKeys[row.leader])}
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
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) tabular-nums sm:text-lg">
        {value}
      </p>
    </div>
  );
}
