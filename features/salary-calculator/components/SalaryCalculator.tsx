"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { salaryCalculatorFormSchema } from "@/features/salary-calculator/schemas/salary-calculator-form";
import {
  calculateAnnualProjection,
  calculateSalaryBreakdown,
} from "@/features/salary-calculator/services/calculate-salary";
import {
  WORKER_CATEGORIES,
  WORKER_CATEGORY_LABELS,
  type SalaryAnnualProjection,
  type SalaryBreakdownResult,
  type SalaryCalculatorFormValues,
  type SalaryDeductionLine,
  type WorkerCategory,
} from "@/features/salary-calculator/types/salary-calculator";
import { formatCurrency } from "@/utils/format-currency";

type FieldErrorMap = Partial<Record<keyof SalaryCalculatorFormValues, string>>;

const defaultValues: SalaryCalculatorFormValues = {
  grossMonthlySalary: 5000,
  workerCategory: "malaysian",
  foreignWorkerEpfOptIn: false,
  lindung24OptIn: false,
  employeeEpfRate: 11,
  employerEpfRate: 13,
};

const metricDefinitions: ReadonlyArray<{ term: string; definition: string }> = [
  {
    term: "Gross monthly salary",
    definition:
      "Your total monthly base salary before any statutory deductions or contributions.",
  },
  {
    term: "EPF (Employee)",
    definition:
      "Your mandatory contribution to the Employees Provident Fund. The rate is typically 11% of your monthly salary for employees under 60.",
  },
  {
    term: "EPF (Employer)",
    definition:
      "Your employer's mandatory contribution to your EPF account. The rate is typically 12-13% depending on your salary level and age.",
  },
  {
    term: "SOCSO",
    definition:
      "Social Security Organization contributions under the Employment Injury Scheme and Invalidity Scheme. Provides coverage for work-related injuries and invalidity.",
  },
  {
    term: "EIS (SIP)",
    definition:
      "Employment Insurance System (Sistem Insurans Pekerjaan) contributions. Provides employment protection and retrenchment benefits for eligible workers.",
  },
  {
    term: "PCB (MTD)",
    definition:
      "Potongan Cukai Bulanan (Monthly Tax Deduction). Monthly income tax deducted at source based on your chargeable income after EPF relief.",
  },
  {
    term: "Lindung24",
    definition:
      "Optional PERKESO voluntary protection scheme providing 24-hour coverage for accidents and illnesses beyond work-related incidents. Coverage capped at RM6,000 monthly salary.",
  },
  {
    term: "Net take-home salary",
    definition:
      "Your gross salary minus all statutory deductions and optional contributions. This is the amount you actually receive in your bank account.",
  },
  {
    term: "Total employer cost",
    definition:
      "The total amount your employer pays for your employment: gross salary plus all employer statutory contributions (EPF, SOCSO, EIS).",
  },
];


export function SalaryCalculator() {
  const [values, setValues] = useState<SalaryCalculatorFormValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap>({});

  const breakdown = calculateSalaryBreakdown(values);
  const annualProjection: SalaryAnnualProjection = calculateAnnualProjection(breakdown);

  function handleValueChange<K extends keyof SalaryCalculatorFormValues>(
    key: K,
    nextValue: SalaryCalculatorFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleReset() {
    setValues(defaultValues);
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = salaryCalculatorFormSchema.safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof SalaryCalculatorFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid content-start gap-5 self-start rounded-[1.75rem] border border-(--line) bg-white/75 p-6"
      >
        <CalculatorField
          errorMessage={errors.grossMonthlySalary}
          helperText="Your total monthly base salary before any deductions."
          inputId="grossMonthlySalary"
          label="Gross monthly salary (RM)"
        >
          <input
            id="grossMonthlySalary"
            name="grossMonthlySalary"
            type="number"
            min="1"
            step="100"
            value={values.grossMonthlySalary}
            onChange={(event) =>
              handleValueChange("grossMonthlySalary", Number(event.target.value))
            }
            className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.workerCategory}
          helperText="Your residency and employment status in Malaysia."
          inputId="workerCategory"
          label="Worker category"
        >
          <div className="mt-2 grid gap-2">
            {WORKER_CATEGORIES.map((category) => (
              <label
                key={category}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  values.workerCategory === category
                    ? "border-(--accent) bg-(--accent-soft) text-(--accent-strong)"
                    : "border-(--line) bg-(--panel-strong)"
                }`}
              >
                <input
                  type="radio"
                  name="workerCategory"
                  value={category}
                  checked={values.workerCategory === category}
                  onChange={() =>
                    handleValueChange("workerCategory", category as WorkerCategory)
                  }
                  className="sr-only"
                />
                <span className="font-semibold">
                  {WORKER_CATEGORY_LABELS[category]}
                </span>
              </label>
            ))}
          </div>
        </CalculatorField>

        {values.workerCategory === "foreign-worker" ? (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={values.foreignWorkerEpfOptIn}
              onChange={(event) =>
                handleValueChange("foreignWorkerEpfOptIn", event.target.checked)
              }
              className="size-4 accent-(--accent)"
            />
            <span className="font-semibold">Opt in to EPF contributions</span>
          </label>
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={values.lindung24OptIn}
            onChange={(event) =>
              handleValueChange("lindung24OptIn", event.target.checked)
            }
            className="size-4 accent-(--accent)"
          />
          <div>
            <span className="font-semibold">Lindung24 protection</span>
            <p className="text-(--muted) mt-1 text-xs leading-5">
              Optional 24/7 PERKESO protection scheme (premium deducted from net salary).
            </p>
          </div>
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.employeeEpfRate}
            helperText="Override statutory employee EPF rate. Leave blank for statutory rate."
            inputId="employeeEpfRate"
            label="Employee EPF rate (%)"
          >
            <input
              id="employeeEpfRate"
              name="employeeEpfRate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={values.employeeEpfRate ?? ""}
              onChange={(event) =>
                handleValueChange(
                  "employeeEpfRate",
                  event.target.value === "" ? undefined : Number(event.target.value),
                )
              }
              placeholder="Statutory"
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3 placeholder:text-(--muted)"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.employerEpfRate}
            helperText="Override statutory employer EPF rate. Leave blank for statutory rate."
            inputId="employerEpfRate"
            label="Employer EPF rate (%)"
          >
            <input
              id="employerEpfRate"
              name="employerEpfRate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={values.employerEpfRate ?? ""}
              onChange={(event) =>
                handleValueChange(
                  "employerEpfRate",
                  event.target.value === "" ? undefined : Number(event.target.value),
                )
              }
              placeholder="Statutory"
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3 placeholder:text-(--muted)"
            />
          </CalculatorField>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
          >
            Calculate breakdown
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-(--line) bg-white px-5 py-3 text-sm font-semibold text-(--foreground) transition hover:border-(--accent)"
          >
            Reset inputs
          </button>
        </div>
      </form>

      <div className="grid gap-5">
        <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--accent)">
            Employee Breakdown
          </p>
          <p className="mt-2 text-sm leading-6 text-(--muted)">
            Based on a gross monthly salary of{" "}
            <span className="font-semibold text-(--foreground)">
              {formatCurrency(values.grossMonthlySalary)}
            </span>{" "}
            as a{" "}
            <span className="font-semibold text-(--foreground)">
              {WORKER_CATEGORY_LABELS[values.workerCategory].toLowerCase()}
            </span>
            {values.workerCategory === "foreign-worker" && values.foreignWorkerEpfOptIn
              ? " (EPF opted in)"
              : ""}
            {values.lindung24OptIn ? " with Lindung24" : ""}.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Gross monthly salary"
              value={formatCurrency(breakdown.grossMonthlySalary)}
            />
            <MetricCard
              label="Net take-home salary"
              value={formatCurrency(breakdown.netMonthlySalary)}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
              Monthly Deductions
            </p>
            <div className="mt-3 divide-y divide-(--line)">
              {breakdown.employeeDeductions.map((deduction) => (
                <div
                  key={deduction.label}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-(--foreground)">
                    {deduction.label}
                  </span>
                  <span className="tabular-nums text-(--foreground)">
                    -{formatCurrency(deduction.employeeAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--accent)">
            Employer Cost
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label="Gross salary"
              value={formatCurrency(breakdown.grossMonthlySalary)}
            />
            <MetricCard
              label="Total employer cost"
              value={formatCurrency(breakdown.totalEmployerCost)}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
              Employer Contributions
            </p>
            <div className="mt-3 divide-y divide-(--line)">
              {breakdown.employerContributions.map((contribution) => (
                <div
                  key={contribution.label}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-(--foreground)">
                    {contribution.label}
                  </span>
                  <span className="tabular-nums text-(--foreground)">
                    {formatCurrency(contribution.employerAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-(--accent)">
              Annualised Projection
            </summary>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <MetricCard
                label="Annual net take-home"
                value={formatCurrency(annualProjection.netAnnualSalary)}
              />
              <MetricCard
                label="Annual employer cost"
                value={formatCurrency(annualProjection.totalEmployerCost)}
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
                  Annual Deductions
                </p>
                <div className="mt-3 divide-y divide-(--line)">
                  {annualProjection.employeeDeductions.map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium text-(--foreground)">
                        {d.label}
                      </span>
                      <span className="tabular-nums text-(--foreground)">
                        -{formatCurrency(d.employeeAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-(--muted)">
                  Annual Employer Contributions
                </p>
                <div className="mt-3 divide-y divide-(--line)">
                  {annualProjection.employerContributions.map((c) => (
                    <div
                      key={c.label}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium text-(--foreground)">
                        {c.label}
                      </span>
                      <span className="tabular-nums text-(--foreground)">
                        {formatCurrency(c.employerAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </section>

        <p className="text-sm leading-6 text-(--muted)">
          This calculator uses the latest published EPF, SOCSO, EIS, PCB, and
          Lindung24 rate schedules. Results are planning guidance, not official
          payroll advice. Always verify with the latest statutory schedules
          published by KWSP, PERKESO, and LHDN.
        </p>

        <MetricGlossary />
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
  return (
    <div>
      <label
        htmlFor={inputId}
        className="text-sm font-semibold text-(--foreground)"
      >
        {label}
      </label>
      {children}
      <p className="mt-2 text-sm text-(--muted)">{helperText}</p>
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
    <div className="min-w-0 rounded-3xl border border-(--line) bg-(--panel) p-4">
      <p className="text-sm leading-5 text-(--muted)">{label}</p>
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) sm:text-lg [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

function MetricGlossary() {
  return (
    <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-(--accent)">
          What do these numbers mean?
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitions.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-(--foreground)">
                {term}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-(--muted)">
                {definition}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
