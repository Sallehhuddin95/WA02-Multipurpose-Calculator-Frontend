import { z } from "zod";

import {
  EXIT_VALUE_MODES,
  MRTT_MLTT_INSURANCE_TYPES,
  MRTT_PAYMENT_TREATMENTS,
  PROPERTY_INVESTMENT_INPUT_MODES,
} from "@/features/property-investment/types/property-investment";
import type { Translator } from "@/lib/i18n/messages";

export function createPropertyInvestmentFormSchema(t: Translator) {
  return z
    .object({
      purchasePrice: z.coerce
        .number()
        .gt(0, t("property.error.purchasePrice")),
      inputMode: z.enum(PROPERTY_INVESTMENT_INPUT_MODES),
      downPayment: z.coerce
        .number()
        .min(0, t("property.error.downPayment.negative")),
      loanPrincipal: z.coerce
        .number()
        .min(0, t("property.error.loanPrincipal.negative")),
      annualFinancingRate: z.coerce
        .number()
        .min(0, t("property.error.annualFinancingRate")),
      financingTenureYears: z.coerce
        .number()
        .int(t("property.error.financingTenureYears.int"))
        .min(1, t("property.error.financingTenureYears.min")),
      holdingPeriodYears: z.coerce
        .number()
        .int(t("property.error.holdingPeriodYears.int"))
        .min(1, t("property.error.holdingPeriodYears.min")),
      monthlyRent: z.coerce
        .number()
        .min(0, t("property.error.monthlyRent")),
      occupancyRatePercent: z.coerce
        .number()
        .min(0, t("property.error.occupancyRatePercent.negative"))
        .max(100, t("property.error.occupancyRatePercent.max")),
      monthlyMaintenanceAllowance: z.coerce
        .number()
        .min(0, t("property.error.monthlyMaintenanceAllowance")),
      monthlySinkingFund: z.coerce
        .number()
        .min(0, t("property.error.monthlySinkingFund")),
      annualCukaiTaksiran: z.coerce
        .number()
        .min(0, t("property.error.annualCukaiTaksiran")),
      annualCukaiTanahOrPetak: z.coerce
        .number()
        .min(0, t("property.error.annualCukaiTanahOrPetak")),
      annualIndahWaterCost: z.coerce
        .number()
        .min(0, t("property.error.annualIndahWaterCost")),
      annualRepairAllowance: z.coerce
        .number()
        .min(0, t("property.error.annualRepairAllowance")),
      annualFireInsurance: z.coerce
        .number()
        .min(0, t("property.error.annualFireInsurance")),
      annualOtherCosts: z.coerce
        .number()
        .min(0, t("property.error.annualOtherCosts")),
      insuranceType: z.enum(MRTT_MLTT_INSURANCE_TYPES),
      mrttPaymentTreatment: z.enum(MRTT_PAYMENT_TREATMENTS),
      mrttCost: z.coerce
        .number()
        .min(0, t("property.error.mrttCost")),
      annualMlttCost: z.coerce
        .number()
        .min(0, t("property.error.annualMlttCost")),
      exitValueMode: z.enum(EXIT_VALUE_MODES),
      annualAppreciationRate: z.coerce
        .number()
        .min(0, t("property.error.annualAppreciationRate")),
      expectedExitPrice: z.coerce
        .number()
        .min(0, t("property.error.expectedExitPrice.negative")),
      reitInitialCapital: z.coerce
        .number()
        .min(0, t("property.error.reitInitialCapital")),
      reitAnnualReturnRate: z.coerce
        .number()
        .min(0, t("property.error.reitAnnualReturnRate")),
    })
    .superRefine((values, context) => {
      if (
        values.inputMode === "down-payment" &&
        values.downPayment > values.purchasePrice
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("property.error.downPayment.exceeds"),
          path: ["downPayment"],
        });
      }

      if (
        values.inputMode === "loan-principal" &&
        values.loanPrincipal > values.purchasePrice
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("property.error.loanPrincipal.exceeds"),
          path: ["loanPrincipal"],
        });
      }

      if (values.holdingPeriodYears > values.financingTenureYears) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("property.error.holdingPeriodYears.exceeds"),
          path: ["holdingPeriodYears"],
        });
      }

      if (
        values.exitValueMode === "exit-price" &&
        values.expectedExitPrice <= 0
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("property.error.expectedExitPrice.gt"),
          path: ["expectedExitPrice"],
        });
      }
    });
}

export type PropertyInvestmentFormSchema = z.infer<
  ReturnType<typeof createPropertyInvestmentFormSchema>
>;
