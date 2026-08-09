import { z } from "zod";

import {
  EXIT_VALUE_MODES,
  MRTT_MLTT_INSURANCE_TYPES,
  MRTT_PAYMENT_TREATMENTS,
  PROPERTY_INVESTMENT_INPUT_MODES,
} from "@/features/property-investment/types/property-investment";

export const propertyInvestmentFormSchema = z
  .object({
    purchasePrice: z.coerce
      .number()
      .gt(0, "Purchase price must be greater than zero."),
    inputMode: z.enum(PROPERTY_INVESTMENT_INPUT_MODES),
    downPayment: z.coerce.number().min(0, "Down payment cannot be negative."),
    loanPrincipal: z.coerce
      .number()
      .min(0, "Loan principal cannot be negative."),
    annualFinancingRate: z.coerce
      .number()
      .min(0, "Annual financing rate cannot be negative."),
    financingTenureYears: z.coerce
      .number()
      .int("Financing tenure must be a whole number of years.")
      .min(1, "Financing tenure must be at least 1 year."),
    holdingPeriodYears: z.coerce
      .number()
      .int("Holding period must be a whole number of years.")
      .min(1, "Holding period must be at least 1 year."),
    monthlyRent: z.coerce.number().min(0, "Monthly rent cannot be negative."),
    occupancyRatePercent: z.coerce
      .number()
      .min(0, "Occupancy rate cannot be negative.")
      .max(100, "Occupancy rate cannot exceed 100%."),
    monthlyMaintenanceAllowance: z.coerce
      .number()
      .min(0, "Monthly maintenance allowance cannot be negative."),
    monthlySinkingFund: z.coerce
      .number()
      .min(0, "Monthly sinking fund cannot be negative."),
    annualCukaiTaksiran: z.coerce
      .number()
      .min(0, "Annual cukai taksiran cannot be negative."),
    annualCukaiTanahOrPetak: z.coerce
      .number()
      .min(0, "Annual cukai tanah or cukai petak cannot be negative."),
    annualIndahWaterCost: z.coerce
      .number()
      .min(0, "Annual Indah Water cost cannot be negative."),
    annualRepairAllowance: z.coerce
      .number()
      .min(0, "Annual repair allowance cannot be negative."),
    annualFireInsurance: z.coerce
      .number()
      .min(0, "Annual fire insurance cannot be negative."),
    annualOtherCosts: z.coerce
      .number()
      .min(0, "Other annual costs cannot be negative."),
    insuranceType: z.enum(MRTT_MLTT_INSURANCE_TYPES),
    mrttPaymentTreatment: z.enum(MRTT_PAYMENT_TREATMENTS),
    mrttCost: z.coerce.number().min(0, "MRTT cost cannot be negative."),
    annualMlttCost: z.coerce
      .number()
      .min(0, "Annual MLTT cost cannot be negative."),
    exitValueMode: z.enum(EXIT_VALUE_MODES),
    annualAppreciationRate: z.coerce
      .number()
      .min(0, "Annual appreciation rate cannot be negative."),
    expectedExitPrice: z.coerce
      .number()
      .min(0, "Expected exit price cannot be negative."),
    reitInitialCapital: z.coerce
      .number()
      .min(0, "REIT initial capital cannot be negative."),
    reitAnnualReturnRate: z.coerce
      .number()
      .min(0, "REIT annual return rate cannot be negative."),
  })
  .superRefine((values, context) => {
    if (
      values.inputMode === "down-payment" &&
      values.downPayment > values.purchasePrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Down payment cannot exceed purchase price.",
        path: ["downPayment"],
      });
    }

    if (
      values.inputMode === "loan-principal" &&
      values.loanPrincipal > values.purchasePrice
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Loan principal cannot exceed purchase price.",
        path: ["loanPrincipal"],
      });
    }

    if (values.holdingPeriodYears > values.financingTenureYears) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Holding period cannot exceed the financing tenure.",
        path: ["holdingPeriodYears"],
      });
    }

    if (
      values.exitValueMode === "exit-price" &&
      values.expectedExitPrice <= 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected exit price must be greater than zero.",
        path: ["expectedExitPrice"],
      });
    }
  });

export type PropertyInvestmentFormSchema = z.infer<
  typeof propertyInvestmentFormSchema
>;
