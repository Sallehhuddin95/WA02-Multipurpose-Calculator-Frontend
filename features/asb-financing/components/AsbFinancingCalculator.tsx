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
import { createAsbFinancingFormSchema } from "@/features/asb-financing/schemas/asb-financing-form";
import { projectAsbFinancing } from "@/features/asb-financing/services/project-asb-financing";
import {
  ASB_STRATEGY_IDS,
  type AsbFinancingComparisonResult,
  type AsbFinancingFormValues,
  type AsbStrategyId,
} from "@/features/asb-financing/types/asb-financing";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof AsbFinancingFormValues, string>>;

const STORAGE_KEY = "asb-financing:form:v1";

const defaultValues: AsbFinancingFormValues = {
  financingPrincipal: 50000,
  financingTenureYears: 10,
  annualFinancingRate: 5.0,
  annualDividendRate: 5.5,
  annualSideInvestmentReturnRate: 5.5,
  analysisHorizonYears: 10,
};

const formSchema = createAsbFinancingFormSchema(createTranslator("en"));

function validateAsbFinancingForm(
  value: unknown,
): AsbFinancingFormValues | null {
  const parsed = formSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const strategyLabelKeys: Record<AsbStrategyId, MessageKey> = {
  compounding: "asb.strategy.compounding.label",
  "dividend-offset": "asb.strategy.dividendOffset.label",
  "direct-contribution": "asb.strategy.directContribution.label",
};

const strategyDescriptionKeys: Record<AsbStrategyId, MessageKey> = {
  compounding: "asb.strategy.compounding.description",
  "dividend-offset": "asb.strategy.dividendOffset.description",
  "direct-contribution": "asb.strategy.directContribution.description",
};

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "asb.metric.finalAsbValue.term",
    definitionKey: "asb.metric.finalAsbValue.definition",
  },
  {
    termKey: "asb.metric.cumulativeDividends.term",
    definitionKey: "asb.metric.cumulativeDividends.definition",
  },
  {
    termKey: "asb.metric.sideInvestmentValue.term",
    definitionKey: "asb.metric.sideInvestmentValue.definition",
  },
  {
    termKey: "asb.metric.cashPaidByYou.term",
    definitionKey: "asb.metric.cashPaidByYou.definition",
  },
  {
    termKey: "asb.metric.remainingLoanBalance.term",
    definitionKey: "asb.metric.remainingLoanBalance.definition",
  },
  {
    termKey: "asb.metric.surrenderValue.term",
    definitionKey: "asb.metric.surrenderValue.definition",
  },
  {
    termKey: "asb.metric.netPosition.term",
    definitionKey: "asb.metric.netPosition.definition",
  },
];

function getInitialComparison(): AsbFinancingComparisonResult {
  return projectAsbFinancing(defaultValues);
}

export function AsbFinancingCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset, isHydrated }] = usePersistedState(
    STORAGE_KEY,
    defaultValues,
    validateAsbFinancingForm,
  );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [comparison, setComparison] =
    useState<AsbFinancingComparisonResult>(getInitialComparison);

  const recomputedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || recomputedRef.current) {
      return;
    }

    recomputedRef.current = true;
    setComparison(projectAsbFinancing(values));
  }, [isHydrated, values]);

  function handleValueChange<K extends keyof AsbFinancingFormValues>(
    key: K,
    nextValue: AsbFinancingFormValues[K],
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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createAsbFinancingFormSchema(t).safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof AsbFinancingFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setComparison(projectAsbFinancing(parsedValues.data));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid min-w-0 content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-4 sm:p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.financingPrincipal}
            helperText={t("asb.field.financingPrincipal.helper")}
            inputId="financingPrincipal"
            label={t("asb.field.financingPrincipal.label")}
          >
            <NumericInput
              id="financingPrincipal"
              name="financingPrincipal"
              min="0"
              step="1000"
              value={values.financingPrincipal}
              onValueChange={(next) =>
                handleValueChange("financingPrincipal", next)
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.financingTenureYears}
            helperText={t("asb.field.financingTenureYears.helper")}
            inputId="financingTenureYears"
            label={t("asb.field.financingTenureYears.label")}
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
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.annualFinancingRate}
            helperText={t("asb.field.annualFinancingRate.helper")}
            inputId="annualFinancingRate"
            label={t("asb.field.annualFinancingRate.label")}
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
            errorMessage={errors.annualDividendRate}
            helperText={t("asb.field.annualDividendRate.helper")}
            inputId="annualDividendRate"
            label={t("asb.field.annualDividendRate.label")}
          >
            <NumericInput
              id="annualDividendRate"
              name="annualDividendRate"
              min="0"
              step="0.1"
              value={values.annualDividendRate}
              onValueChange={(next) =>
                handleValueChange("annualDividendRate", next)
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.annualSideInvestmentReturnRate}
          helperText={t("asb.field.annualSideInvestmentReturnRate.helper")}
          inputId="annualSideInvestmentReturnRate"
          label={t("asb.field.annualSideInvestmentReturnRate.label")}
        >
          <NumericInput
            id="annualSideInvestmentReturnRate"
            name="annualSideInvestmentReturnRate"
            min="0"
            step="0.1"
            value={values.annualSideInvestmentReturnRate}
            onValueChange={(next) =>
              handleValueChange("annualSideInvestmentReturnRate", next)
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.analysisHorizonYears}
          helperText={t("asb.field.analysisHorizonYears.helper")}
          inputId="analysisHorizonYears"
          label={t("asb.field.analysisHorizonYears.label")}
        >
          <NumericInput
            id="analysisHorizonYears"
            name="analysisHorizonYears"
            min="1"
            step="1"
            value={values.analysisHorizonYears}
            onValueChange={(next) =>
              handleValueChange("analysisHorizonYears", next)
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("asb.button.compare")}
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
            {t("asb.overview.heading")}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label={t("asb.overview.monthlyInstalment")}
              value={formatCurrency(comparison.monthlyInstalment)}
            />
            <MetricCard
              label={t("asb.overview.analysisHorizon")}
              value={t("asb.overview.analysisHorizonValue")
                .replace("{a}", String(values.analysisHorizonYears))
                .replace("{b}", String(values.financingTenureYears))}
            />
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {t("asb.overview.basis")
              .replace("{rate}", formatPercentage(values.annualFinancingRate))
              .replace("{dividend}", formatPercentage(values.annualDividendRate))}
          </p>
        </section>

        <StrategyRankingTable comparison={comparison} />

        {ASB_STRATEGY_IDS.map((strategyId) => {
          const summary = comparison.strategies[strategyId];
          const isLeading = comparison.leadingStrategyId === strategyId;

          return (
            <section
              key={strategyId}
              className="min-w-0 rounded-3xl border border-border bg-card/75 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                    {t(strategyLabelKeys[strategyId])}
                  </p>
                  <p className="text-muted-foreground mt-2 max-w-md text-sm leading-6">
                    {t(strategyDescriptionKeys[strategyId])}
                  </p>
                </div>
                {isLeading ? (
                  <div className="bg-accent text-accent-foreground rounded-2xl px-4 py-3 text-sm font-semibold">
                    {t("asb.leading")}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label={t("asb.metric.finalAsbValue.term")}
                  value={formatCurrency(summary.finalAsbValue)}
                />
                <MetricCard
                  label={t("asb.metric.cumulativeDividends.term")}
                  value={formatCurrency(summary.cumulativeDividends)}
                />
                <MetricCard
                  label={t("asb.metric.sideInvestmentValue.term")}
                  value={formatCurrency(summary.finalSideInvestmentValue)}
                />
                <MetricCard
                  label={t("asb.metric.cashPaidByYou.term")}
                  value={formatCurrency(summary.cumulativeUserCashOutflow)}
                />
                <MetricCard
                  label={t("asb.metric.remainingLoanBalance.term")}
                  value={formatCurrency(summary.remainingLoanBalance)}
                />
                <MetricCard
                  label={t("asb.metric.surrenderValue.term")}
                  value={
                    strategyId === "direct-contribution"
                      ? t("common.notApplicable")
                      : formatCurrency(summary.surrenderValue)
                  }
                />
                <MetricCard
                  label={t("asb.metric.netPosition.term")}
                  value={formatCurrency(summary.netPosition)}
                />
              </div>
            </section>
          );
        })}

        <p className="text-muted-foreground text-sm leading-6">
          {t("asb.disclaimer")}
        </p>

        <MetricGlossary />
      </div>
    </div>
  );
}

interface StrategyRankingTableProps {
  comparison: AsbFinancingComparisonResult;
}

function StrategyRankingTable({
  comparison,
}: Readonly<StrategyRankingTableProps>) {
  const t = useTranslations();
  const rankedStrategies = ASB_STRATEGY_IDS.map((strategyId) => ({
    strategyId,
    netPosition: comparison.strategies[strategyId].netPosition,
  })).sort((a, b) => b.netPosition - a.netPosition);

  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
      <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
        {t("asb.ranking.heading")}
      </p>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {t("asb.ranking.description")}
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-muted-foreground text-xs uppercase tracking-[0.14em]">
              <th className="pb-3 pr-4 font-semibold">{t("asb.ranking.rank")}</th>
              <th className="pb-3 pr-4 font-semibold">
                {t("asb.ranking.strategy")}
              </th>
              <th className="pb-3 font-semibold">
                {t("asb.ranking.finalProfit")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rankedStrategies.map(({ strategyId, netPosition }, index) => {
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
                    {formatCurrency(netPosition)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
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
