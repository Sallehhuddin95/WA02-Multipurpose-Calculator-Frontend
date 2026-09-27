import { describe, expect, it } from "vitest";

import { createRentVsBuyFormSchema } from "@/features/rent-vs-buy/schemas/rent-vs-buy-form";
import { createTranslator } from "@/lib/i18n/messages";

const schema = createRentVsBuyFormSchema(createTranslator("en"));

function makeForm(overrides: Record<string, unknown> = {}) {
  return {
    homePrice: 500000,
    downPaymentPercent: 10,
    annualFinancingRate: 4,
    financingTenureYears: 35,
    comparisonHorizonYears: 5,
    monthlyMaintenance: 250,
    annualCukaiTaksiran: 500,
    annualCukaiTanahOrPetak: 200,
    annualIndahWaterCost: 120,
    otherMonthlyCosts: 0,
    monthlyRent: 1800,
    annualAppreciationRate: 3,
    renterAnnualReturnRate: 5,
    ...overrides,
  };
}

function errorPaths(
  result: ReturnType<typeof schema.safeParse>,
): string[] {
  if (result.success) {
    return [];
  }

  return result.error.issues.map((issue) => String(issue.path[0] ?? ""));
}

describe("createRentVsBuyFormSchema", () => {
  it("accepts a valid scenario", () => {
    expect(schema.safeParse(makeForm()).success).toBe(true);
  });

  it("rejects a negative home price", () => {
    const result = schema.safeParse(makeForm({ homePrice: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("homePrice");
  });

  it("rejects a negative down payment percent", () => {
    const result = schema.safeParse(makeForm({ downPaymentPercent: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("downPaymentPercent");
  });

  it("rejects a down payment percent above 100", () => {
    const result = schema.safeParse(makeForm({ downPaymentPercent: 101 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("downPaymentPercent");
  });

  it("accepts boundary down payment percents of zero and one hundred", () => {
    expect(schema.safeParse(makeForm({ downPaymentPercent: 0 })).success).toBe(
      true,
    );
    expect(schema.safeParse(makeForm({ downPaymentPercent: 100 })).success).toBe(
      true,
    );
  });

  it("rejects a negative financing rate", () => {
    const result = schema.safeParse(makeForm({ annualFinancingRate: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("annualFinancingRate");
  });

  it("rejects a negative monthly maintenance cost", () => {
    const result = schema.safeParse(makeForm({ monthlyMaintenance: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("monthlyMaintenance");
  });

  it("rejects a negative monthly rent", () => {
    const result = schema.safeParse(makeForm({ monthlyRent: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("monthlyRent");
  });

  it("rejects negative annual ownership costs", () => {
    for (const field of [
      "annualCukaiTaksiran",
      "annualCukaiTanahOrPetak",
      "annualIndahWaterCost",
      "otherMonthlyCosts",
    ] as const) {
      const result = schema.safeParse(makeForm({ [field]: -1 }));

      expect(result.success).toBe(false);
      expect(errorPaths(result)).toContain(field);
    }
  });

  it("rejects a negative appreciation rate", () => {
    const result = schema.safeParse(makeForm({ annualAppreciationRate: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("annualAppreciationRate");
  });

  it("rejects a negative renter return rate", () => {
    const result = schema.safeParse(makeForm({ renterAnnualReturnRate: -1 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("renterAnnualReturnRate");
  });

  it("rejects a comparison horizon below 1", () => {
    const result = schema.safeParse(makeForm({ comparisonHorizonYears: 0 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("comparisonHorizonYears");
  });

  it("rejects a comparison horizon above the financing tenure", () => {
    const result = schema.safeParse(
      makeForm({ financingTenureYears: 35, comparisonHorizonYears: 36 }),
    );

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("comparisonHorizonYears");
  });

  it("accepts a comparison horizon equal to the financing tenure", () => {
    const result = schema.safeParse(
      makeForm({ financingTenureYears: 35, comparisonHorizonYears: 35 }),
    );

    expect(result.success).toBe(true);
  });

  it("rejects a non-integer financing tenure", () => {
    const result = schema.safeParse(makeForm({ financingTenureYears: 35.5 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("financingTenureYears");
  });

  it("rejects a non-integer comparison horizon", () => {
    const result = schema.safeParse(makeForm({ comparisonHorizonYears: 5.5 }));

    expect(result.success).toBe(false);
    expect(errorPaths(result)).toContain("comparisonHorizonYears");
  });
});
