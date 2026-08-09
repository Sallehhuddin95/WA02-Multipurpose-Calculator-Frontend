import { z } from "zod";

import { COMPOUNDING_FREQUENCIES } from "@/features/compound-interest/types/compound-interest";

export const compoundInterestFormSchema = z.object({
  startingPrincipal: z.coerce
    .number()
    .min(0, "Starting principal cannot be negative."),
  annualRate: z.coerce.number().min(0, "Annual rate cannot be negative."),
  durationYears: z.coerce
    .number()
    .min(0, "Duration cannot be negative.")
    .max(100, "Duration is too large for this calculator."),
  compoundingFrequency: z.enum(COMPOUNDING_FREQUENCIES, {
    message: "Select a supported compounding frequency.",
  }),
  monthlyContribution: z.coerce
    .number()
    .min(0, "Monthly contribution cannot be negative."),
});

export type CompoundInterestFormSchema = z.infer<
  typeof compoundInterestFormSchema
>;
