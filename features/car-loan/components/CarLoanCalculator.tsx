"use client";

import React, { useState, type FormEvent, type ReactNode } from "react";

import { carLoanFormSchema } from "@/features/car-loan/schemas/car-loan-form";
import { projectCarLoan } from "@/features/car-loan/services/project-car-loan";
import type {
  CarLoanFormValues,
  CarLoanProjectionResult,
} from "@/features/car-loan/types/car-loan";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof CarLoanFormValues, string>>;

const defaultValues: CarLoanFormValues = {
  inputMode: "vehicle-price",
  vehiclePrice: 90000,
  downPayment: 10000,
  financedPrincipal: 80000,
  rateMode: "variable-rate",
  fixedAnnualInterestRate: 3,
  variableAnnualInterestRate: 3.5,
  tenureYears: 7,
  earlySettlementEnabled: false,
  earlySettlementMonth: 24,
};

const metricDefinitions: ReadonlyArray<{ term: string; definition: string }> = [
  {
    term: "Financed principal",
    definition:
      "The amount financed after any down payment, before interest is added.",
  },
  {
    term: "Total interest",
    definition:
      "The total interest cost over the full loan term for the selected rate type.",
  },
  {
    term: "Total repayable",
    definition: "Financed principal plus total interest across the full term.",
  },
  {
    term: "Monthly instalment",
    definition: "The scheduled amount due each month for the full loan term.",
  },
  {
    term: "Paid to date",
    definition:
      "How much you would have paid in instalments by the selected settlement month.",
  },
  {
    term: "Earned interest",
    definition:
      "Under the fixed-rate Rule of 78 model, the portion of total interest considered already earned by the lender at the settlement month.",
  },
  {
    term: "Interest rebate",
    definition:
      "Under the fixed-rate Rule of 78 model, the portion of interest not yet earned that is credited back to you at settlement.",
  },
  {
    term: "Settlement amount",
    definition:
      "What you would need to pay the lender to close the loan at the selected month: the outstanding balance under variable rate, or the Rule of 78 result under fixed rate.",
  },
];

function getInitialProjection(): CarLoanProjectionResult {
  return projectCarLoan(defaultValues);
}

export function CarLoanCalculator() {
  const [values, setValues] = useState<CarLoanFormValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [projection, setProjection] =
    useState<CarLoanProjectionResult>(getInitialProjection);

  function handleValueChange<K extends keyof CarLoanFormValues>(
    key: K,
    nextValue: CarLoanFormValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: nextValue,
    }));
  }

  function handleReset() {
    setValues(defaultValues);
    setErrors({});
    setProjection(getInitialProjection());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = carLoanFormSchema.safeParse(values);

    if (!parsedValues.success) {
      const nextErrors: FieldErrorMap = {};

      parsedValues.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof CarLoanFormValues | undefined;

        if (fieldName && !nextErrors[fieldName]) {
          nextErrors[fieldName] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setProjection(projectCarLoan(parsedValues.data));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid content-start gap-5 self-start rounded-[1.75rem] border border-(--line) bg-white/75 p-6"
      >
        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Input method
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.inputMode === "vehicle-price"}
              label="Vehicle price and down payment"
              onClick={() => handleValueChange("inputMode", "vehicle-price")}
            />
            <ModeButton
              isActive={values.inputMode === "financed-principal"}
              label="Financed principal directly"
              onClick={() =>
                handleValueChange("inputMode", "financed-principal")
              }
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            Rate type
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.rateMode === "variable-rate"}
              label="Variable rate (reducing balance)"
              onClick={() => handleValueChange("rateMode", "variable-rate")}
            />
            <ModeButton
              isActive={values.rateMode === "fixed-rate"}
              label="Fixed rate (Rule of 78, legacy)"
              onClick={() => handleValueChange("rateMode", "fixed-rate")}
            />
          </div>
          <p className="text-(--muted) mt-2 text-sm leading-6">
            Variable rate reflects the reducing-balance method required for new
            hire-purchase agreements under the Hire-Purchase (Amendment) Act
            2026. Fixed rate is kept for comparing against an older-style
            flat-rate agreement.
          </p>
        </fieldset>

        {values.inputMode === "vehicle-price" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.vehiclePrice}
              helperText="On-the-road vehicle cost before down payment reduction."
              inputId="vehiclePrice"
              label="Vehicle price"
            >
              <input
                id="vehiclePrice"
                name="vehiclePrice"
                type="number"
                min="0"
                step="1000"
                value={values.vehiclePrice}
                onChange={(event) =>
                  handleValueChange("vehiclePrice", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.downPayment}
              helperText="Cash paid up front before financing begins."
              inputId="downPayment"
              label="Down payment"
            >
              <input
                id="downPayment"
                name="downPayment"
                type="number"
                min="0"
                step="1000"
                value={values.downPayment}
                onChange={(event) =>
                  handleValueChange("downPayment", Number(event.target.value))
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>
          </div>
        ) : (
          <CalculatorField
            errorMessage={errors.financedPrincipal}
            helperText="Use this when you already know the exact financed amount from the bank or dealer."
            inputId="financedPrincipal"
            label="Financed principal"
          >
            <input
              id="financedPrincipal"
              name="financedPrincipal"
              type="number"
              min="0"
              step="1000"
              value={values.financedPrincipal}
              onChange={(event) =>
                handleValueChange(
                  "financedPrincipal",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {values.rateMode === "variable-rate" ? (
            <CalculatorField
              errorMessage={errors.variableAnnualInterestRate}
              helperText="Effective Interest Rate (EIR) under the reducing-balance method."
              inputId="variableAnnualInterestRate"
              label="Annual interest rate (EIR) (%)"
            >
              <input
                id="variableAnnualInterestRate"
                name="variableAnnualInterestRate"
                type="number"
                min="0"
                step="0.1"
                value={values.variableAnnualInterestRate}
                onChange={(event) =>
                  handleValueChange(
                    "variableAnnualInterestRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>
          ) : (
            <CalculatorField
              errorMessage={errors.fixedAnnualInterestRate}
              helperText="Flat annual interest rate used across the full term."
              inputId="fixedAnnualInterestRate"
              label="Flat annual interest rate (%)"
            >
              <input
                id="fixedAnnualInterestRate"
                name="fixedAnnualInterestRate"
                type="number"
                min="0"
                step="0.1"
                value={values.fixedAnnualInterestRate}
                onChange={(event) =>
                  handleValueChange(
                    "fixedAnnualInterestRate",
                    Number(event.target.value),
                  )
                }
                className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
              />
            </CalculatorField>
          )}

          <CalculatorField
            errorMessage={errors.tenureYears}
            helperText="Whole number of years."
            inputId="tenureYears"
            label="Tenure (years)"
          >
            <input
              id="tenureYears"
              name="tenureYears"
              type="number"
              min="1"
              step="1"
              value={values.tenureYears}
              onChange={(event) =>
                handleValueChange("tenureYears", Number(event.target.value))
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-(--line) bg-white/60 px-4 py-3">
          <input
            type="checkbox"
            checked={values.earlySettlementEnabled}
            onChange={(event) =>
              handleValueChange("earlySettlementEnabled", event.target.checked)
            }
            className="text-(--accent) focus:ring-(--accent) h-4 w-4 rounded border-(--line)"
          />
          <span className="text-(--foreground) text-sm font-semibold">
            I want to check an early settlement estimate
          </span>
        </label>

        {values.earlySettlementEnabled ? (
          <CalculatorField
            errorMessage={errors.earlySettlementMonth}
            helperText="Month number used for the settlement estimate."
            inputId="earlySettlementMonth"
            label="Early settlement month"
          >
            <input
              id="earlySettlementMonth"
              name="earlySettlementMonth"
              type="number"
              min="1"
              step="1"
              value={values.earlySettlementMonth}
              onChange={(event) =>
                handleValueChange(
                  "earlySettlementMonth",
                  Number(event.target.value),
                )
              }
              className="mt-2 w-full rounded-2xl border border-(--line) bg-(--panel-strong) px-4 py-3"
            />
          </CalculatorField>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="bg-(--accent) hover:bg-(--accent-strong) rounded-full px-5 py-3 text-sm font-semibold text-white transition"
          >
            Calculate loan
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
            Loan Summary
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Financed principal"
              value={formatCurrency(projection.loanSummary.financedPrincipal)}
            />
            <MetricCard
              label="Total interest"
              value={formatCurrency(projection.loanSummary.totalInterest)}
            />
            <MetricCard
              label="Total repayable"
              value={formatCurrency(
                projection.loanSummary.totalRepayableAmount,
              )}
            />
            <MetricCard
              label="Monthly instalment"
              value={formatCurrency(projection.loanSummary.monthlyInstalment)}
            />
          </div>
          <p className="text-(--muted) mt-5 text-sm leading-6">
            {values.rateMode === "variable-rate"
              ? `Based on ${formatPercentage(values.variableAnnualInterestRate)} EIR under the reducing-balance method over ${projection.loanSummary.totalMonths} months.`
              : `Based on ${formatPercentage(values.fixedAnnualInterestRate)} flat annual interest over ${projection.loanSummary.totalMonths} months.`}
          </p>
        </section>

        {projection.settlement ? (
          <section className="rounded-[1.75rem] border border-(--line) bg-white/78 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-(--warning) text-sm font-medium uppercase tracking-[0.2em]">
                  Early Settlement Estimate
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Month {projection.settlement.summary.settlementMonth}
                </h2>
              </div>
              <div className="bg-(--accent-soft) text-(--accent-strong) rounded-2xl px-4 py-3 text-sm">
                {projection.settlement.rateMode === "variable-rate"
                  ? "Outstanding-balance settlement (reducing balance)"
                  : "Rule of 78 style rebate projection"}
              </div>
            </div>

            {projection.settlement.rateMode === "variable-rate" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label="Paid to date"
                  value={formatCurrency(
                    projection.settlement.summary.totalPaidToDate,
                  )}
                />
                <MetricCard
                  label="Settlement amount"
                  value={formatCurrency(
                    projection.settlement.summary.projectedSettlementAmount,
                  )}
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Paid to date"
                  value={formatCurrency(
                    projection.settlement.summary.totalPaidToDate,
                  )}
                />
                <MetricCard
                  label="Earned interest"
                  value={formatCurrency(
                    projection.settlement.summary.earnedInterest,
                  )}
                />
                <MetricCard
                  label="Interest rebate"
                  value={formatCurrency(
                    projection.settlement.summary.unearnedInterestRebate,
                  )}
                />
                <MetricCard
                  label="Settlement amount"
                  value={formatCurrency(
                    projection.settlement.summary.projectedSettlementAmount,
                  )}
                />
              </div>
            )}

            <p className="text-(--muted) mt-5 text-sm leading-6">
              {projection.settlement.rateMode === "variable-rate"
                ? "Under the reducing-balance method, the settlement amount is simply the outstanding loan balance at this month, not a lender-issued payoff quote."
                : "This estimate applies the documented Rule of 78 weighting from the spec and should be treated as planning guidance rather than a lender-issued statement."}
            </p>
          </section>
        ) : null}

        <MetricGlossary />
      </div>
    </div>
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

interface ModeButtonProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function ModeButton({ isActive, label, onClick }: Readonly<ModeButtonProps>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        isActive
          ? "bg-(--accent) border-(--accent) text-white"
          : "text-(--foreground) border-(--line) bg-white/60 hover:border-(--accent)",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
