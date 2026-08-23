import type { CompoundingFrequency } from "@/features/compound-interest/types/compound-interest";
import type { Translator } from "@/lib/i18n/messages";

const PERIODS_PER_YEAR_BY_FREQUENCY: Record<CompoundingFrequency, number> = {
  annually: 1,
  quarterly: 4,
  monthly: 12,
};

export function formatPeriodLabel(
  period: number,
  compoundingFrequency: CompoundingFrequency,
  t: Translator,
): string {
  if (period <= 0) {
    return t("period.start");
  }

  const periodsPerYear = PERIODS_PER_YEAR_BY_FREQUENCY[compoundingFrequency];
  const yearNumber = Math.ceil(period / periodsPerYear);

  if (compoundingFrequency === "annually") {
    return t("period.year").replace("{n}", String(yearNumber));
  }

  const periodInYear = ((period - 1) % periodsPerYear) + 1;

  if (compoundingFrequency === "quarterly") {
    return t("period.yearQuarter")
      .replace("{n}", String(yearNumber))
      .replace("{q}", String(periodInYear));
  }

  return t("period.yearMonth")
    .replace("{n}", String(yearNumber))
    .replace("{m}", String(periodInYear));
}
