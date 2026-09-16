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
import { NumericInput } from "@/components/NumericInput";
import { SegmentedControl } from "@/components/SegmentedControl";
import { createSalaryCalculatorFormSchema } from "@/features/salary-calculator/schemas/salary-calculator-form";
import { createSalaryProjectionFormSchema } from "@/features/salary-calculator/schemas/salary-projection-form";
import {
  calculateAnnualProjection,
  calculateSalaryBreakdown,
} from "@/features/salary-calculator/services/calculate-salary";
import { projectSalary } from "@/features/salary-calculator/services/project-salary";
import {
  ONE_OFF_INCREMENT_TYPES,
  SALARY_INCREMENT_MODES,
  WORKER_CATEGORIES,
  type OneOffIncrement,
  type OneOffIncrementType,
  type SalaryAnnualProjection,
  type SalaryCalculatorFormValues,
  type SalaryIncrementMode,
  type SalaryProjectionFormValues,
  type SalaryProjectionResult,
  type WorkerCategory,
} from "@/features/salary-calculator/types/salary-calculator";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
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

const workerCategoryLabelKeys: Record<WorkerCategory, MessageKey> = {
  malaysian: "salary.category.malaysian",
  "permanent-resident": "salary.category.permanentResident",
  "foreign-worker": "salary.category.foreignWorker",
};

const incrementModeLabelKeys: Record<SalaryIncrementMode, MessageKey> = {
  percentage: "salary.mode.percentage",
  "fixed-amount": "salary.mode.fixedAmount",
  none: "salary.mode.none",
};

const oneOffTypeLabelKeys: Record<OneOffIncrementType, MessageKey> = {
  amount: "salary.oneOffType.amount",
  percentage: "salary.oneOffType.percentage",
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

const BREAKDOWN_STORAGE_KEY = "salary-calculator:breakdown:form:v1";
const PROJECTION_STORAGE_KEY = "salary-calculator:projection:form:v1";

interface SalaryProjectionPersistedState {
  values: SalaryProjectionFormValues;
  computed: boolean;
}

const defaultProjectionPersistedState: SalaryProjectionPersistedState = {
  values: defaultProjectionValues,
  computed: false,
};

const salaryCalculatorFormSchema = createSalaryCalculatorFormSchema(
  createTranslator("en"),
);
const salaryProjectionFormSchema = createSalaryProjectionFormSchema(
  createTranslator("en"),
);

function validateSalaryCalculatorForm(
  value: unknown,
): SalaryCalculatorFormValues | null {
  const parsed = salaryCalculatorFormSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function validateSalaryProjectionPersisted(
  value: unknown,
): SalaryProjectionPersistedState | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = value as { values?: unknown; computed?: unknown };

  if (typeof raw.computed !== "boolean") {
    return null;
  }

  const parsed = salaryProjectionFormSchema.safeParse(raw.values);
  if (!parsed.success) {
    return null;
  }

  return { values: parsed.data, computed: raw.computed };
}

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "salary.metric.grossMonthlySalary.term",
    definitionKey: "salary.metric.grossMonthlySalary.definition",
  },
  {
    termKey: "salary.metric.epfEmployee.term",
    definitionKey: "salary.metric.epfEmployee.definition",
  },
  {
    termKey: "salary.metric.epfEmployer.term",
    definitionKey: "salary.metric.epfEmployer.definition",
  },
  {
    termKey: "salary.metric.socso.term",
    definitionKey: "salary.metric.socso.definition",
  },
  {
    termKey: "salary.metric.eis.term",
    definitionKey: "salary.metric.eis.definition",
  },
  {
    termKey: "salary.metric.pcb.term",
    definitionKey: "salary.metric.pcb.definition",
  },
  {
    termKey: "salary.metric.lindung24.term",
    definitionKey: "salary.metric.lindung24.definition",
  },
  {
    termKey: "salary.metric.netTakeHome.term",
    definitionKey: "salary.metric.netTakeHome.definition",
  },
  {
    termKey: "salary.metric.totalEmployerCost.term",
    definitionKey: "salary.metric.totalEmployerCost.definition",
  },
];


export function SalaryCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset: resetMain, isHydrated: isMainHydrated }] =
    usePersistedState(
      BREAKDOWN_STORAGE_KEY,
      defaultValues,
      validateSalaryCalculatorForm,
    );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [
    projectionState,
    setProjectionState,
    { reset: resetProjection, isHydrated: isProjectionHydrated },
  ] = usePersistedState(
    PROJECTION_STORAGE_KEY,
    defaultProjectionPersistedState,
    validateSalaryProjectionPersisted,
  );
  const [projectionErrors, setProjectionErrors] = useState<ProjectionErrorMap>({});
  const [projectionResult, setProjectionResult] =
    useState<SalaryProjectionResult | null>(null);

  const projectionValues = projectionState.values;
  const projectionComputed = projectionState.computed;

  const breakdown = calculateSalaryBreakdown(values);
  const annualProjection: SalaryAnnualProjection = calculateAnnualProjection(breakdown);

  const epfApplies =
    values.workerCategory !== "foreign-worker" ||
    values.foreignWorkerEpfOptIn;

  const recomputedProjectionRef = useRef(false);

  useEffect(() => {
    if (
      !isMainHydrated ||
      !isProjectionHydrated ||
      recomputedProjectionRef.current
    ) {
      return;
    }

    recomputedProjectionRef.current = true;

    if (projectionComputed) {
      setProjectionResult(projectSalary(values, projectionValues));
    }
  }, [
    isMainHydrated,
    isProjectionHydrated,
    projectionComputed,
    values,
    projectionValues,
  ]);

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
    resetMain();
    setErrors({});
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createSalaryCalculatorFormSchema(t).safeParse(values);

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
    setProjectionState((currentState) => ({
      ...currentState,
      values: { ...currentState.values, [key]: nextValue },
    }));
  }

  function handleOneOffChange(
    index: number,
    key: keyof OneOffIncrement,
    nextValue: OneOffIncrement[keyof OneOffIncrement],
  ) {
    setProjectionState((currentState) => ({
      ...currentState,
      values: {
        ...currentState.values,
        oneOffIncrements: currentState.values.oneOffIncrements.map(
          (oneOff, i) => (i === index ? { ...oneOff, [key]: nextValue } : oneOff),
        ),
      },
    }));
  }

  function handleAddOneOff() {
    setProjectionState((currentState) => ({
      ...currentState,
      values: {
        ...currentState.values,
        oneOffIncrements: [
          ...currentState.values.oneOffIncrements,
          { year: 1, type: "amount", value: 1000 },
        ],
      },
    }));
  }

  function handleRemoveOneOff(index: number) {
    setProjectionState((currentState) => ({
      ...currentState,
      values: {
        ...currentState.values,
        oneOffIncrements: currentState.values.oneOffIncrements.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  }

  function handleProjectionReset() {
    resetProjection();
    setProjectionErrors({});
    setProjectionResult(null);
  }

  function handleProjectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createSalaryProjectionFormSchema(t).safeParse(
      projectionValues,
    );

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
      setProjectionState((currentState) => ({
        ...currentState,
        computed: false,
      }));
      return;
    }

    setProjectionErrors({});
    setProjectionResult(projectSalary(values, parsedValues.data));
    setProjectionState((currentState) => ({
      ...currentState,
      computed: true,
    }));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid min-w-0 content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-4 sm:p-6"
      >
        <CalculatorField
          errorMessage={errors.grossMonthlySalary}
          helperText={t("salary.field.grossMonthlySalary.helper")}
          inputId="grossMonthlySalary"
          label={t("salary.field.grossMonthlySalary.label")}
        >
          <NumericInput
            id="grossMonthlySalary"
            name="grossMonthlySalary"
            min="1"
            step="100"
            value={values.grossMonthlySalary}
            onValueChange={(next) => handleValueChange("grossMonthlySalary", next)}
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.workerCategory}
          helperText={t("salary.field.workerCategory.helper")}
          inputId="workerCategory"
          label={t("salary.field.workerCategory.label")}
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
                  {t(workerCategoryLabelKeys[category])}
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
            <span className="font-semibold">{t("salary.epfOptIn")}</span>
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
            <span className="font-semibold">{t("salary.lindung24.label")}</span>
            <p className="text-muted-foreground mt-1 text-xs leading-5">
              {t("salary.lindung24.helper")}
            </p>
          </div>
        </label>

        {epfApplies ? (
          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.employeeEpfRate}
              helperText={t("salary.field.employeeEpfRate.helper")}
              inputId="employeeEpfRate"
              label={t("salary.field.employeeEpfRate.label")}
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
                placeholder={t("salary.placeholder.statutory")}
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.employerEpfRate}
              helperText={t("salary.field.employerEpfRate.helper")}
              inputId="employerEpfRate"
              label={t("salary.field.employerEpfRate.label")}
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
                placeholder={t("salary.placeholder.statutory")}
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("salary.button.calculateBreakdown")}
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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {t("salary.breakdown.heading")}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("salary.breakdown.basisPrefix")}{" "}
            <span className="font-semibold text-(--foreground)">
              {formatCurrency(values.grossMonthlySalary)}
            </span>{" "}
            {t("salary.breakdown.basisAs")}{" "}
            <span className="font-semibold text-(--foreground)">
              {t(workerCategoryLabelKeys[values.workerCategory]).toLowerCase()}
            </span>
            {values.workerCategory === "foreign-worker" && values.foreignWorkerEpfOptIn
              ? t("salary.breakdown.epfOptedIn")
              : ""}
            {values.lindung24OptIn ? t("salary.breakdown.withLindung24") : ""}.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label={t("salary.metric.grossMonthlySalary.term")}
              value={formatCurrency(breakdown.grossMonthlySalary)}
            />
            <MetricCard
              label={t("salary.metric.netTakeHome.term")}
              value={formatCurrency(breakdown.netMonthlySalary)}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("salary.breakdown.monthlyDeductions")}
            </p>
            <div className="mt-3 divide-y divide-border">
              {breakdown.employeeDeductions.map((deduction) => (
                <div
                  key={deduction.labelKey}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-(--foreground)">
                    {t(deduction.labelKey)}
                  </span>
                  <span className="tabular-nums text-(--foreground)">
                    -{formatCurrency(deduction.employeeAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {t("salary.employerCost.heading")}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <MetricCard
              label={t("salary.employerCost.grossSalary")}
              value={formatCurrency(breakdown.grossMonthlySalary)}
            />
            <MetricCard
              label={t("salary.metric.totalEmployerCost.term")}
              value={formatCurrency(breakdown.totalEmployerCost)}
            />
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t("salary.employerCost.contributions")}
            </p>
            <div className="mt-3 divide-y divide-border">
              {breakdown.employerContributions.map((contribution) => (
                <div
                  key={contribution.labelKey}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium text-(--foreground)">
                    {t(contribution.labelKey)}
                  </span>
                  <span className="tabular-nums text-(--foreground)">
                    {formatCurrency(contribution.employerAmount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
          <details>
            <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
              {t("salary.annualised.heading")}
            </summary>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <MetricCard
                label={t("salary.annualised.netTakeHome")}
                value={formatCurrency(annualProjection.netAnnualSalary)}
              />
              <MetricCard
                label={t("salary.annualised.employerCost")}
                value={formatCurrency(annualProjection.totalEmployerCost)}
              />
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t("salary.annualised.deductions")}
                </p>
                <div className="mt-3 divide-y divide-border">
                  {annualProjection.employeeDeductions.map((d) => (
                    <div
                      key={d.labelKey}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium text-(--foreground)">
                        {t(d.labelKey)}
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
                  {t("salary.annualised.employerContributions")}
                </p>
                <div className="mt-3 divide-y divide-border">
                  {annualProjection.employerContributions.map((c) => (
                    <div
                      key={c.labelKey}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium text-(--foreground)">
                        {t(c.labelKey)}
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
          {t("salary.disclaimer")}
        </p>

        <MetricGlossary />
      </div>

      <section className="lg:col-span-2 min-w-0 overflow-hidden rounded-3xl border border-border bg-card/75 divide-y divide-border">
        <form
          noValidate
          onSubmit={handleProjectionSubmit}
          className="grid min-w-0 gap-4 p-4 sm:p-6"
        >
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          {t("salary.projection.heading")}
        </p>

        <CalculatorField
          errorMessage={projectionErrors.projectionYears}
          helperText={t("salary.projection.years.helper")}
          inputId="projectionYears"
          label={t("salary.projection.years.label")}
        >
          <NumericInput
            id="projectionYears"
            name="projectionYears"
            min="1"
            max="40"
            step="1"
            value={projectionValues.projectionYears}
            onValueChange={(next) =>
              handleProjectionChange("projectionYears", next)
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div>
          <SegmentedControl
            label={t("salary.projection.incrementMode")}
            onValueChange={(next) =>
              handleProjectionChange(
                "incrementMode",
                next as typeof projectionValues.incrementMode,
              )
            }
            options={SALARY_INCREMENT_MODES.map((mode) => ({
              label: t(incrementModeLabelKeys[mode]),
              value: mode,
            }))}
            value={projectionValues.incrementMode}
          />
          {projectionErrors.incrementMode ? (
            <p className="mt-1 text-sm font-medium text-destructive">
              {projectionErrors.incrementMode}
            </p>
          ) : null}
        </div>

        {projectionValues.incrementMode === "percentage" ? (
          <CalculatorField
            errorMessage={projectionErrors.annualIncrementRate}
            helperText={t("salary.projection.annualIncrementRate.helper")}
            inputId="annualIncrementRate"
            label={t("salary.projection.annualIncrementRate.label")}
          >
            <NumericInput
              id="annualIncrementRate"
              name="annualIncrementRate"
              min="0"
              step="0.1"
              value={projectionValues.annualIncrementRate}
              onValueChange={(next) =>
                handleProjectionChange("annualIncrementRate", next)
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : null}

        {projectionValues.incrementMode === "fixed-amount" ? (
          <CalculatorField
            errorMessage={projectionErrors.fixedAnnualIncrement}
            helperText={t("salary.projection.fixedAnnualIncrement.helper")}
            inputId="fixedAnnualIncrement"
            label={t("salary.projection.fixedAnnualIncrement.label")}
          >
            <NumericInput
              id="fixedAnnualIncrement"
              name="fixedAnnualIncrement"
              min="0"
              step="100"
              value={projectionValues.fixedAnnualIncrement}
              onValueChange={(next) =>
                handleProjectionChange("fixedAnnualIncrement", next)
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : null}

        <div>
          <p className="font-semibold text-(--foreground)">
            {t("salary.projection.oneOff")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("salary.projection.oneOffHelper")}
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
                      {t("salary.projection.year")}
                    </Label>
                    <NumericInput
                      id={`oneOff-${index}-year`}
                      name={`oneOff-${index}-year`}
                      min="1"
                      step="1"
                      value={oneOff.year}
                      onValueChange={(next) =>
                        handleOneOffChange(index, "year", next)
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
                      {t("salary.projection.type")}
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
                          {t(oneOffTypeLabelKeys[type])}
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
                      {t("salary.projection.value")}
                    </Label>
                    <NumericInput
                      id={`oneOff-${index}-value`}
                      name={`oneOff-${index}-value`}
                      min="0"
                      step="100"
                      value={oneOff.value}
                      onValueChange={(next) =>
                        handleOneOffChange(index, "value", next)
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
                    aria-label={t("salary.projection.removeOneOffAria").replace(
                      "{index}",
                      String(index + 1),
                    )}
                    className="h-auto rounded-full border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
                  >
                    {t("salary.projection.remove")}
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
            {t("salary.projection.addOneOff")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("salary.projection.calculate")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleProjectionReset}
            className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
          >
            {t("salary.projection.reset")}
          </Button>
        </div>
        </form>

        {projectionResult ? (
          <>
            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label={t("salary.projection.finalGross")}
                  value={formatCurrency(projectionResult.finalGrossMonthlySalary)}
                />
                <MetricCard
                  label={t("salary.projection.finalNet")}
                  value={formatCurrency(projectionResult.finalNetMonthlySalary)}
                />
                <MetricCard
                  label={t("salary.projection.cumulativeNet")}
                  value={formatCurrency(projectionResult.cumulativeNetSalary)}
                />
                <MetricCard
                  label={t("salary.projection.cumulativeEmployerCost")}
                  value={formatCurrency(projectionResult.cumulativeEmployerCost)}
                />
              </div>
            </div>

            <div className="p-6">
              <details>
                <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
                  {t("salary.projection.yearlyHeading")}
                </summary>
                <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">
                        {t("salary.projection.table.year")}
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        {t("salary.projection.table.grossMonthlySalary")}
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        {t("salary.projection.table.netMonthlySalary")}
                      </th>
                      <th className="pb-2 font-medium">
                        {t("salary.projection.table.totalEmployerCost")}
                      </th>
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
      <p className="mt-3 text-base font-semibold leading-snug text-(--foreground) tabular-nums sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function MetricGlossary() {
  const t = useTranslations();

  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
      <details>
        <summary className="cursor-pointer text-sm font-medium uppercase tracking-[0.2em] text-primary">
          {t("common.whatDoTheseNumbersMean")}
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitionKeys.map(({ termKey, definitionKey }) => (
            <div key={termKey}>
              <dt className="text-sm font-semibold text-(--foreground)">
                {t(termKey)}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                {t(definitionKey)}
              </dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

