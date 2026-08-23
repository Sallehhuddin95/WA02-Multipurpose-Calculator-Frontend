import { z } from "zod";

import {
  CAR_LOAN_INPUT_MODES,
  CAR_LOAN_RATE_MODES,
} from "@/features/car-loan/types/car-loan";
import type { Translator } from "@/lib/i18n/messages";

export function createCarLoanFormSchema(t: Translator) {
  return z
    .object({
      inputMode: z.enum(CAR_LOAN_INPUT_MODES),
      vehiclePrice: z.coerce
        .number()
        .min(0, t("carLoan.error.vehiclePrice.negative")),
      downPayment: z.coerce
        .number()
        .min(0, t("carLoan.error.downPayment.negative")),
      financedPrincipal: z.coerce
        .number()
        .min(0, t("carLoan.error.financedPrincipal.negative")),
      rateMode: z.enum(CAR_LOAN_RATE_MODES),
      fixedAnnualInterestRate: z.coerce
        .number()
        .min(0, t("carLoan.error.fixedAnnualInterestRate")),
      variableAnnualInterestRate: z.coerce
        .number()
        .min(0, t("carLoan.error.variableAnnualInterestRate")),
      tenureYears: z.coerce
        .number()
        .int(t("carLoan.error.tenureYears.int"))
        .min(1, t("carLoan.error.tenureYears.min")),
      earlySettlementEnabled: z.boolean(),
      earlySettlementMonth: z.coerce
        .number()
        .int(t("carLoan.error.earlySettlementMonth.int"))
        .min(1, t("carLoan.error.earlySettlementMonth.min")),
    })
    .superRefine((values, context) => {
      const totalMonths = values.tenureYears * 12;

      if (values.inputMode === "vehicle-price") {
        if (values.vehiclePrice <= 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("carLoan.error.vehiclePrice.gt"),
            path: ["vehiclePrice"],
          });
        }

        if (values.downPayment > values.vehiclePrice) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("carLoan.error.downPayment.exceeds"),
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
          message: t("carLoan.error.financedPrincipal.gt"),
          path: ["financedPrincipal"],
        });
      }

      if (
        values.earlySettlementEnabled &&
        values.earlySettlementMonth > totalMonths
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("carLoan.error.earlySettlementMonth.exceeds"),
          path: ["earlySettlementMonth"],
        });
      }
    });
}

export type CarLoanFormSchema = z.infer<
  ReturnType<typeof createCarLoanFormSchema>
>;
