import { z } from "zod";

import {
  ONE_OFF_INCREMENT_TYPES,
  SALARY_INCREMENT_MODES,
} from "@/features/salary-calculator/types/salary-calculator";
import type { Translator } from "@/lib/i18n/messages";

export function createSalaryProjectionFormSchema(t: Translator) {
  return z
    .object({
      projectionYears: z.coerce
        .number()
        .int(t("salary.error.projectionYears.int"))
        .min(1, t("salary.error.projectionYears.min"))
        .max(40, t("salary.error.projectionYears.max")),
      incrementMode: z.enum(SALARY_INCREMENT_MODES, {
        errorMap: () => ({ message: t("salary.error.incrementMode") }),
      }),
      annualIncrementRate: z.coerce
        .number()
        .min(0, t("salary.error.annualIncrementRate")),
      fixedAnnualIncrement: z.coerce
        .number()
        .min(0, t("salary.error.fixedAnnualIncrement")),
      oneOffIncrements: z.array(
        z.object({
          year: z.coerce
            .number()
            .int(t("salary.error.oneOffYear.int"))
            .min(1, t("salary.error.oneOffYear.min")),
          type: z.enum(ONE_OFF_INCREMENT_TYPES, {
            errorMap: () => ({ message: t("salary.error.oneOffType") }),
          }),
          value: z.coerce
            .number()
            .gt(0, t("salary.error.oneOffValue")),
        }),
      ),
    })
    .superRefine((values, ctx) => {
      values.oneOffIncrements.forEach((oneOff, index) => {
        if (oneOff.year > values.projectionYears) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["oneOffIncrements", index, "year"],
            message: t("salary.error.oneOffYear.exceeds"),
          });
        }
      });
    });
}

export type SalaryProjectionFormSchema = z.infer<
  ReturnType<typeof createSalaryProjectionFormSchema>
>;
