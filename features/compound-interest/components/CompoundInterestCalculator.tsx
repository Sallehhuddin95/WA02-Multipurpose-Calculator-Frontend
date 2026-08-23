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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCompoundInterestFormSchema } from "@/features/compound-interest/schemas/compound-interest-form";
import { projectCompoundInterest } from "@/features/compound-interest/services/project-compound-interest";
import {
  COMPOUNDING_FREQUENCIES,
  type CompoundingFrequency,
  type CompoundInterestFormValues,
  type CompoundInterestSummary,
} from "@/features/compound-interest/types/compound-interest";
import { formatPeriodLabel } from "@/features/compound-interest/utils/format-period-label";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof CompoundInterestFormValues, string>>;

const STORAGE_KEY = "compound-interest:form:v1";

const defaultValues: CompoundInterestFormValues = {
  startingPrincipal: 10000,
  annualRate: 6,
  durationYears: 10,
  compoundingFrequency: "monthly",
  monthlyContribution: 250,
};

const formSchema = createCompoundInterestFormSchema(createTranslator("en"));

function validateCompoundInterestForm(
  value: unknown,
): CompoundInterestFormValues | null {
  const parsed = formSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const frequencyLabelKeys: Record<CompoundingFrequency, MessageKey> = {
  annually: "compound.frequency.annually",
  quarterly: "compound.frequency.quarterly",
  monthly: "compound.frequency.monthly",
};

function getInitialSummary() {
  return projectCompoundInterest(defaultValues);
}

export function CompoundInterestCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset, isHydrated }] = usePersistedState(
    STORAGE_KEY,
    defaultValues,
    validateCompoundInterestForm,
  );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [summary, setSummary] =
    useState<CompoundInterestSummary>(getInitialSummary);
  const [isTableOpen, setIsTableOpen] = useState(true);

  const recomputedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || recomputedRef.current) {
      return;
    }

    recomputedRef.current = true;
    setSummary(projectCompoundInterest(values));
  }, [isHydrated, values]);

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
    reset();
    setErrors({});
    setSummary(getInitialSummary());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createCompoundInterestFormSchema(t).safeParse(values);

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
        className="grid content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-6"
      >
        <CalculatorField
          errorMessage={errors.startingPrincipal}
          helperText={t("compound.field.startingPrincipal.helper")}
          inputId="startingPrincipal"
          label={t("compound.field.startingPrincipal.label")}
        >
          <Input
            id="startingPrincipal"
            name="startingPrincipal"
            type="number"
            min="0"
            step="100"
            value={values.startingPrincipal}
            onChange={(event) =>
              handleValueChange("startingPrincipal", Number(event.target.value))
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <CalculatorField
          errorMessage={errors.annualRate}
          helperText={t("compound.field.annualRate.helper")}
          inputId="annualRate"
          label={t("compound.field.annualRate.label")}
        >
          <Input
            id="annualRate"
            name="annualRate"
            type="number"
            min="0"
            step="0.1"
            value={values.annualRate}
            onChange={(event) =>
              handleValueChange("annualRate", Number(event.target.value))
            }
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div className="grid gap-5 md:grid-cols-2">
          <CalculatorField
            errorMessage={errors.durationYears}
            helperText={t("compound.field.durationYears.helper")}
            inputId="durationYears"
            label={t("compound.field.durationYears.label")}
          >
            <Input
              id="durationYears"
              name="durationYears"
              type="number"
              min="0"
              step="1"
              value={values.durationYears}
              onChange={(event) =>
                handleValueChange("durationYears", Number(event.target.value))
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <CalculatorField
            errorMessage={errors.compoundingFrequency}
            helperText={t("compound.field.compoundingFrequency.helper")}
            inputId="compoundingFrequency"
            label={t("compound.field.compoundingFrequency.label")}
          >
            <Select
              value={values.compoundingFrequency}
              onValueChange={(nextValue) =>
                handleValueChange(
                  "compoundingFrequency",
                  nextValue as CompoundInterestFormValues["compoundingFrequency"],
                )
              }
            >
              <SelectTrigger
                id="compoundingFrequency"
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 text-base shadow-none"
              >
                <SelectValue
                  placeholder={t("compound.field.compoundingFrequency.placeholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {COMPOUNDING_FREQUENCIES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t(frequencyLabelKeys[value])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CalculatorField>
        </div>

        <CalculatorField
          errorMessage={errors.monthlyContribution}
          helperText={t("compound.field.monthlyContribution.helper")}
          inputId="monthlyContribution"
          label={t("compound.field.monthlyContribution.label")}
        >
          <Input
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
            className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
          />
        </CalculatorField>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("compound.button.calculate")}
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

      <div className="grid gap-5">
        <section className="rounded-3xl border border-border bg-card/75 p-6">
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("compound.summary.heading")}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <MetricCard
              label={t("compound.metric.projectedBalance")}
              value={formatCurrency(summary.finalProjectedBalance)}
            />
            <MetricCard
              label={t("compound.metric.totalContributions")}
              value={formatCurrency(summary.totalContributions)}
            />
            <MetricCard
              label={t("compound.metric.totalGrowth")}
              value={formatCurrency(summary.totalGrowth)}
            />
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {t("compound.summary.basis")
              .replace("{rate}", formatPercentage(values.annualRate))
              .replace(
                "{frequency}",
                t(frequencyLabelKeys[values.compoundingFrequency]).toLowerCase(),
              )
              .replace(
                "{contribution}",
                formatCurrency(values.monthlyContribution),
              )}
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card/75 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                {t("compound.latestProjectionPoint")}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {formatPeriodLabel(
                  lastProjectionPoint?.period ?? 0,
                  values.compoundingFrequency,
                  t,
                )}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-accent text-accent-foreground rounded-2xl px-4 py-3 text-sm">
                {t("compound.growthShare")}{" "}
                {summary.finalProjectedBalance === 0
                  ? "0.0%"
                  : formatPercentage(
                      (summary.totalGrowth / summary.finalProjectedBalance) *
                        100,
                    )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-expanded={isTableOpen}
                aria-label={
                  isTableOpen
                    ? t("common.hideProjectionTable")
                    : t("common.showProjectionTable")
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
          </div>
          {isTableOpen ? (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">
                      {t("compound.table.period")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("compound.table.endingBalance")}
                    </th>
                    <th className="pb-2 pr-4 font-medium">
                      {t("compound.table.contributedCapital")}
                    </th>
                    <th className="pb-2 font-medium">
                      {t("compound.table.growth")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.projection.map((projectionPoint) => (
                    <tr
                      key={projectionPoint.period}
                      className="bg-card rounded-2xl"
                    >
                      <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                        {formatPeriodLabel(
                          projectionPoint.period,
                          values.compoundingFrequency,
                          t,
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
      <Label htmlFor={inputId} className="font-semibold text-(--foreground)">
        {label}
      </Label>
      {children}
      <p id={helperId} className="text-muted-foreground mt-2 text-sm">
        {helperText}
      </p>
      {errorMessage ? (
        <p id={errorId} className="mt-1 text-sm font-medium text-destructive">
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
