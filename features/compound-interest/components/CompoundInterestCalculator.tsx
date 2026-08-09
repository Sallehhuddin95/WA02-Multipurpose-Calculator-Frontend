"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { compoundInterestFormSchema } from "@/features/compound-interest/schemas/compound-interest-form";
import { projectCompoundInterest } from "@/features/compound-interest/services/project-compound-interest";
import type {
  CompoundInterestFormValues,
  CompoundInterestSummary,
} from "@/features/compound-interest/types/compound-interest";
import { formatPeriodLabel } from "@/features/compound-interest/utils/format-period-label";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof CompoundInterestFormValues, string>>;

const defaultValues: CompoundInterestFormValues = {
  startingPrincipal: 10000,
  annualRate: 6,
  durationYears: 10,
  compoundingFrequency: "monthly",
  monthlyContribution: 250,
};

const frequencyOptions = [
  {
    value: "annually",
    label: "Annually",
  },
  {
    value: "quarterly",
    label: "Quarterly",
  },
  {
    value: "monthly",
    label: "Monthly",
  },
] as const;

function getInitialSummary() {
  return projectCompoundInterest(defaultValues);
}

export function CompoundInterestCalculator() {
  const [values, setValues] =
    useState<CompoundInterestFormValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [summary, setSummary] =
    useState<CompoundInterestSummary>(getInitialSummary);
  const [isTableOpen, setIsTableOpen] = useState(true);

  function handleValueChange<K extends keyof CompoundInterestFormValues>(
    key: K,
    nextValue: CompoundInterestFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleReset() {
    setValues(defaultValues);
    setErrors({});
    setSummary(getInitialSummary());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = compoundInterestFormSchema.safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof CompoundInterestFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSummary(projectCompoundInterest(parsedValues.data));
  }

  const lastProjectionPoint = summary.projection.at(-1);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid content-start gap-5 self-start rounded-[1.75rem] border border-(--line) bg-white/75 p-6"
      >
        <CalculatorField
          errorMessage={errors.startingPrincipal}
          helperText="Initial amount invested before any recurring contribution."
          inputId="startingPrincipal"
          label="Starting principal"
        >
          <input
            id="startingPrincipal"
            name="startingPrincipal"
            type="number"
            min="0"
            step="100"
            value={values.startingPrincipal}
            onChange={(event) =>
              handleValueChange("startingPrincipal", Number(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.annualRate}
          helperText="Fixed annual return used across the full duration."
          inputId="annualRate"
          label="Annual rate (%)"
        >
          <input
            id="annualRate"
            name="annualRate"
            type="number"
            min="0"
            step="0.1"
            value={values.annualRate}
            onChange={(event) =>
              handleValueChange("annualRate", Number(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.durationYears}
            helperText="Whole or fractional years are supported in this slice."
            inputId="durationYears"
            label="Duration (years)"
          >
            <input
              id="durationYears"
              name="durationYears"
              type="number"
              min="0"
              step="1"
              value={values.durationYears}
              onChange={(event) =>
                handleValueChange("durationYears", Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.compoundingFrequency}
            helperText="Supported in this slice: annual, quarterly, and monthly."
            inputId="compoundingFrequency"
            label="Compounding frequency"
          >
            <select
              id="compoundingFrequency"
              name="compoundingFrequency"
              value={values.compoundingFrequency}
              onChange={(event) =>
                handleValueChange(
                  "compoundingFrequency",
                  event.target
                    .value as CompoundInterestFormValues["compoundingFrequency"],
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            >
              {frequencyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.monthlyContribution}
          helperText="Optional contribution added at the end of each month."
          inputId="monthlyContribution"
          label="Monthly contribution"
        >
          <input
            id="monthlyContribution"
            name="monthlyContribution"
            type="number"
            min="0"
            step="50"
            value={values.monthlyContribution}
            onChange={(event) =>
              handleValueChange(
                "monthlyContribution",
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
            Calculate growth
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
            Summary
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Projected balance"
              value={formatCurrency(summary.finalProjectedBalance)}
            />
            <MetricCard
              label="Total contributions"
              value={formatCurrency(summary.totalContributions)}
            />
            <MetricCard
              label="Total growth"
              value={formatCurrency(summary.totalGrowth)}
            />
          </div>
          <p className="text-(--muted) mt-5 text-sm leading-6">
            Based on {formatPercentage(values.annualRate)} annual return,{" "}
            {values.compoundingFrequency} compounding, and a{" "}
            {formatCurrency(values.monthlyContribution)} monthly contribution.
          </p>
        </section>

        <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-(--warning) text-sm font-medium uppercase tracking-[0.2em]">
                Latest projection point
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {formatPeriodLabel(
                  lastProjectionPoint?.period ?? 0,
                  values.compoundingFrequency,
                )}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-(--accent-soft) text-(--accent-strong) rounded-2xl px-4 py-3 text-sm">
                Growth share:{" "}
                {summary.finalProjectedBalance === 0
                  ? "0.0%"
                  : formatPercentage(
                      (summary.totalGrowth / summary.finalProjectedBalance) *
                        100,
                    )}
              </div>
              <button
                type="button"
                aria-expanded={isTableOpen}
                aria-label={
                  isTableOpen
                    ? "Hide projection table"
                    : "Show projection table"
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
          </div>
          {isTableOpen ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-(--muted)">
                    <th className="pb-2 pr-4 font-medium">Period</th>
                    <th className="pb-2 pr-4 font-medium">Ending balance</th>
                    <th className="pb-2 pr-4 font-medium">
                      Contributed capital
                    </th>
                    <th className="pb-2 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.projection.map((projectionPoint) => (
                    <tr
                      key={projectionPoint.period}
                      className="bg-(--panel) rounded-2xl"
                    >
                      <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                        {formatPeriodLabel(
                          projectionPoint.period,
                          values.compoundingFrequency,
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(projectionPoint.endingBalance)}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(projectionPoint.totalContributions)}
                      </td>
                      <td className="rounded-r-2xl px-4 py-3">
                        {formatCurrency(projectionPoint.totalGrowth)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </div>
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
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-(--foreground) text-sm font-semibold"
      >
        {label}
      </label>
      {children}
      <p id={helperId} className="text-(--muted) mt-2 text-sm">
        {helperText}
      </p>
      {errorMessage ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-[#9f2f27]">
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
