import type { DrawdownScenarioResult } from "@/features/retirement-fund/types/retirement-fund";
import type { Translator } from "@/lib/i18n/messages";

function pluralSuffix(count: number): string {
  return count === 1 ? "" : "s";
}

export function formatDepletionLabel(
  scenario: DrawdownScenarioResult,
  t: Translator,
): string {
  if (scenario.didNotDeplete) {
    return t("retirement.depletion.doesNotDeplete");
  }

  const years = scenario.depletionYears ?? 0;
  const months = scenario.depletionRemainingMonths ?? 0;

  if (years === 0) {
    return t("retirement.depletion.monthsOnly")
      .replace("{count}", String(months))
      .replace("{plural}", pluralSuffix(months));
  }

  if (months === 0) {
    return t("retirement.depletion.yearsOnly")
      .replace("{count}", String(years))
      .replace("{plural}", pluralSuffix(years));
  }

  return t("retirement.depletion.yearsMonths")
    .replace("{y}", String(years))
    .replace("{yPlural}", pluralSuffix(years))
    .replace("{m}", String(months))
    .replace("{mPlural}", pluralSuffix(months));
}
