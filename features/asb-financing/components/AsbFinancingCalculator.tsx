"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { asbFinancingFormSchema } from "@/features/asb-financing/schemas/asb-financing-form";
import { projectAsbFinancing } from "@/features/asb-financing/services/project-asb-financing";
import {
  ASB_STRATEGY_IDS,
  type AsbFinancingComparisonResult,
  type AsbFinancingFormValues,
  type AsbStrategyId,
} from "@/features/asb-financing/types/asb-financing";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof AsbFinancingFormValues, string>>;

const defaultValues: AsbFinancingFormValues = {
  financingPrincipal: 50000,
  financingTenureYears: 10,
  annualFinancingRate: 5.0,
  annualDividendRate: 5.5,
  annualSideInvestmentReturnRate: 5.5,
  analysisHorizonYears: 10,
};

const strategyLabels: Record<AsbStrategyId, string> = {
  compounding: "Compounding strategy",
  "dividend-offset": "Dividend-offset strategy",
  "direct-contribution": "Direct ASB strategy",
};

const strategyDescriptions: Record<AsbStrategyId, string> = {
  compounding:
    "Financed principal stays invested and dividends compound while you pay the full instalment out of pocket.",
  "dividend-offset":
    "Financed principal stays invested. Each month the dividend reserve covers as much of your instalment as it can, carrying forward until depleted, and frees your monthly money into a side investment.",
  "direct-contribution":
    "No financing is used. The same monthly instalment amount is contributed directly into ASB instead.",
};

const metricDefinitions: ReadonlyArray<{ term: string; definition: string }> = [
  {
    term: "Final ASB value",
    definition:
      "Your total ASB unit balance at the end of the analysis horizon, including any dividends reinvested into the account.",
  },
  {
    term: "Cumulative dividends",
    definition:
      "The total dividends generated over the horizon, whether they stayed in ASB or were redirected to pay instalments.",
  },
  {
    term: "Side investment value",
    definition:
      "Money freed up from your monthly budget by the dividend-offset strategy, grown separately outside your ASB account.",
  },
  {
    term: "Cash paid by you",
    definition:
      "The total amount you paid out of your own pocket over the horizon, not counting money from dividends or financing.",
  },
  {
    term: "Remaining loan balance",
    definition:
      "How much you would still owe the bank if you stopped at the end of this horizon.",
  },
  {
    term: "Surrender value",
    definition:
      "The amount of your original financing you would get back from the bank if you ended the facility today, before counting any dividend or side-investment profit.",
  },
  {
    term: "Net position",
    definition:
      "Your total financial position if you ended everything today: surrender value plus dividend or side-investment profit.",
  },
];

function getInitialComparison(): AsbFinancingComparisonResult {
  return projectAsbFinancing(defaultValues);
}

export function AsbFinancingCalculator() {
  const [values, setValues] = useState<AsbFinancingFormValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [comparison, setComparison] =
    useState<AsbFinancingComparisonResult>(getInitialComparison);

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
    setValues(defaultValues);
    setErrors({});
    setComparison(getInitialComparison());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = asbFinancingFormSchema.safeParse(values);

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
        className="grid content-start gap-5 self-start rounded-[1.75rem] border border-(--line) bg-white/75 p-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.financingPrincipal}
            helperText="Amount financed through ASBF at the start of year 1."
            inputId="financingPrincipal"
            label="Financing principal"
          >
            <input
              id="financingPrincipal"
              name="financingPrincipal"
              type="number"
              min="0"
              step="1000"
              value={values.financingPrincipal}
              onChange={(event) =>
                handleValueChange(
                  "financingPrincipal",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.financingTenureYears}
            helperText="Whole number of years."
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
            errorMessage={errors.annualDividendRate}
            helperText="Fixed annual ASB dividend assumption for the full horizon."
            inputId="annualDividendRate"
            label="Annual ASB dividend rate (%)"
          >
            <input
              id="annualDividendRate"
              name="annualDividendRate"
              type="number"
              min="0"
              step="0.1"
              value={values.annualDividendRate}
              onChange={(event) =>
                handleValueChange(
                  "annualDividendRate",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.annualSideInvestmentReturnRate}
          helperText="Fixed annual return assumed for cash the dividend-offset strategy frees up."
          inputId="annualSideInvestmentReturnRate"
          label="Annual side-investment return rate (%)"
        >
          <input
            id="annualSideInvestmentReturnRate"
            name="annualSideInvestmentReturnRate"
            type="number"
            min="0"
            step="0.1"
            value={values.annualSideInvestmentReturnRate}
            onChange={(event) =>
              handleValueChange(
                "annualSideInvestmentReturnRate",
                Number(event.target.value),
              )
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.analysisHorizonYears}
          helperText="Cannot exceed the financing tenure."
          inputId="analysisHorizonYears"
          label="Analysis horizon (years)"
        >
          <input
            id="analysisHorizonYears"
            name="analysisHorizonYears"
            type="number"
            min="1"
            step="1"
            value={values.analysisHorizonYears}
            onChange={(event) =>
              handleValueChange(
                "analysisHorizonYears",
                Number(event.target.value),
              )
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="bg-(--accent) hover:bg-(--accent-strong) rounded-full px-5 py-3 text-sm font-semibold text-white transition"
          >
            Compare strategies
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

      <div className="grid gap-5">
        <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
            Financing Overview
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Scheduled monthly instalment"
              value={formatCurrency(comparison.monthlyInstalment)}
            />
            <MetricCard
              label="Analysis horizon"
              value={`${values.analysisHorizonYears} of ${values.financingTenureYears} years`}
            />
          </div>
          <p className="text-(--muted) mt-5 text-sm leading-6">
            Based on a reducing-balance amortized loan at{" "}
            {formatPercentage(values.annualFinancingRate)} and a fixed{" "}
            {formatPercentage(values.annualDividendRate)} annual dividend
            assumption for every strategy.
          </p>
        </section>

        <StrategyRankingTable comparison={comparison} />

        {ASB_STRATEGY_IDS.map((strategyId) => {
          const summary = comparison.strategies[strategyId];
          const isLeading = comparison.leadingStrategyId === strategyId;

          return (
            <section
              key={strategyId}
              className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
                    {strategyLabels[strategyId]}
                  </p>
                  <p className="text-(--muted) mt-2 max-w-md text-sm leading-6">
                    {strategyDescriptions[strategyId]}
                  </p>
                </div>
                {isLeading ? (
                  <div className="bg-(--accent-soft) text-(--accent-strong) rounded-2xl px-4 py-3 text-sm font-semibold">
                    Leading for this horizon
                  </div>
                ) : null}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label="Final ASB value"
                  value={formatCurrency(summary.finalAsbValue)}
                />
                <MetricCard
                  label="Cumulative dividends"
                  value={formatCurrency(summary.cumulativeDividends)}
                />
                <MetricCard
                  label="Side investment value"
                  value={formatCurrency(summary.finalSideInvestmentValue)}
                />
                <MetricCard
                  label="Cash paid by you"
                  value={formatCurrency(summary.cumulativeUserCashOutflow)}
                />
                <MetricCard
                  label="Remaining loan balance"
                  value={formatCurrency(summary.remainingLoanBalance)}
                />
                <MetricCard
                  label="Surrender value"
                  value={
                    strategyId === "direct-contribution"
                      ? "Not applicable"
                      : formatCurrency(summary.surrenderValue)
                  }
                />
                <MetricCard
                  label="Net position"
                  value={formatCurrency(summary.netPosition)}
                />
              </div>
            </section>
          );
        })}

        <p className="text-(--muted) text-sm leading-6">
          This comparison applies the documented reducing-balance financing
          model and annual dividend-crediting assumption from the spec. It is
          planning guidance, not a bank-issued ASBF quote.
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
  const rankedStrategies = ASB_STRATEGY_IDS.map((strategyId) => ({
    strategyId,
    netPosition: comparison.strategies[strategyId].netPosition,
  })).sort((a, b) => b.netPosition - a.netPosition);

  return (
    <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
      <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.2em]">
        Strategy Ranking
      </p>
      <p className="text-(--muted) mt-2 text-sm leading-6">
        Strategies ranked by final profit (net position) for this horizon.
      </p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-(--muted) text-xs uppercase tracking-[0.14em]">
              <th className="pb-3 pr-4 font-semibold">Rank</th>
              <th className="pb-3 pr-4 font-semibold">Strategy</th>
              <th className="pb-3 font-semibold">Final profit</th>
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
  return (
    <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
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
