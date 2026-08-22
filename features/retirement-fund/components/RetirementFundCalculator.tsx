"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  retirementAccumulationFormSchema,
  retirementDrawdownFormSchema,
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
} from "@/features/retirement-fund/types/retirement-fund";
import { formatCurrency } from "@/utils/format-currency";

const SALARY_GROWTH_MODE_LABELS = {
  percentage: "Percentage increment",
  "fixed-amount": "Fixed ringgit increase",
} as const;

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

const scenarioLabels: Record<DrawdownScenario, string> = {
  "stays-invested": "Stays invested",
  "fully-withdrawn": "Fully withdrawn",
};

const scenarioDescriptions: Record<DrawdownScenario, string> = {
  "stays-invested":
    "The remaining balance stays invested and continues to earn the post-retirement return rate, credited once per year, while monthly withdrawals continue every month.",
  "fully-withdrawn":
    "The entire sum is withdrawn into cash. No investment return continues to accrue; the balance simply decreases by the monthly withdrawal each month.",
};

const metricDefinitions: ReadonlyArray<{ term: string; definition: string }> = [
  {
    term: "Final capital",
    definition:
      "The ending retirement savings balance at the close of the last projection year, after the final year's return is credited.",
  },
  {
    term: "Total contributions",
    definition:
      "The cumulative sum of every monthly contribution paid in across all years, including both employee and employer portions.",
  },
  {
    term: "Total growth",
    definition:
      "Final capital minus the initial savings balance minus total contributions - the portion of the ending balance that came from investment return alone.",
  },
  {
    term: "Time to depletion",
    definition:
      "How long the retirement fund lasts under the entered withdrawal pattern before the balance reaches zero, or a report that it does not deplete within 100 years.",
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

export function RetirementFundCalculator() {
  const [accumulationValues, setAccumulationValues] =
    useState<RetirementAccumulationFormValues>(defaultAccumulationValues);
  const [accumulationErrors, setAccumulationErrors] =
    useState<AccumulationErrorMap>({});
  const [accumulation, setAccumulation] =
    useState<RetirementAccumulationResult>(getInitialAccumulation);
  const [isAccumulationTableOpen, setIsAccumulationTableOpen] = useState(false);

  const [drawdownValues, setDrawdownValues] =
    useState<RetirementDrawdownFormValues>(() =>
      getDefaultDrawdownValues(
        accumulation.finalCapital,
        defaultAccumulationValues.annualReturnRate,
      ),
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

  function handleAccumulationChange<
    K extends keyof RetirementAccumulationFormValues,
  >(key: K, nextValue: RetirementAccumulationFormValues[K]) {
    setAccumulationValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleAccumulationReset() {
    setAccumulationValues(defaultAccumulationValues);
    setAccumulationErrors({});
    setAccumulation(getInitialAccumulation());
  }

  function handleAccumulationSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues =
      retirementAccumulationFormSchema.safeParse(accumulationValues);

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
    setDrawdownValues(resetValues);
    setHasEditedStartingBalance(false);
    setDrawdownErrors({});
    setDrawdown(projectRetirementDrawdown(resetValues));
  }

  function handleDrawdownSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = retirementDrawdownFormSchema.safeParse(drawdownValues);

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
            Section A · Retirement Savings Projection
          </p>

          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={accumulationErrors.initialBalance}
              helperText="Current retirement savings; may be zero."
              inputId="initialBalance"
              label="Initial savings balance (RM)"
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
              helperText="Whole number of years, at least 1."
              inputId="yearsToRetirement"
              label="Years to retirement"
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
              helperText="Fixed for the full accumulation horizon, credited once per year."
              inputId="annualReturnRate"
              label="Annual return rate (%)"
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
              helperText="Current gross monthly salary."
              inputId="currentMonthlySalary"
              label="Current monthly salary (RM)"
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
              Salary growth mode
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <ModeButton
                isActive={accumulationValues.salaryGrowthMode === "percentage"}
                label={SALARY_GROWTH_MODE_LABELS.percentage}
                onClick={() =>
                  handleAccumulationChange("salaryGrowthMode", "percentage")
                }
              />
              <ModeButton
                isActive={
                  accumulationValues.salaryGrowthMode === "fixed-amount"
                }
                label={SALARY_GROWTH_MODE_LABELS["fixed-amount"]}
                onClick={() =>
                  handleAccumulationChange("salaryGrowthMode", "fixed-amount")
                }
              />
            </div>
          </div>

          {accumulationValues.salaryGrowthMode === "percentage" ? (
            <CalculatorField
              errorMessage={accumulationErrors.annualSalaryIncrementRate}
              helperText="May be zero; grows monthly salary once per year."
              inputId="annualSalaryIncrementRate"
              label="Annual salary increment rate (%)"
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
              helperText="May be zero; added to monthly salary once per year."
              inputId="fixedAnnualSalaryIncrement"
              label="Fixed annual salary increase (RM)"
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
              helperText="Applied to current monthly salary."
              inputId="employeeContributionRate"
              label="Employee contribution rate (%)"
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
              helperText="Optional; defaults to 0. Combined rate must not exceed 100%."
              inputId="employerContributionRate"
              label="Employer contribution rate (%)"
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
              Project savings
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleAccumulationReset}
              className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
            >
              Reset inputs
            </Button>
          </div>
        </form>

        <div className="grid min-w-0 gap-5">
          <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
            <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
              Projection Summary
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Final capital"
                value={formatCurrency(accumulation.finalCapital)}
              />
              <MetricCard
                label="Total contributions"
                value={formatCurrency(accumulation.totalContributions)}
              />
              <MetricCard
                label="Total growth"
                value={formatCurrency(accumulation.totalGrowth)}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm leading-6">
                Annual return credited once per year on the end-of-year balance;
                contributions accumulate monthly throughout each year.
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
                      <th className="pb-2 pr-4 font-medium">Year</th>
                      <th className="pb-2 pr-4 font-medium">Monthly salary</th>
                      <th className="pb-2 pr-4 font-medium">
                        Monthly contribution
                      </th>
                      <th className="pb-2 font-medium">Ending balance</th>
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
            Section B · Retirement Fund Longevity Simulation
          </p>

          <CalculatorField
            errorMessage={drawdownErrors.startingBalance}
            helperText="Defaults to Section A's final capital; editable directly."
            inputId="startingBalance"
            label="Starting balance (RM)"
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
              helperText="One-time withdrawal deducted at the start of month 1; may be zero."
              inputId="lumpSumWithdrawal"
              label="Lump-sum withdrawal (RM)"
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
              helperText="Deducted every month starting month 1; may be zero."
              inputId="monthlyWithdrawal"
              label="Monthly withdrawal (RM)"
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
            helperText="Applies to the stays-invested scenario only; separate from Section A's rate."
            inputId="postRetirementAnnualReturnRate"
            label="Post-retirement annual return rate (%)"
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
              Simulate longevity
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleDrawdownReset}
              className="h-auto rounded-full border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-none hover:border-primary hover:bg-card hover:text-foreground"
            >
              Reset inputs
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
                  {scenarioLabels[scenarioId]}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {scenarioDescriptions[scenarioId]}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    label="Time to depletion"
                    value={formatDepletionLabel(scenario)}
                  />
                  <MetricCard
                    label="Balance at 100-year cap"
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
                          <th className="pb-2 pr-4 font-medium">Month</th>
                          <th className="pb-2 pr-4 font-medium">Lump sum</th>
                          <th className="pb-2 pr-4 font-medium">Recurring</th>
                          <th className="pb-2 pr-4 font-medium">
                            Return credited
                          </th>
                          <th className="pb-2 font-medium">Closing balance</th>
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
            Month 1 deducts the lump-sum withdrawal and the first monthly
            withdrawal together. The simulation runs for a maximum of 100 years
            (1,200 months).
          </p>

          <MetricGlossary />
        </div>
      </section>
    </div>
  );
}

function formatDepletionLabel(scenario: {
  didNotDeplete: boolean;
  depletionYears: number | null;
  depletionRemainingMonths: number | null;
}) {
  if (scenario.didNotDeplete) {
    return "Does not deplete within 100 years";
  }

  const years = scenario.depletionYears ?? 0;
  const months = scenario.depletionRemainingMonths ?? 0;

  if (years === 0) {
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  if (months === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"} ${months} month${
    months === 1 ? "" : "s"
  }`;
}

function MetricGlossary() {
  return (
    <section className="rounded-3xl border border-border bg-card/75 p-6">
      <details>
        <summary className="text-primary cursor-pointer text-sm font-medium uppercase tracking-[0.2em]">
          What do these numbers mean?
        </summary>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {metricDefinitions.map(({ term, definition }) => (
            <div key={term}>
              <dt className="text-(--foreground) text-sm font-semibold">
                {term}
              </dt>
              <dd className="text-muted-foreground mt-1 text-sm leading-6">
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
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-expanded={isOpen}
      aria-label={isOpen ? "Hide projection table" : "Show projection table"}
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
