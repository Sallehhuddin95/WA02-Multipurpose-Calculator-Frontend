import { z } from "zod";

import { WORKER_CATEGORIES } from "@/features/salary-calculator/types/salary-calculator";

export const salaryCalculatorFormSchema = z.object({
  grossMonthlySalary: z.coerce
    .number()
    .gt(0, "Gross monthly salary must be greater than zero."),
  workerCategory: z.enum(WORKER_CATEGORIES, {
    errorMap: () => ({ message: "Please select a worker category." }),
  }),
  foreignWorkerEpfOptIn: z.boolean(),
  lindung24OptIn: z.boolean(),
  employeeEpfRate: z.coerce.number().min(0, "EPF rate cannot be negative.").max(100, "EPF rate cannot exceed 100%.").optional(),
  employerEpfRate: z.coerce.number().min(0, "EPF rate cannot be negative.").max(100, "EPF rate cannot exceed 100%.").optional(),
});

export type SalaryCalculatorFormSchema = z.infer<typeof salaryCalculatorFormSchema>;
