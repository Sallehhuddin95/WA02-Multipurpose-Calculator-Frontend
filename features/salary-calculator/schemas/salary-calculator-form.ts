import { z } from "zod";

import { WORKER_CATEGORIES } from "@/features/salary-calculator/types/salary-calculator";
import type { Translator } from "@/lib/i18n/messages";

export function createSalaryCalculatorFormSchema(t: Translator) {
  return z.object({
    grossMonthlySalary: z.coerce
      .number()
      .gt(0, t("salary.error.grossMonthlySalary")),
    workerCategory: z.enum(WORKER_CATEGORIES, {
      errorMap: () => ({ message: t("salary.error.workerCategory") }),
    }),
    foreignWorkerEpfOptIn: z.boolean(),
    lindung24OptIn: z.boolean(),
    employeeEpfRate: z.coerce
      .number()
      .min(0, t("salary.error.epfRate.negative"))
      .max(100, t("salary.error.epfRate.max"))
      .optional(),
    employerEpfRate: z.coerce
      .number()
      .min(0, t("salary.error.epfRate.negative"))
      .max(100, t("salary.error.epfRate.max"))
      .optional(),
  });
}

export type SalaryCalculatorFormSchema = z.infer<
  ReturnType<typeof createSalaryCalculatorFormSchema>
>;
