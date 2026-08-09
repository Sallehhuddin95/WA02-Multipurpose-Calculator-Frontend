import type { CompoundingFrequency } from "@/features/compound-interest/types/compound-interest";

const PERIODS_PER_YEAR_BY_FREQUENCY: Record<CompoundingFrequency, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

export function formatPeriodLabel(
  period: number,
  compoundingFrequency: CompoundingFrequency,
): string {
  if (period <= 0) {
    return "Start";
  }

  const periodsPerYear = PERIODS_PER_YEAR_BY_FREQUENCY[compoundingFrequency];
  const yearNumber = Math.ceil(period / periodsPerYear);

  if (compoundingFrequency === "annually") {
    return `Year ${yearNumber}`;
  }

  const periodInYear = ((period - 1) % periodsPerYear) + 1;

  if (compoundingFrequency === "quarterly") {
    return `Year ${yearNumber} · Q${periodInYear}`;
  }

  return `Year ${yearNumber} · Month ${periodInYear}`;
}
