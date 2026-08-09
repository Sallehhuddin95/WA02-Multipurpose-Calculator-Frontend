import { projectCompoundGrowth } from "@/lib/financial-math/compound-growth/project-compound-growth";
import type {
  CompoundInterestFormValues,
  CompoundInterestSummary,
} from "@/features/compound-interest/types/compound-interest";

export function projectCompoundInterest(
  values: CompoundInterestFormValues,
): CompoundInterestSummary {
  return projectCompoundGrowth({
    annualRate: values.annualRate,
    durationYears: values.durationYears,
    compoundingFrequency: values.compoundingFrequency,
    monthlyContribution: values.monthlyContribution,
    startingPrincipal: values.startingPrincipal,
  });
}
