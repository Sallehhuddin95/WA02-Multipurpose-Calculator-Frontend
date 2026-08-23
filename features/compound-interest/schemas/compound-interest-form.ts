import { z } from "zod";

import { COMPOUNDING_FREQUENCIES } from "@/features/compound-interest/types/compound-interest";
import type { Translator } from "@/lib/i18n/messages";

export function createCompoundInterestFormSchema(t: Translator) {
  return z.object({
    startingPrincipal: z.coerce
      .number()
      .min(0, t("compound.error.startingPrincipal")),
    annualRate: z.coerce.number().min(0, t("compound.error.annualRate")),
    durationYears: z.coerce
      .number()
      .min(0, t("compound.error.durationYears.negative"))
      .max(100, t("compound.error.durationYears.tooLarge")),
    compoundingFrequency: z.enum(COMPOUNDING_FREQUENCIES, {
      message: t("compound.error.compoundingFrequency"),
    }),
    monthlyContribution: z.coerce
      .number()
      .min(0, t("compound.error.monthlyContribution")),
  });
}

export type CompoundInterestFormSchema = z.infer<
  ReturnType<typeof createCompoundInterestFormSchema>
>;
