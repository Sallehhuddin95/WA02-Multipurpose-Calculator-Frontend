"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { salaryCalculatorFormSchema } from "@/features/salary-calculator/schemas/salary-calculator-form";
import { salaryProjectionFormSchema } from "@/features/salary-calculator/schemas/salary-projection-form";
import {
  calculateAnnualProjection,
  calculateSalaryBreakdown,
} from "@/features/salary-calculator/services/calculate-salary";
import { projectSalary } from "@/features/salary-calculator/services/project-salary";
import {
  ONE_OFF_INCREMENT_TYPES,
  SALARY_INCREMENT_MODES,
  WORKER_CATEGORIES,
  WORKER_CATEGORY_LABELS,
  type OneOffIncrement,
  type OneOffIncrementType,
  type SalaryAnnualProjection,
  type SalaryCalculatorFormValues,
  type SalaryIncrementMode,
  type SalaryProjectionFormValues,
  type SalaryProjectionResult,
  type WorkerCategory,
} from "@/features/salary-calculator/types/salary-calculator";
import { formatCurrency } from "@/utils/format-currency";

type FieldErrorMap = Partial<Record<keyof SalaryCalculatorFormValues, string>>;

type ProjectionScalarField =
  | "projectionYears"
  | "incrementMode"
  | "annualIncrementRate"
  | "fixedAnnualIncrement";

type OneOffErrorMap = Partial<Record<"year" | "type" | "value", string>>;

type ProjectionErrorMap = Partial<Record<ProjectionScalarField, string>> & {
  oneOffIncrements?: Record<number, OneOffErrorMap>;
};

const INCREMENT_MODE_LABELS: Record<SalaryIncrementMode, string> = {
  percentage: "Percentage",
  "fixed-amount": "Fixed amount",
  none: "None",
};

const ONE_OFF_TYPE_LABELS: Record<OneOffIncrementType, string> = {
  amount: "Amount (RM)",
  percentage: "Percentage (%)",
};

const defaultValues: SalaryCalculatorFormValues = {
  grossMonthlySalary: 5000,
  workerCategory: "malaysian",
  foreignWorkerEpfOptIn: false,
  lindung24OptIn: false,
  employeeEpfRate: 11,
  employerEpfRate: 13,
};

const defaultProjectionValues: SalaryProjectionFormValues = {
  projectionYears: 10,
  incrementMode: "none",
  annualIncrementRate: 3,
  fixedAnnualIncrement: 200,
  oneOffIncrements: [],
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
  const [projectionValues, setProjectionValues] =
    useState<SalaryProjectionFormValues>(defaultProjectionValues);
  const [projectionErrors, setProjectionErrors] = useState<ProjectionErrorMap>({});
  const [projectionResult, setProjectionResult] =
    useState<SalaryProjectionResult | null>(null);

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

  function handleProjectionChange<K extends keyof SalaryProjectionFormValues>(
    key: K,
    nextValue: SalaryProjectionFormValues[K],
  ) {
    setProjectionValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleOneOffChange(
    index: number,
    key: keyof OneOffIncrement,
    nextValue: OneOffIncrement[keyof OneOffIncrement],
  ) {
    setProjectionValues((currentValues) => ({
      ...currentValues,
      oneOffIncrements: currentValues.oneOffIncrements.map((oneOff, i) =>
        i === index ? { ...oneOff, [key]: nextValue } : oneOff,
      ),
    }));
  }

  function handleAddOneOff() {
    setProjectionValues((currentValues) => ({
      ...currentValues,
      oneOffIncrements: [
        ...currentValues.oneOffIncrements,
        { year: 1, type: "amount", value: 1000 },
      ],
    }));
  }

  function handleRemoveOneOff(index: number) {
    setProjectionValues((currentValues) => ({
      ...currentValues,
      oneOffIncrements: currentValues.oneOffIncrements.filter(
        (_, i) => i !== index,
      ),
    }));
  }

  function handleProjectionReset() {
    setProjectionValues(defaultProjectionValues);
    setProjectionErrors({});
    setProjectionResult(null);
  }

  function handleProjectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = salaryProjectionFormSchema.safeParse(projectionValues);

    if (!parsedValues.success) {
      const nextErrors: ProjectionErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const path = issue.path;

        if (path[0] === "oneOffIncrements" && typeof path[1] === "number") {
          const index = path[1];
          const field = path[2];

          if (field === "year" || field === "type" || field === "value") {
            if (!nextErrors.oneOffIncrements) {
              nextErrors.oneOffIncrements = {};
            }

            const rowErrors = nextErrors.oneOffIncrements[index] ?? {};
            rowErrors[field] = issue.message;
            nextErrors.oneOffIncrements[index] = rowErrors;
          }

          return;
        }

        const fieldName = path[0] as ProjectionScalarField | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setProjectionErrors(nextErrors);
      setProjectionResult(null);
      return;
    }

    setProjectionErrors({});
    setProjectionResult(projectSalary(values, parsedValues.data));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-6"
      >
        <CalculatorField
          errorMessage={errors.grossMonthlySalary}
          helperText="Your total monthly base salary before any deductions."
          inputId="grossMonthlySalary"
          label="Gross monthly salary (RM)"
        >
          <Input
            id="grossMonthlySalary"
            name="grossMonthlySalary"
            type="number"
            min="1"
            step="100"
            value={values.grossMonthlySalary}
            onChange={(event) =>
              handleValueChange("grossMonthlySalary", Number(event.target.value))
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
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
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background ${
                  values.workerCategory === category
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border bg-card"
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
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background">
            <input
              type="checkbox"
              checked={values.foreignWorkerEpfOptIn}
              onChange={(event) =>
                handleValueChange("foreignWorkerEpfOptIn", event.target.checked)
              }
              className="size-4 accent-primary"
            />
            <span className="font-semibold">Opt in to EPF contributions</span>
          </label>
        ) : null}

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background">
          <input
            type="checkbox"
            checked={values.lindung24OptIn}
            onChange={(event) =>
              handleValueChange("lindung24OptIn", event.target.checked)
            }
            className="size-4 accent-primary"
          />
          <div>
            <span className="font-semibold">Lindung24 protection</span>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
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
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.employerEpfRate}
            helperText="Override statutory employer EPF rate. Leave blank for statutory rate."
            inputId="employerEpfRate"
            label="Employer EPF rate (%)"
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            Calculate breakdown
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
          >
            Reset inputs
          </Button>
        </div>
      </form>

      <div className="grid gap-5">
        <section className="rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Employee Breakdown
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Monthly Deductions
            </p>
            <div className="mt-3 divide-y divide-border">
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

        <section className="rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Employer Contributions
            </p>
            <div className="mt-3 divide-y divide-border">
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

        <section className="rounded-3xl border border-border bg-card/75 p-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
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
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Annual Deductions
                </p>
                <div className="mt-3 divide-y divide-border">
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
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Annual Employer Contributions
                </p>
                <div className="mt-3 divide-y divide-border">
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

        <p className="text-sm leading-6 text-muted-foreground">
          This calculator uses the latest published EPF, SOCSO, EIS, PCB, and
          Lindung24 rate schedules. Results are planning guidance, not official
          payroll advice. Always verify with the latest statutory schedules
          published by KWSP, PERKESO, and LHDN.
        </p>

        <MetricGlossary />
      </div>

      <section className="lg:col-span-2 overflow-hidden rounded-3xl border border-border bg-card/75 divide-y divide-border">
        <form
          noValidate
          onSubmit={handleProjectionSubmit}
          className="grid gap-4 p-6"
        >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Salary Projection
        </p>

        <CalculatorField
          errorMessage={projectionErrors.projectionYears}
          helperText="How many years to project ahead, between 1 and 40."
          inputId="projectionYears"
          label="Projection years"
        >
          <Input
            id="projectionYears"
            name="projectionYears"
            type="number"
            min="1"
            max="40"
            step="1"
            value={projectionValues.projectionYears}
            onChange={(event) =>
              handleProjectionChange("projectionYears", Number(event.target.value))
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div>
          <p className="font-semibold text-(--foreground)">Increment mode</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {SALARY_INCREMENT_MODES.map((mode) => (
              <ModeButton
                key={mode}
                isActive={projectionValues.incrementMode === mode}
                label={INCREMENT_MODE_LABELS[mode]}
                onClick={() => handleProjectionChange("incrementMode", mode)}
              />
            ))}
          </div>
          {projectionErrors.incrementMode ? (
            <p className="mt-1 text-sm font-medium text-destructive">
              {projectionErrors.incrementMode}
            </p>
          ) : null}
        </div>

        {projectionValues.incrementMode === "percentage" ? (
          <CalculatorField
            errorMessage={projectionErrors.annualIncrementRate}
            helperText="Year-over-year salary growth applied from year 2 onward."
            inputId="annualIncrementRate"
            label="Annual increment rate (%)"
          >
            <Input
              id="annualIncrementRate"
              name="annualIncrementRate"
              type="number"
              min="0"
              step="0.1"
              value={projectionValues.annualIncrementRate}
              onChange={(event) =>
                handleProjectionChange(
                  "annualIncrementRate",
                  Number(event.target.value),
                )
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : null}

        {projectionValues.incrementMode === "fixed-amount" ? (
          <CalculatorField
            errorMessage={projectionErrors.fixedAnnualIncrement}
            helperText="Fixed ringgit amount added once per year from year 2 onward."
            inputId="fixedAnnualIncrement"
            label="Fixed annual increment (RM)"
          >
            <Input
              id="fixedAnnualIncrement"
              name="fixedAnnualIncrement"
              type="number"
              min="0"
              step="100"
              value={projectionValues.fixedAnnualIncrement}
              onChange={(event) =>
                handleProjectionChange(
                  "fixedAnnualIncrement",
                  Number(event.target.value),
                )
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : null}

        <div>
          <p className="font-semibold text-(--foreground)">One-off increments</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional salary bumps anchored to a specific career year.
          </p>

          {projectionValues.oneOffIncrements.length > 0 ? (
            <div className="mt-3 grid gap-3">
              {projectionValues.oneOffIncrements.map((oneOff, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
                >
                  <div>
                    <Label
                      htmlFor={`oneOff-${index}-year`}
                      className="font-semibold text-(--foreground)"
                    >
                      Year
                    </Label>
                    <Input
                      id={`oneOff-${index}-year`}
                      name={`oneOff-${index}-year`}
                      type="number"
                      min="1"
                      step="1"
                      value={oneOff.year}
                      onChange={(event) =>
                        handleOneOffChange(index, "year", Number(event.target.value))
                      }
                      className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                    />
                    {projectionErrors.oneOffIncrements?.[index]?.year ? (
                      <p className="mt-1 text-sm font-medium text-destructive">
                        {projectionErrors.oneOffIncrements[index].year}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <Label
                      htmlFor={`oneOff-${index}-type`}
                      className="font-semibold text-(--foreground)"
                    >
                      Type
                    </Label>
                    <select
                      id={`oneOff-${index}-type`}
                      name={`oneOff-${index}-type`}
                      value={oneOff.type}
                      onChange={(event) =>
                        handleOneOffChange(
                          index,
                          "type",
                          event.target.value as OneOffIncrementType,
                        )
                      }
                      className="mt-2 h-auto w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-none md:text-base"
                    >
                      {ONE_OFF_INCREMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {ONE_OFF_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    {projectionErrors.oneOffIncrements?.[index]?.type ? (
                      <p className="mt-1 text-sm font-medium text-destructive">
                        {projectionErrors.oneOffIncrements[index].type}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <Label
                      htmlFor={`oneOff-${index}-value`}
                      className="font-semibold text-(--foreground)"
                    >
                      Value
                    </Label>
                    <Input
                      id={`oneOff-${index}-value`}
                      name={`oneOff-${index}-value`}
                      type="number"
                      min="0"
                      step="100"
                      value={oneOff.value}
                      onChange={(event) =>
                        handleOneOffChange(index, "value", Number(event.target.value))
                      }
                      className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
                    />
                    {projectionErrors.oneOffIncrements?.[index]?.value ? (
                      <p className="mt-1 text-sm font-medium text-destructive">
                        {projectionErrors.oneOffIncrements[index].value}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleRemoveOneOff(index)}
                    aria-label={`Remove one-off increment ${index + 1}`}
                    className="h-auto rounded-full border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddOneOff}
            className="mt-3 h-auto rounded-full border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
          >
            Add one-off increment
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            Calculate projection
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleProjectionReset}
            className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
          >
            Reset projection
          </Button>
        </div>
        </form>

        {projectionResult ? (
          <>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Final-year gross monthly salary"
                  value={formatCurrency(projectionResult.finalGrossMonthlySalary)}
                />
                <MetricCard
                  label="Final-year net monthly salary"
                  value={formatCurrency(projectionResult.finalNetMonthlySalary)}
                />
                <MetricCard
                  label="Cumulative net salary"
                  value={formatCurrency(projectionResult.cumulativeNetSalary)}
                />
                <MetricCard
                  label="Cumulative employer cost"
                  value={formatCurrency(projectionResult.cumulativeEmployerCost)}
                />
              </div>
            </div>

            <div className="p-6">
              <details>
                <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  Yearly Salary Projection
                </summary>
                <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Year</th>
                      <th className="pb-2 pr-4 font-medium">
                        Gross monthly salary
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        Net monthly salary
                      </th>
                      <th className="pb-2 font-medium">Total employer cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionResult.yearlyProjection.map((row) => (
                      <tr key={row.year} className="rounded-2xl bg-card">
                        <td className="rounded-l-2xl whitespace-nowrap px-4 py-3">
                          {row.year}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.grossMonthlySalary)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.netMonthlySalary)}
                        </td>
                        <td className="rounded-r-2xl px-4 py-3">
                          {formatCurrency(row.totalEmployerCost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </details>
            </div>
          </>
        ) : null}
      </section>
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
    <div className="min-w-0 rounded-3xl border border-border bg-card p-4">
      <p className="text-sm leading-5 text-muted-foreground">{label}</p>
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) sm:text-lg [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}

function MetricGlossary() {
  return (
    <section className="rounded-3xl border border-border bg-card/75 p-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
          What do these numbers mean?
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitions.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-(--foreground)">
                {term}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                {definition}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

interface ModeButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ModeButton({ isActive, label, onClick }: Readonly<ModeButtonProps>) {
  return (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      onClick={onClick}
      className={[
        "h-auto rounded-full px-4 py-2 text-sm font-medium shadow-none",
        isActive
          ? ""
          : "border-border bg-card/60 text-(--foreground) hover:border-primary hover:bg-card/60 hover:text-(--foreground)",
      ].join(" ")}
    >
      {label}
    </Button>
  );
}
