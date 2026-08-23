import { z } from "zod";

import type { Translator } from "@/lib/i18n/messages";

export function createAsbFinancingFormSchema(t: Translator) {
  return z
    .object({
      financingPrincipal: z.coerce
        .number()
        .gt(0, t("asb.error.financingPrincipal")),
      financingTenureYears: z.coerce
        .number()
        .int(t("asb.error.financingTenureYears.int"))
        .min(1, t("asb.error.financingTenureYears.min")),
      annualFinancingRate: z.coerce
        .number()
        .min(0, t("asb.error.annualFinancingRate")),
      annualDividendRate: z.coerce
        .number()
        .min(0, t("asb.error.annualDividendRate")),
      annualSideInvestmentReturnRate: z.coerce
        .number()
        .min(0, t("asb.error.annualSideInvestmentReturnRate")),
      analysisHorizonYears: z.coerce
        .number()
        .int(t("asb.error.analysisHorizonYears.int"))
        .min(1, t("asb.error.analysisHorizonYears.min")),
    })
    .superRefine((values, context) => {
      if (values.analysisHorizonYears > values.financingTenureYears) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("asb.error.analysisHorizonYears.exceeds"),
          path: ["analysisHorizonYears"],
        });
      }
    });
}

export type AsbFinancingFormSchema = z.infer<
  ReturnType<typeof createAsbFinancingFormSchema>
>;
