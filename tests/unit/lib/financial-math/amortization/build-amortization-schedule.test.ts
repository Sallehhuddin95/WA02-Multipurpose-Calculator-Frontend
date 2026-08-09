import { describe, expect, it } from "vitest";

import {
  buildAmortizationSchedule,
  calculateMonthlyAmortizedPayment,
} from "@/lib/financial-math/amortization/build-amortization-schedule";

describe("calculateMonthlyAmortizedPayment", () => {
  it("calculates the standard reducing-balance monthly payment", () => {
    const payment = calculateMonthlyAmortizedPayment({
      principal: 50000,
      annualInterestRate: 6,
      tenureYears: 10,
    });

    expect(payment).toBeCloseTo(555.1, 1);
  });

  it("falls back to straight-line principal repayment when the rate is zero", () => {
    const payment = calculateMonthlyAmortizedPayment({
      principal: 12000,
      annualInterestRate: 0,
      tenureYears: 10,
    });

    expect(payment).toBeCloseTo(100, 2);
  });
});

describe("buildAmortizationSchedule", () => {
  it("fully amortizes the loan to zero by the final period", () => {
    const summary = buildAmortizationSchedule({
      principal: 50000,
      annualInterestRate: 6,
      tenureYears: 10,
    });

    expect(summary.totalMonths).toBe(120);
    expect(summary.schedule).toHaveLength(120);
    expect(summary.schedule.at(-1)?.remainingBalance).toBeCloseTo(0, 2);
    expect(summary.totalRepayableAmount).toBeCloseTo(
      summary.monthlyInstalment * 120,
      1,
    );
  });
});
