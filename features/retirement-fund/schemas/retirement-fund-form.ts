import { z } from "zod";

import { SALARY_GROWTH_MODES } from "@/features/retirement-fund/types/retirement-fund";

export const retirementAccumulationFormSchema = z
  .object({
    initialBalance: z.coerce
      .number()
      .min(0, "Initial balance cannot be negative."),
    yearsToRetirement: z.coerce
      .number()
      .int("Years to retirement must be a whole number.")
      .min(1, "Years to retirement must be at least 1."),
    annualReturnRate: z.coerce
      .number()
      .min(0, "Annual return rate cannot be negative."),
    salaryGrowthMode: z.enum(SALARY_GROWTH_MODES),
    annualSalaryIncrementRate: z.coerce
      .number()
      .min(0, "Annual salary increment rate cannot be negative."),
    fixedAnnualSalaryIncrement: z.coerce
      .number()
      .min(0, "Fixed annual salary increase cannot be negative."),
    currentMonthlySalary: z.coerce.number().min(0),
    employeeContributionRate: z.coerce.number().min(0),
    employerContributionRate: z.coerce.number().min(0),
  })
  .superRefine((values, ctx) => {
    if (values.currentMonthlySalary <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly salary must be greater than zero.",
        path: ["currentMonthlySalary"],
      });
    }

    if (values.employeeContributionRate < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee contribution rate cannot be negative.",
        path: ["employeeContributionRate"],
      });
    } else if (values.employeeContributionRate > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employee contribution rate cannot exceed 100%.",
        path: ["employeeContributionRate"],
      });
    }

    if (values.employerContributionRate < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer contribution rate cannot be negative.",
        path: ["employerContributionRate"],
      });
    } else if (values.employerContributionRate > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer contribution rate cannot exceed 100%.",
        path: ["employerContributionRate"],
      });
    }

    if (
      values.employeeContributionRate + values.employerContributionRate >
      100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Combined employee and employer contribution rate cannot exceed 100%.",
        path: ["employeeContributionRate"],
      });
    }
  });

export const retirementDrawdownFormSchema = z.object({
  startingBalance: z.coerce
    .number()
    .min(0, "Starting balance cannot be negative."),
  lumpSumWithdrawal: z.coerce
    .number()
    .min(0, "Lump-sum withdrawal cannot be negative."),
  monthlyWithdrawal: z.coerce
    .number()
    .min(0, "Monthly withdrawal cannot be negative."),
  postRetirementAnnualReturnRate: z.coerce
    .number()
    .min(0, "Post-retirement annual return rate cannot be negative."),
});

export type RetirementAccumulationFormSchema = z.infer<
  typeof retirementAccumulationFormSchema
>;

export type RetirementDrawdownFormSchema = z.infer<
  typeof retirementDrawdownFormSchema
>;
