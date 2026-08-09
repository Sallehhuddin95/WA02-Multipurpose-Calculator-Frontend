import { z } from "zod";

import {
  CAR_LOAN_INPUT_MODES,
  CAR_LOAN_RATE_MODES,
} from "@/features/car-loan/types/car-loan";

export const carLoanFormSchema = z
  .object({
    inputMode: z.enum(CAR_LOAN_INPUT_MODES),
    vehiclePrice: z.coerce.number().min(0, "Vehicle price cannot be negative."),
    downPayment: z.coerce.number().min(0, "Down payment cannot be negative."),
    financedPrincipal: z.coerce
      .number()
      .min(0, "Financed principal cannot be negative."),
    rateMode: z.enum(CAR_LOAN_RATE_MODES),
    fixedAnnualInterestRate: z.coerce
      .number()
      .min(0, "Flat annual interest rate cannot be negative."),
    variableAnnualInterestRate: z.coerce
      .number()
      .min(0, "Effective interest rate cannot be negative."),
    tenureYears: z.coerce
      .number()
      .int("Tenure must be a whole number of years.")
      .min(1, "Tenure must be at least 1 year."),
    earlySettlementEnabled: z.boolean(),
    earlySettlementMonth: z.coerce
      .number()
      .int("Settlement month must be a whole number.")
      .min(1, "Settlement month must be at least 1."),
  })
  .superRefine((values, context) => {
    const totalMonths = values.tenureYears * 12;

    if (values.inputMode === "vehicle-price") {
      if (values.vehiclePrice <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vehicle price must be greater than zero.",
          path: ["vehiclePrice"],
        });
      }

      if (values.downPayment > values.vehiclePrice) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Down payment cannot exceed vehicle price.",
          path: ["downPayment"],
        });
      }
    }

    if (
      values.inputMode === "financed-principal" &&
      values.financedPrincipal <= 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Financed principal must be greater than zero.",
        path: ["financedPrincipal"],
      });
    }

    if (
      values.earlySettlementEnabled &&
      values.earlySettlementMonth > totalMonths
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Settlement month cannot exceed the total loan months.",
        path: ["earlySettlementMonth"],
      });
    }
  });

export type CarLoanFormSchema = z.infer<typeof carLoanFormSchema>;
