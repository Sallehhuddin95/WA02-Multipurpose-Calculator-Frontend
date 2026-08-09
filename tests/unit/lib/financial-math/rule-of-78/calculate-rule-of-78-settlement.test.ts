import { describe, expect, it } from "vitest";

import { calculateRuleOf78Settlement } from "@/lib/financial-math/rule-of-78/calculate-rule-of-78-settlement";

describe("calculateRuleOf78Settlement", () => {
  it("calculates earned interest, rebate, and settlement amount before maturity", () => {
    const settlement = calculateRuleOf78Settlement({
      financedPrincipal: 80000,
      monthlyInstalment: 1533.333333,
      settlementMonth: 12,
      totalInterest: 12000,
      totalMonths: 60,
      totalRepayableAmount: 92000,
    });

    expect(settlement.totalPaidToDate).toBeCloseTo(18400, 2);
    expect(settlement.earnedInterest).toBeCloseTo(4288.5246, 3);
    expect(settlement.unearnedInterestRebate).toBeCloseTo(7711.4754, 3);
    expect(settlement.projectedSettlementAmount).toBeCloseTo(65888.5246, 3);
  });

  it("returns zero settlement amount at full maturity", () => {
    const settlement = calculateRuleOf78Settlement({
      financedPrincipal: 80000,
      monthlyInstalment: 1533.333333,
      settlementMonth: 60,
      totalInterest: 12000,
      totalMonths: 60,
      totalRepayableAmount: 92000,
    });

    expect(settlement.projectedSettlementAmount).toBe(0);
    expect(settlement.unearnedInterestRebate).toBe(0);
  });
});
