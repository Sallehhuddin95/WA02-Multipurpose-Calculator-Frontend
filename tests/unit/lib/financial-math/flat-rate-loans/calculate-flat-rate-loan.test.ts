import { describe, expect, it } from "vitest";

import { calculateFlatRateLoan } from "@/lib/financial-math/flat-rate-loans/calculate-flat-rate-loan";

describe("calculateFlatRateLoan", () => {
  it("calculates total interest, total repayable amount, and monthly instalment", () => {
    const summary = calculateFlatRateLoan({
      financedPrincipal: 80000,
      flatAnnualInterestRate: 3,
      tenureYears: 5,
    });

    expect(summary.totalInterest).toBeCloseTo(12000, 2);
    expect(summary.totalRepayableAmount).toBeCloseTo(92000, 2);
    expect(summary.monthlyInstalment).toBeCloseTo(1533.3333, 3);
    expect(summary.totalMonths).toBe(60);
  });
});
