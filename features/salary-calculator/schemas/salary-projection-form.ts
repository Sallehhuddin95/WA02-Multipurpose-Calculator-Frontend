import { z } from "zod";

import {
  ONE_OFF_INCREMENT_TYPES,
  SALARY_INCREMENT_MODES,
} from "@/features/salary-calculator/types/salary-calculator";

export const salaryProjectionFormSchema = z
  .object({
    projectionYears: z.coerce
      .number()
      .int("Projection years must be a whole number.")
      .min(1, "Projection years must be at least 1.")
      .max(40, "Projection years cannot exceed 40."),
    incrementMode: z.enum(SALARY_INCREMENT_MODES, {
      errorMap: () => ({ message: "Please select an increment mode." }),
    }),
    annualIncrementRate: z.coerce
      .number()
      .min(0, "Annual increment rate cannot be negative."),
    fixedAnnualIncrement: z.coerce
      .number()
      .min(0, "Fixed annual increment cannot be negative."),
    oneOffIncrements: z.array(
      z.object({
        year: z.coerce
          .number()
          .int("One-off increment year must be a whole number.")
          .min(1, "One-off increment year must be at least 1."),
        type: z.enum(ONE_OFF_INCREMENT_TYPES, {
          errorMap: () => ({ message: "Please select a one-off increment type." }),
        }),
        value: z.coerce
          .number()
          .gt(0, "One-off increment value must be greater than zero."),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    values.oneOffIncrements.forEach((oneOff, index) => {
      if (oneOff.year > values.projectionYears) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["oneOffIncrements", index, "year"],
          message: "Increment year cannot exceed the projection horizon.",
        });
      }
    });
  });

export type SalaryProjectionFormSchema = z.infer<
  typeof salaryProjectionFormSchema
>;
