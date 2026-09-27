import { z } from "zod";

import type { Translator } from "@/lib/i18n/messages";

export function createRentVsBuyFormSchema(t: Translator) {
  return z
    .object({
      homePrice: z.coerce.number().gt(0, t("rentBuy.error.homePrice")),
      downPaymentPercent: z.coerce
        .number()
        .min(0, t("rentBuy.error.downPaymentPercent.negative"))
        .max(100, t("rentBuy.error.downPaymentPercent.max")),
      annualFinancingRate: z.coerce
        .number()
        .min(0, t("rentBuy.error.annualFinancingRate")),
      financingTenureYears: z.coerce
        .number()
        .int(t("rentBuy.error.financingTenureYears.int"))
        .min(1, t("rentBuy.error.financingTenureYears.min")),
      comparisonHorizonYears: z.coerce
        .number()
        .int(t("rentBuy.error.comparisonHorizonYears.int"))
        .min(1, t("rentBuy.error.comparisonHorizonYears.min")),
      monthlyMaintenance: z.coerce
        .number()
        .min(0, t("rentBuy.error.monthlyMaintenance")),
      annualCukaiTaksiran: z.coerce
        .number()
        .min(0, t("rentBuy.error.annualCukaiTaksiran")),
      annualCukaiTanahOrPetak: z.coerce
        .number()
        .min(0, t("rentBuy.error.annualCukaiTanahOrPetak")),
      annualIndahWaterCost: z.coerce
        .number()
        .min(0, t("rentBuy.error.annualIndahWaterCost")),
      otherMonthlyCosts: z.coerce
        .number()
        .min(0, t("rentBuy.error.otherMonthlyCosts")),
      monthlyRent: z.coerce.number().min(0, t("rentBuy.error.monthlyRent")),
      annualAppreciationRate: z.coerce
        .number()
        .min(0, t("rentBuy.error.annualAppreciationRate")),
      renterAnnualReturnRate: z.coerce
        .number()
        .min(0, t("rentBuy.error.renterAnnualReturnRate")),
    })
    .superRefine((values, context) => {
      if (values.comparisonHorizonYears > values.financingTenureYears) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("rentBuy.error.comparisonHorizonYears.exceeds"),
          path: ["comparisonHorizonYears"],
        });
      }
    });
}

export type RentVsBuyFormSchema = z.infer<
  ReturnType<typeof createRentVsBuyFormSchema>
>;
