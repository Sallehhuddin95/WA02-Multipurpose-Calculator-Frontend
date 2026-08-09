import { describe, expect, it } from "vitest";

import { projectCompoundGrowth } from "@/lib/financial-math/compound-growth/project-compound-growth";

describe("projectCompoundGrowth", () => {
  it("projects principal-only growth for annual compounding", () => {
    const summary = projectCompoundGrowth({
      annualRate: 10,
      durationYears: 2,
      compoundingFrequency: "annually",
      monthlyContribution: 0,
      startingPrincipal: 1000,
    });

    expect(summary.totalContributions).toBe(1000);
    expect(summary.finalProjectedBalance).toBeCloseTo(1210, 2);
    expect(summary.totalGrowth).toBeCloseTo(210, 2);
  });

  it("adds monthly contributions under monthly compounding", () => {
    const summary = projectCompoundGrowth({
      annualRate: 12,
      durationYears: 1,
      compoundingFrequency: "monthly",
      monthlyContribution: 100,
      startingPrincipal: 0,
    });

    expect(summary.totalContributions).toBe(1200);
    expect(summary.finalProjectedBalance).toBeGreaterThan(1200);
    expect(summary.projection).toHaveLength(12);
  });
});
