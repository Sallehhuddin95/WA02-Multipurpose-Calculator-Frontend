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
  createRetirementAccumulationFormSchema,
  createRetirementDrawdownFormSchema,
} from "@/features/retirement-fund/schemas/retirement-fund-form";
import { projectRetirementAccumulation } from "@/features/retirement-fund/services/project-retirement-accumulation";
import { projectRetirementDrawdown } from "@/features/retirement-fund/services/project-retirement-drawdown";
import {
  DRAWDOWN_SCENARIOS,
  type DrawdownScenario,
  type RetirementAccumulationFormValues,
  type RetirementAccumulationResult,
  type RetirementDrawdownFormValues,
  type RetirementDrawdownResult,
  type SalaryGrowthMode,
} from "@/features/retirement-fund/types/retirement-fund";
import { formatDepletionLabel } from "@/features/retirement-fund/utils/format-depletion-label";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";

const salaryGrowthModeLabelKeys: Record<SalaryGrowthMode, MessageKey> = {
  percentage: "retirement.mode.percentage",
  "fixed-amount": "retirement.mode.fixedAmount",
};

type AccumulationErrorMap = Partial<
  Record<keyof RetirementAccumulationFormValues, string>
>;
type DrawdownErrorMap = Partial<
  Record<keyof RetirementDrawdownFormValues, string>
>;

const defaultAccumulationValues: RetirementAccumulationFormValues = {
  initialBalance: 20000,
  yearsToRetirement: 25,
  annualReturnRate: 5.5,
  salaryGrowthMode: "percentage",
  annualSalaryIncrementRate: 3,
  fixedAnnualSalaryIncrement: 200,
  currentMonthlySalary: 6000,
  employeeContributionRate: 11,
  employerContributionRate: 13,
};

function getDefaultDrawdownValues(
  startingBalance: number,
  postRetirementAnnualReturnRate: number,
): RetirementDrawdownFormValues {
  return {
    startingBalance,
    lumpSumWithdrawal: 0,
    monthlyWithdrawal: 3000,
    postRetirementAnnualReturnRate,
  };
}

const scenarioLabelKeys: Record<DrawdownScenario, MessageKey> = {
  "stays-invested": "retirement.scenario.staysInvested.label",
  "fully-withdrawn": "retirement.scenario.fullyWithdrawn.label",
};

const scenarioDescriptionKeys: Record<DrawdownScenario, MessageKey> = {
  "stays-invested": "retirement.scenario.staysInvested.description",
  "fully-withdrawn": "retirement.scenario.fullyWithdrawn.description",
};

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "retirement.metric.finalCapital.term",
    definitionKey: "retirement.metric.finalCapital.definition",
  },
  {
    termKey: "retirement.metric.totalContributions.term",
    definitionKey: "retirement.metric.totalContributions.definition",
  },
  {
    termKey: "retirement.metric.totalGrowth.term",
    definitionKey: "retirement.metric.totalGrowth.definition",
  },
  {
    termKey: "retirement.metric.timeToDepletion.term",
    definitionKey: "retirement.metric.timeToDepletion.definition",
  },
];

function getInitialAccumulation(): RetirementAccumulationResult {
  return projectRetirementAccumulation(defaultAccumulationValues);
}

function getInitialDrawdown(startingBalance: number): RetirementDrawdownResult {
  return projectRetirementDrawdown(
    getDefaultDrawdownValues(
      startingBalance,
      defaultAccumulationValues.annualReturnRate,
    ),
  );
}

const ACCUMULATION_STORAGE_KEY = "retirement-fund:accumulation:form:v1";
const DRAWDOWN_STORAGE_KEY = "retirement-fund:drawdown:form:v1";

const accumulationFormSchema = createRetirementAccumulationFormSchema(
  createTranslator("en"),
);
const drawdownFormSchema = createRetirementDrawdownFormSchema(
  createTranslator("en"),
);

function validateRetirementAccumulationForm(
  value: unknown,
): RetirementAccumulationFormValues | null {
  const parsed = accumulationFormSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function validateRetirementDrawdownForm(
  value: unknown,
): RetirementDrawdownFormValues | null {
  const parsed = drawdownFormSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const defaultDrawdownValues: RetirementDrawdownFormValues =
  getDefaultDrawdownValues(
    getInitialAccumulation().finalCapital,
    defaultAccumulationValues.annualReturnRate,
  );

export function RetirementFundCalculator() {
  const t = useTranslations();
  const [
    accumulationValues,
    setAccumulationValues,
    { reset: resetAccumulation, isHydrated: isAccumulationHydrated },
  ] = usePersistedState(
    ACCUMULATION_STORAGE_KEY,
    defaultAccumulationValues,
    validateRetirementAccumulationForm,
  );
  const [accumulationErrors, setAccumulationErrors] =
    useState<AccumulationErrorMap>({});
  const [accumulation, setAccumulation] =
    useState<RetirementAccumulationResult>(getInitialAccumulation);
  const [isAccumulationTableOpen, setIsAccumulationTableOpen] = useState(false);

  const [
    drawdownValues,
    setDrawdownValues,
    { reset: resetDrawdown, isHydrated: isDrawdownHydrated },
  ] = usePersistedState(
    DRAWDOWN_STORAGE_KEY,
    defaultDrawdownValues,
    validateRetirementDrawdownForm,
  );
  const [hasEditedStartingBalance, setHasEditedStartingBalance] =
    useState(false);
  const [drawdownErrors, setDrawdownErrors] = useState<DrawdownErrorMap>({});
  const [drawdown, setDrawdown] = useState<RetirementDrawdownResult>(() =>
    getInitialDrawdown(accumulation.finalCapital),
  );
  const [openDrawdownTables, setOpenDrawdownTables] = useState<
    Record<DrawdownScenario, boolean>
  >({
    "stays-invested": false,
    "fully-withdrawn": false,
  });

  const recomputedAccumulationRef = useRef(false);
  const recomputedDrawdownRef = useRef(false);

  useEffect(() => {
    if (!isAccumulationHydrated || recomputedAccumulationRef.current) {
      return;
    }

    recomputedAccumulationRef.current = true;
    setAccumulation(projectRetirementAccumulation(accumulationValues));
  }, [isAccumulationHydrated, accumulationValues]);

  useEffect(() => {
    if (!isDrawdownHydrated || recomputedDrawdownRef.current) {
      return;
    }

    recomputedDrawdownRef.current = true;
    setDrawdown(projectRetirementDrawdown(drawdownValues));
  }, [isDrawdownHydrated, drawdownValues]);

  function handleAccumulationChange<
    K extends keyof RetirementAccumulationFormValues,
  >(key: K, nextValue: RetirementAccumulationFormValues[K]) {
    setAccumulationValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleAccumulationReset() {
    resetAccumulation();
    setAccumulationErrors({});
    setAccumulation(getInitialAccumulation());
  }

  function handleAccumulationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues =
      createRetirementAccumulationFormSchema(t).safeParse(accumulationValues);

    if (!parsedValues.success) {
      const nextErrors: AccumulationErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof RetirementAccumulationFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setAccumulationErrors(nextErrors);
      return;
    }

    setAccumulationErrors({});
    const nextAccumulation = projectRetirementAccumulation(parsedValues.data);
    setAccumulation(nextAccumulation);

    // Section B's starting balance follows Section A until the user edits it directly.
    if (!hasEditedStartingBalance) {
      setDrawdownValues((currentValues) => ({
        ...currentValues,
        startingBalance: nextAccumulation.finalCapital,
        postRetirementAnnualReturnRate: parsedValues.data.annualReturnRate,
      }));
    }
  }

  function handleDrawdownChange<K extends keyof RetirementDrawdownFormValues>(
    key: K,
    nextValue: RetirementDrawdownFormValues[K],
  ) {
    if (key === "startingBalance") {
      setHasEditedStartingBalance(true);
    }

    setDrawdownValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleDrawdownReset() {
    const resetValues = getDefaultDrawdownValues(
      accumulation.finalCapital,
      accumulationValues.annualReturnRate,
    );
    resetDrawdown();
    setDrawdownValues(resetValues);
    setHasEditedStartingBalance(false);
    setDrawdownErrors({});
    setDrawdown(projectRetirementDrawdown(resetValues));
  }

  function handleDrawdownSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createRetirementDrawdownFormSchema(t).safeParse(
      drawdownValues,
    );

    if (!parsedValues.success) {
      const nextErrors: DrawdownErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as
          | keyof RetirementDrawdownFormValues
          | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setDrawdownErrors(nextErrors);
      return;
    }

    setDrawdownErrors({});
    setDrawdown(projectRetirementDrawdown(parsedValues.data));
  }

  function toggleDrawdownTable(scenarioId: DrawdownScenario) {
    setOpenDrawdownTables((current) => ({
      ...current,
      [scenarioId]: !current[scenarioId],
    }));
  }

  return (
    <div className="grid gap-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <form
          noValidate
          onSubmit={handleAccumulationSubmit}
          className="grid content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-6"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("retirement.sectionA")}
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={accumulationErrors.initialBalance}
              helperText={t("retirement.field.initialBalance.helper")}
              inputId="initialBalance"
              label={t("retirement.field.initialBalance.label")}
            >
              <Input
                id="initialBalance"
                name="initialBalance"
                type="number"
                min="0"
                step="1000"
                value={accumulationValues.initialBalance}
                onChange={(event) =>
                  handleAccumulationChange(
                    "initialBalance",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={accumulationErrors.yearsToRetirement}
              helperText={t("retirement.field.yearsToRetirement.helper")}
              inputId="yearsToRetirement"
              label={t("retirement.field.yearsToRetirement.label")}
            >
              <Input
                id="yearsToRetirement"
                name="yearsToRetirement"
                type="number"
                min="1"
                step="1"
                value={accumulationValues.yearsToRetirement}
                onChange={(event) =>
                  handleAccumulationChange(
                    "yearsToRetirement",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={accumulationErrors.annualReturnRate}
              helperText={t("retirement.field.annualReturnRate.helper")}
              inputId="annualReturnRate"
              label={t("retirement.field.annualReturnRate.label")}
            >
              <Input
                id="annualReturnRate"
                name="annualReturnRate"
                type="number"
                min="0"
                step="0.1"
                value={accumulationValues.annualReturnRate}
                onChange={(event) =>
                  handleAccumulationChange(
                    "annualReturnRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={accumulationErrors.currentMonthlySalary}
              helperText={t("retirement.field.currentMonthlySalary.helper")}
              inputId="currentMonthlySalary"
              label={t("retirement.field.currentMonthlySalary.label")}
            >
              <Input
                id="currentMonthlySalary"
                name="currentMonthlySalary"
                type="number"
                min="0"
                step="100"
                value={accumulationValues.currentMonthlySalary}
                onChange={(event) =>
                  handleAccumulationChange(
                    "currentMonthlySalary",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>

          <div>
            <p className="text-(--foreground) text-sm font-semibold">
              {t("retirement.salaryGrowthMode")}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <ModeButton
                isActive={accumulationValues.salaryGrowthMode === "percentage"}
                label={t(salaryGrowthModeLabelKeys.percentage)}
                onClick={() =>
                  handleAccumulationChange("salaryGrowthMode", "percentage")
                }
              />
              <ModeButton
                isActive={
                  accumulationValues.salaryGrowthMode === "fixed-amount"
                }
                label={t(salaryGrowthModeLabelKeys["fixed-amount"])}
                onClick={() =>
                  handleAccumulationChange("salaryGrowthMode", "fixed-amount")
                }
              />
            </div>
          </div>

          {accumulationValues.salaryGrowthMode === "percentage" ? (
            <CalculatorField
              errorMessage={accumulationErrors.annualSalaryIncrementRate}
              helperText={t("retirement.field.annualSalaryIncrementRate.helper")}
              inputId="annualSalaryIncrementRate"
              label={t("retirement.field.annualSalaryIncrementRate.label")}
            >
              <Input
                id="annualSalaryIncrementRate"
                name="annualSalaryIncrementRate"
                type="number"
                min="0"
                step="0.1"
                value={accumulationValues.annualSalaryIncrementRate}
                onChange={(event) =>
                  handleAccumulationChange(
                    "annualSalaryIncrementRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          ) : (
            <CalculatorField
              errorMessage={accumulationErrors.fixedAnnualSalaryIncrement}
              helperText={t("retirement.field.fixedAnnualSalaryIncrement.helper")}
              inputId="fixedAnnualSalaryIncrement"
              label={t("retirement.field.fixedAnnualSalaryIncrement.label")}
            >
              <Input
                id="fixedAnnualSalaryIncrement"
                name="fixedAnnualSalaryIncrement"
                type="number"
                min="0"
                step="50"
                value={accumulationValues.fixedAnnualSalaryIncrement}
                onChange={(event) =>
                  handleAccumulationChange(
                    "fixedAnnualSalaryIncrement",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={accumulationErrors.employeeContributionRate}
              helperText={t("retirement.field.employeeContributionRate.helper")}
              inputId="employeeContributionRate"
              label={t("retirement.field.employeeContributionRate.label")}
            >
              <Input
                id="employeeContributionRate"
                name="employeeContributionRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={accumulationValues.employeeContributionRate}
                onChange={(event) =>
                  handleAccumulationChange(
                    "employeeContributionRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={accumulationErrors.employerContributionRate}
              helperText={t("retirement.field.employerContributionRate.helper")}
              inputId="employerContributionRate"
              label={t("retirement.field.employerContributionRate.label")}
            >
              <Input
                id="employerContributionRate"
                name="employerContributionRate"
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={accumulationValues.employerContributionRate}
                onChange={(event) =>
                  handleAccumulationChange(
                    "employerContributionRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
            >
              {t("retirement.button.project")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAccumulationReset}
              className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
            >
              {t("common.reset")}
            </Button>
          </div>
        </form>

        <div className="grid min-w-0 gap-5">
          <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
            <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
              {t("retirement.summary.heading")}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label={t("retirement.metric.finalCapital.term")}
                value={formatCurrency(accumulation.finalCapital)}
              />
              <MetricCard
                label={t("retirement.metric.totalContributions.term")}
                value={formatCurrency(accumulation.totalContributions)}
              />
              <MetricCard
                label={t("retirement.metric.totalGrowth.term")}
                value={formatCurrency(accumulation.totalGrowth)}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm leading-6">
                {t("retirement.summary.note")}
              </p>
              <ToggleTableButton
                isOpen={isAccumulationTableOpen}
                onClick={() => setIsAccumulationTableOpen((prev) => !prev)}
              />
            </div>

            {isAccumulationTableOpen ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">
                        {t("retirement.table.year")}
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        {t("retirement.table.monthlySalary")}
                      </th>
                      <th className="pb-2 pr-4 font-medium">
                        {t("retirement.table.monthlyContribution")}
                      </th>
                      <th className="pb-2 font-medium">
                        {t("retirement.table.endingBalance")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {accumulation.yearlyProjection.map((row) => (
                      <tr key={row.year} className="bg-card rounded-2xl">
                        <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                          {row.year}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.monthlySalary)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(row.monthlyContribution)}
                        </td>
                        <td className="rounded-r-2xl px-4 py-3">
                          {formatCurrency(row.endingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
        <form
          noValidate
          onSubmit={handleDrawdownSubmit}
          className="grid content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-6"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
            {t("retirement.sectionB")}
          </p>

          <CalculatorField
            errorMessage={drawdownErrors.startingBalance}
            helperText={t("retirement.field.startingBalance.helper")}
            inputId="startingBalance"
            label={t("retirement.field.startingBalance.label")}
          >
            <Input
              id="startingBalance"
              name="startingBalance"
              type="number"
              min="0"
              step="1000"
              value={drawdownValues.startingBalance}
              onChange={(event) =>
                handleDrawdownChange(
                  "startingBalance",
                  Number(event.target.value),
                )
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>

          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={drawdownErrors.lumpSumWithdrawal}
              helperText={t("retirement.field.lumpSumWithdrawal.helper")}
              inputId="lumpSumWithdrawal"
              label={t("retirement.field.lumpSumWithdrawal.label")}
            >
              <Input
                id="lumpSumWithdrawal"
                name="lumpSumWithdrawal"
                type="number"
                min="0"
                step="1000"
                value={drawdownValues.lumpSumWithdrawal}
                onChange={(event) =>
                  handleDrawdownChange(
                    "lumpSumWithdrawal",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={drawdownErrors.monthlyWithdrawal}
              helperText={t("retirement.field.monthlyWithdrawal.helper")}
              inputId="monthlyWithdrawal"
              label={t("retirement.field.monthlyWithdrawal.label")}
            >
              <Input
                id="monthlyWithdrawal"
                name="monthlyWithdrawal"
                type="number"
                min="0"
                step="100"
                value={drawdownValues.monthlyWithdrawal}
                onChange={(event) =>
                  handleDrawdownChange(
                    "monthlyWithdrawal",
                    Number(event.target.value),
                  )
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>

          <CalculatorField
            errorMessage={drawdownErrors.postRetirementAnnualReturnRate}
            helperText={t(
              "retirement.field.postRetirementAnnualReturnRate.helper",
            )}
            inputId="postRetirementAnnualReturnRate"
            label={t("retirement.field.postRetirementAnnualReturnRate.label")}
          >
            <Input
              id="postRetirementAnnualReturnRate"
              name="postRetirementAnnualReturnRate"
              type="number"
              min="0"
              step="0.1"
              value={drawdownValues.postRetirementAnnualReturnRate}
              onChange={(event) =>
                handleDrawdownChange(
                  "postRetirementAnnualReturnRate",
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
              {t("retirement.button.simulate")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDrawdownReset}
              className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
            >
              {t("common.reset")}
            </Button>
          </div>
        </form>

        <div className="grid min-w-0 gap-5">
          {DRAWDOWN_SCENARIOS.map((scenarioId) => {
            const scenario =
              drawdown[
                scenarioId === "stays-invested"
                  ? "staysInvested"
                  : "fullyWithdrawn"
              ];
            const isTableOpen = openDrawdownTables[scenarioId];

            return (
              <section
                key={scenarioId}
                className="min-w-0 rounded-3xl border border-border bg-card/75 p-6"
              >
                <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                  {t(scenarioLabelKeys[scenarioId])}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {t(scenarioDescriptionKeys[scenarioId])}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    label={t("retirement.metric.timeToDepletion.term")}
                    value={formatDepletionLabel(scenario, t)}
                  />
                  <MetricCard
                    label={t("retirement.metric.balanceAtCap")}
                    value={formatCurrency(
                      scenario.monthlyRows.at(-1)?.closingBalance ?? 0,
                    )}
                  />
                </div>

                <div className="mt-5 flex items-center justify-end">
                  <ToggleTableButton
                    isOpen={isTableOpen}
                    onClick={() => toggleDrawdownTable(scenarioId)}
                  />
                </div>

                {isTableOpen ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-left text-sm">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">
                            {t("retirement.table.month")}
                          </th>
                          <th className="pb-2 pr-4 font-medium">
                            {t("retirement.table.lumpSum")}
                          </th>
                          <th className="pb-2 pr-4 font-medium">
                            {t("retirement.table.recurring")}
                          </th>
                          <th className="pb-2 pr-4 font-medium">
                            {t("retirement.table.returnCredited")}
                          </th>
                          <th className="pb-2 font-medium">
                            {t("retirement.table.closingBalance")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {scenario.monthlyRows.map((row) => (
                          <tr
                            key={row.month}
                            className="bg-card rounded-2xl"
                          >
                            <td className="rounded-l-2xl px-4 py-3 whitespace-nowrap">
                              {row.month}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(row.lumpSumWithdrawal)}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(row.recurringWithdrawal)}
                            </td>
                            <td className="px-4 py-3">
                              {formatCurrency(row.returnCredited)}
                            </td>
                            <td className="rounded-r-2xl px-4 py-3">
                              {formatCurrency(row.closingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            );
          })}

          <p className="text-muted-foreground text-sm leading-6">
            {t("retirement.footerNote")}
          </p>

          <MetricGlossary />
        </div>
      </section>
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

interface ToggleTableButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

function ToggleTableButton({
  isOpen,
  onClick,
}: Readonly<ToggleTableButtonProps>) {
  const t = useTranslations();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-expanded={isOpen}
      aria-label={
        isOpen ? t("common.hideProjectionTable") : t("common.showProjectionTable")
      }
      onClick={onClick}
      className="rounded-full border border-border text-muted-foreground hover:bg-card hover:text-(--foreground)"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-200 ${
          isOpen ? "rotate-180" : "rotate-0"
        }`}
      >
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </Button>
  );
}
