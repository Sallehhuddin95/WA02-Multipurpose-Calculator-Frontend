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
import { createCarLoanFormSchema } from "@/features/car-loan/schemas/car-loan-form";
import { projectCarLoan } from "@/features/car-loan/services/project-car-loan";
import type {
  CarLoanFormValues,
  CarLoanProjectionResult,
} from "@/features/car-loan/types/car-loan";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { createTranslator, type MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";
import { formatCurrency } from "@/utils/format-currency";
import { formatPercentage } from "@/utils/format-percentage";

type FieldErrorMap = Partial<Record<keyof CarLoanFormValues, string>>;

const STORAGE_KEY = "car-loan:form:v1";

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

const formSchema = createCarLoanFormSchema(createTranslator("en"));

function validateCarLoanForm(value: unknown): CarLoanFormValues | null {
  const parsed = formSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

const metricDefinitionKeys: ReadonlyArray<{
  termKey: MessageKey;
  definitionKey: MessageKey;
}> = [
  {
    termKey: "carLoan.metric.financedPrincipal.term",
    definitionKey: "carLoan.metric.financedPrincipal.definition",
  },
  {
    termKey: "carLoan.metric.totalInterest.term",
    definitionKey: "carLoan.metric.totalInterest.definition",
  },
  {
    termKey: "carLoan.metric.totalRepayable.term",
    definitionKey: "carLoan.metric.totalRepayable.definition",
  },
  {
    termKey: "carLoan.metric.monthlyInstalment.term",
    definitionKey: "carLoan.metric.monthlyInstalment.definition",
  },
  {
    termKey: "carLoan.metric.paidToDate.term",
    definitionKey: "carLoan.metric.paidToDate.definition",
  },
  {
    termKey: "carLoan.metric.earnedInterest.term",
    definitionKey: "carLoan.metric.earnedInterest.definition",
  },
  {
    termKey: "carLoan.metric.interestRebate.term",
    definitionKey: "carLoan.metric.interestRebate.definition",
  },
  {
    termKey: "carLoan.metric.settlementAmount.term",
    definitionKey: "carLoan.metric.settlementAmount.definition",
  },
];

function getInitialProjection(): CarLoanProjectionResult {
  return projectCarLoan(defaultValues);
}

export function CarLoanCalculator() {
  const t = useTranslations();
  const [values, setValues, { reset, isHydrated }] = usePersistedState(
    STORAGE_KEY,
    defaultValues,
    validateCarLoanForm,
  );
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [projection, setProjection] =
    useState<CarLoanProjectionResult>(getInitialProjection);

  const recomputedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || recomputedRef.current) {
      return;
    }

    recomputedRef.current = true;
    setProjection(projectCarLoan(values));
  }, [isHydrated, values]);

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
    reset();
    setErrors({});
    setProjection(getInitialProjection());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = createCarLoanFormSchema(t).safeParse(values);

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
        className="grid content-start gap-5 self-start rounded-3xl border border-border bg-card/75 p-6"
      >
        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("carLoan.field.inputMethod")}
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.inputMode === "vehicle-price"}
              label={t("carLoan.mode.vehiclePrice")}
              onClick={() => handleValueChange("inputMode", "vehicle-price")}
            />
            <ModeButton
              isActive={values.inputMode === "financed-principal"}
              label={t("carLoan.mode.financedPrincipal")}
              onClick={() =>
                handleValueChange("inputMode", "financed-principal")
              }
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-(--foreground) text-sm font-semibold">
            {t("carLoan.field.rateType")}
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            <ModeButton
              isActive={values.rateMode === "variable-rate"}
              label={t("carLoan.mode.variableRate")}
              onClick={() => handleValueChange("rateMode", "variable-rate")}
            />
            <ModeButton
              isActive={values.rateMode === "fixed-rate"}
              label={t("carLoan.mode.fixedRate")}
              onClick={() => handleValueChange("rateMode", "fixed-rate")}
            />
          </div>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            {t("carLoan.rateHelp")}
          </p>
        </fieldset>

        {values.inputMode === "vehicle-price" ? (
          <div className="grid gap-5 md:grid-cols-2">
            <CalculatorField
              errorMessage={errors.vehiclePrice}
              helperText={t("carLoan.field.vehiclePrice.helper")}
              inputId="vehiclePrice"
              label={t("carLoan.field.vehiclePrice.label")}
            >
              <Input
                id="vehiclePrice"
                name="vehiclePrice"
                type="number"
                min="0"
                step="1000"
                value={values.vehiclePrice}
                onChange={(event) =>
                  handleValueChange("vehiclePrice", Number(event.target.value))
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>

            <CalculatorField
              errorMessage={errors.downPayment}
              helperText={t("carLoan.field.downPayment.helper")}
              inputId="downPayment"
              label={t("carLoan.field.downPayment.label")}
            >
              <Input
                id="downPayment"
                name="downPayment"
                type="number"
                min="0"
                step="1000"
                value={values.downPayment}
                onChange={(event) =>
                  handleValueChange("downPayment", Number(event.target.value))
                }
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          </div>
        ) : (
          <CalculatorField
            errorMessage={errors.financedPrincipal}
            helperText={t("carLoan.field.financedPrincipal.helper")}
            inputId="financedPrincipal"
            label={t("carLoan.field.financedPrincipal.label")}
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {values.rateMode === "variable-rate" ? (
            <CalculatorField
              errorMessage={errors.variableAnnualInterestRate}
              helperText={t("carLoan.field.variableAnnualInterestRate.helper")}
              inputId="variableAnnualInterestRate"
              label={t("carLoan.field.variableAnnualInterestRate.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          ) : (
            <CalculatorField
              errorMessage={errors.fixedAnnualInterestRate}
              helperText={t("carLoan.field.fixedAnnualInterestRate.helper")}
              inputId="fixedAnnualInterestRate"
              label={t("carLoan.field.fixedAnnualInterestRate.label")}
            >
              <Input
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
                className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
              />
            </CalculatorField>
          )}

          <CalculatorField
            errorMessage={errors.tenureYears}
            helperText={t("carLoan.field.tenureYears.helper")}
            inputId="tenureYears"
            label={t("carLoan.field.tenureYears.label")}
          >
            <Input
              id="tenureYears"
              name="tenureYears"
              type="number"
              min="1"
              step="1"
              value={values.tenureYears}
              onChange={(event) =>
                handleValueChange("tenureYears", Number(event.target.value))
              }
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3">
          <input
            type="checkbox"
            checked={values.earlySettlementEnabled}
            onChange={(event) =>
              handleValueChange("earlySettlementEnabled", event.target.checked)
            }
            className="text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background h-4 w-4 rounded border-border"
          />
          <span className="text-(--foreground) text-sm font-semibold">
            {t("carLoan.earlySettlementCheckbox")}
          </span>
        </label>

        {values.earlySettlementEnabled ? (
          <CalculatorField
            errorMessage={errors.earlySettlementMonth}
            helperText={t("carLoan.field.earlySettlementMonth.helper")}
            inputId="earlySettlementMonth"
            label={t("carLoan.field.earlySettlementMonth.label")}
          >
            <Input
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
              className="mt-2 h-auto w-full rounded-2xl bg-card px-4 py-3 shadow-none md:text-base"
            />
          </CalculatorField>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            type="submit"
            className="h-auto rounded-full px-5 py-3 text-sm font-semibold shadow-none"
          >
            {t("carLoan.button.calculate")}
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
            {t("carLoan.summary.heading")}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={t("carLoan.metric.financedPrincipal.term")}
              value={formatCurrency(projection.loanSummary.financedPrincipal)}
            />
            <MetricCard
              label={t("carLoan.metric.totalInterest.term")}
              value={formatCurrency(projection.loanSummary.totalInterest)}
            />
            <MetricCard
              label={t("carLoan.metric.totalRepayable.term")}
              value={formatCurrency(
                projection.loanSummary.totalRepayableAmount,
              )}
            />
            <MetricCard
              label={t("carLoan.metric.monthlyInstalment.term")}
              value={formatCurrency(projection.loanSummary.monthlyInstalment)}
            />
          </div>
          <p className="text-muted-foreground mt-5 text-sm leading-6">
            {values.rateMode === "variable-rate"
              ? t("carLoan.summary.basis.variable")
                  .replace(
                    "{rate}",
                    formatPercentage(values.variableAnnualInterestRate),
                  )
                  .replace(
                    "{months}",
                    String(projection.loanSummary.totalMonths),
                  )
              : t("carLoan.summary.basis.fixed")
                  .replace(
                    "{rate}",
                    formatPercentage(values.fixedAnnualInterestRate),
                  )
                  .replace(
                    "{months}",
                    String(projection.loanSummary.totalMonths),
                  )}
          </p>
        </section>

        {projection.settlement ? (
          <section className="min-w-0 rounded-3xl border border-border bg-card/75 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-primary text-sm font-medium uppercase tracking-[0.2em]">
                  {t("carLoan.settlement.heading")}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {t("carLoan.settlement.monthHeading").replace(
                    "{month}",
                    String(projection.settlement.summary.settlementMonth),
                  )}
                </h2>
              </div>
              <div className="bg-accent text-accent-foreground rounded-2xl px-4 py-3 text-sm">
                {projection.settlement.rateMode === "variable-rate"
                  ? t("carLoan.settlement.variableBadge")
                  : t("carLoan.settlement.fixedBadge")}
              </div>
            </div>

            {projection.settlement.rateMode === "variable-rate" ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <MetricCard
                  label={t("carLoan.metric.paidToDate.term")}
                  value={formatCurrency(
                    projection.settlement.summary.totalPaidToDate,
                  )}
                />
                <MetricCard
                  label={t("carLoan.metric.settlementAmount.term")}
                  value={formatCurrency(
                    projection.settlement.summary.projectedSettlementAmount,
                  )}
                />
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label={t("carLoan.metric.paidToDate.term")}
                  value={formatCurrency(
                    projection.settlement.summary.totalPaidToDate,
                  )}
                />
                <MetricCard
                  label={t("carLoan.metric.earnedInterest.term")}
                  value={formatCurrency(
                    projection.settlement.summary.earnedInterest,
                  )}
                />
                <MetricCard
                  label={t("carLoan.metric.interestRebate.term")}
                  value={formatCurrency(
                    projection.settlement.summary.unearnedInterestRebate,
                  )}
                />
                <MetricCard
                  label={t("carLoan.metric.settlementAmount.term")}
                  value={formatCurrency(
                    projection.settlement.summary.projectedSettlementAmount,
                  )}
                />
              </div>
            )}

            <p className="text-muted-foreground mt-5 text-sm leading-6">
              {projection.settlement.rateMode === "variable-rate"
                ? t("carLoan.settlement.footer.variable")
                : t("carLoan.settlement.footer.fixed")}
            </p>
          </section>
        ) : null}

        <MetricGlossary />
      </div>
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
