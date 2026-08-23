import { describe, expect, it } from "vitest";

import { formatPeriodLabel } from "@/features/compound-interest/utils/format-period-label";
import { formatDepletionLabel } from "@/features/retirement-fund/utils/format-depletion-label";
import type { DrawdownScenarioResult } from "@/features/retirement-fund/types/retirement-fund";
import { createTranslator } from "@/lib/i18n/messages";
import { formatCurrency } from "@/utils/format-currency";

const tEn = createTranslator("en");
const tMs = createTranslator("ms");

function makeScenario(
  overrides: Partial<DrawdownScenarioResult>,
): DrawdownScenarioResult {
  return {
    depletedAtMonth: null,
    depletionYears: null,
    depletionRemainingMonths: null,
    didNotDeplete: false,
    monthlyRows: [],
    ...overrides,
  };
}

describe("formatPeriodLabel", () => {
  it("renders the start label and English year/quarter/month templates", () => {
    expect(formatPeriodLabel(0, "annually", tEn)).toBe("Start");
    expect(formatPeriodLabel(2, "annually", tEn)).toBe("Year 2");
    expect(formatPeriodLabel(2, "quarterly", tEn)).toBe("Year 1 · Q2");
    expect(formatPeriodLabel(2, "monthly", tEn)).toBe("Year 1 · Month 2");
  });

  it("renders Malay templates without pluralization", () => {
    expect(formatPeriodLabel(0, "annually", tMs)).toBe("Mula");
    expect(formatPeriodLabel(2, "annually", tMs)).toBe("Tahun 2");
    expect(formatPeriodLabel(3, "annually", tMs)).toBe("Tahun 3");
    expect(formatPeriodLabel(2, "quarterly", tMs)).toBe("Tahun 1 · Suku 2");
    expect(formatPeriodLabel(2, "monthly", tMs)).toBe("Tahun 1 · Bulan 2");
  });
});

describe("formatDepletionLabel", () => {
  it("reports non-depletion in both locales", () => {
    const scenario = makeScenario({ didNotDeplete: true });

    expect(formatDepletionLabel(scenario, tEn)).toBe(
      "Does not deplete within 100 years",
    );
    expect(formatDepletionLabel(scenario, tMs)).toBe(
      "Tidak berkurangan dalam tempoh 100 tahun",
    );
  });

  it("renders months-only in English with pluralization", () => {
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: null, depletionRemainingMonths: 3 }),
        tEn,
      ),
    ).toBe("3 months");
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: null, depletionRemainingMonths: 1 }),
        tEn,
      ),
    ).toBe("1 month");
  });

  it("renders years-only and combined years/months in English", () => {
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: 2, depletionRemainingMonths: 0 }),
        tEn,
      ),
    ).toBe("2 years");
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: 3, depletionRemainingMonths: 2 }),
        tEn,
      ),
    ).toBe("3 years 2 months");
  });

  it("renders Malay durations without any plural suffix", () => {
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: null, depletionRemainingMonths: 3 }),
        tMs,
      ),
    ).toBe("3 bulan");
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: 1, depletionRemainingMonths: 0 }),
        tMs,
      ),
    ).toBe("1 tahun");
    expect(
      formatDepletionLabel(
        makeScenario({ depletionYears: 3, depletionRemainingMonths: 2 }),
        tMs,
      ),
    ).toBe("3 tahun 2 bulan");
  });
});

describe("formatCurrency locale", () => {
  it("produces identical output for en-MY and ms-MY", () => {
    expect(formatCurrency(1250, "en-MY")).toBe(formatCurrency(1250, "ms-MY"));
    expect(formatCurrency(1234567.89, "en-MY")).toBe(
      formatCurrency(1234567.89, "ms-MY"),
    );
  });

  it("keeps the default en-MY output unchanged", () => {
    expect(formatCurrency(1250)).toBe(formatCurrency(1250, "en-MY"));
    expect(formatCurrency(1250)).toContain("1,250.00");
  });
});
