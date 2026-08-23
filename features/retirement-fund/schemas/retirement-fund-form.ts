import { z } from "zod";

import { SALARY_GROWTH_MODES } from "@/features/retirement-fund/types/retirement-fund";
import type { Translator } from "@/lib/i18n/messages";

export function createRetirementAccumulationFormSchema(t: Translator) {
  return z
    .object({
      initialBalance: z.coerce
        .number()
        .min(0, t("retirement.error.initialBalance")),
      yearsToRetirement: z.coerce
        .number()
        .int(t("retirement.error.yearsToRetirement.int"))
        .min(1, t("retirement.error.yearsToRetirement.min")),
      annualReturnRate: z.coerce
        .number()
        .min(0, t("retirement.error.annualReturnRate")),
      salaryGrowthMode: z.enum(SALARY_GROWTH_MODES),
      annualSalaryIncrementRate: z.coerce
        .number()
        .min(0, t("retirement.error.annualSalaryIncrementRate")),
      fixedAnnualSalaryIncrement: z.coerce
        .number()
        .min(0, t("retirement.error.fixedAnnualSalaryIncrement")),
      currentMonthlySalary: z.coerce.number().min(0),
      employeeContributionRate: z.coerce.number().min(0),
      employerContributionRate: z.coerce.number().min(0),
    })
    .superRefine((values, ctx) => {
      if (values.currentMonthlySalary <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.currentMonthlySalary"),
          path: ["currentMonthlySalary"],
        });
      }

      if (values.employeeContributionRate < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.employeeContributionRate.negative"),
          path: ["employeeContributionRate"],
        });
      } else if (values.employeeContributionRate > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.employeeContributionRate.max"),
          path: ["employeeContributionRate"],
        });
      }

      if (values.employerContributionRate < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.employerContributionRate.negative"),
          path: ["employerContributionRate"],
        });
      } else if (values.employerContributionRate > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.employerContributionRate.max"),
          path: ["employerContributionRate"],
        });
      }

      if (
        values.employeeContributionRate + values.employerContributionRate >
        100
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t("retirement.error.combinedContributionRate"),
          path: ["employeeContributionRate"],
        });
      }
    });
}

export function createRetirementDrawdownFormSchema(t: Translator) {
  return z.object({
    startingBalance: z.coerce
      .number()
      .min(0, t("retirement.error.startingBalance")),
    lumpSumWithdrawal: z.coerce
      .number()
      .min(0, t("retirement.error.lumpSumWithdrawal")),
    monthlyWithdrawal: z.coerce
      .number()
      .min(0, t("retirement.error.monthlyWithdrawal")),
    postRetirementAnnualReturnRate: z.coerce
      .number()
      .min(0, t("retirement.error.postRetirementAnnualReturnRate")),
  });
}

export type RetirementAccumulationFormSchema = z.infer<
  ReturnType<typeof createRetirementAccumulationFormSchema>
>;

export type RetirementDrawdownFormSchema = z.infer<
  ReturnType<typeof createRetirementDrawdownFormSchema>
>;
