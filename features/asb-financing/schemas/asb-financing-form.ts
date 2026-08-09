import { z } from "zod";

export const asbFinancingFormSchema = z
  .object({
    financingPrincipal: z.coerce
      .number()
      .gt(0, "Financing principal must be greater than zero."),
    financingTenureYears: z.coerce
      .number()
      .int("Financing tenure must be a whole number of years.")
      .min(1, "Financing tenure must be at least 1 year."),
    annualFinancingRate: z.coerce
      .number()
      .min(0, "Annual financing rate cannot be negative."),
    annualDividendRate: z.coerce
      .number()
      .min(0, "Annual dividend rate cannot be negative."),
    annualSideInvestmentReturnRate: z.coerce
      .number()
      .min(0, "Annual side-investment return rate cannot be negative."),
    analysisHorizonYears: z.coerce
      .number()
      .int("Analysis horizon must be a whole number of years.")
      .min(1, "Analysis horizon must be at least 1 year."),
  })
  .superRefine((values, context) => {
    if (values.analysisHorizonYears > values.financingTenureYears) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Analysis horizon cannot exceed the financing tenure.",
        path: ["analysisHorizonYears"],
      });
    }
  });

export type AsbFinancingFormSchema = z.infer<typeof asbFinancingFormSchema>;
