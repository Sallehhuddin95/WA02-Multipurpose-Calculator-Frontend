import { describe, expect, it } from "vitest";

import { projectRentVsBuy } from "@/features/rent-vs-buy/services/project-rent-vs-buy";
import type { RentVsBuyFormValues } from "@/features/rent-vs-buy/types/rent-vs-buy";

// A zero-financing-rate scenario turns the mortgage into a clean straight-line
// repayment (principal / months), so every derived value below is computable by
// hand and asserted independently of the service implementation.
function makeValues(
  overrides: Partial<RentVsBuyFormValues> = {},
): RentVsBuyFormValues {
  return {
    homePrice: 500000,
    downPaymentPercent: 10,
    annualFinancingRate: 0,
    financingTenureYears: 30,
    comparisonHorizonYears: 5,
    monthlyMaintenance: 250,
    annualCukaiTaksiran: 600,
    annualCukaiTanahOrPetak: 240,
    annualIndahWaterCost: 360,
    otherMonthlyCosts: 0,
    monthlyRent: 1200,
    annualAppreciationRate: 0,
    renterAnnualReturnRate: 0,
    ...overrides,
  };
}

describe("projectRentVsBuy", () => {
  it("computes the default calculator values into a five-year comparison", () => {
    // Mirrors the calculator's default form values.
    const result = projectRentVsBuy({
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
    });

    expect(result.loanPrincipal).toBeCloseTo(450000, 6);
    expect(result.monthlyEquivalentOwnershipCosts).toBeCloseTo(
      250 + (500 + 200 + 120) / 12,
      6,
    );
    expect(result.yearlyComparison).toHaveLength(5);
    expect(result.finalBuyerEquity).toBeGreaterThan(0);
    expect(result.finalRenterPortfolioValue).toBeGreaterThan(0);
    expect(["buy", "rent", "tied"]).toContain(result.verdict);
    expect(
      result.breakEvenYear === null ||
        (result.breakEvenYear >= 1 && result.breakEvenYear <= 5),
    ).toBe(true);
  });

  it("sizes the loan principal from the home price and down payment percent", () => {
    const result = projectRentVsBuy(makeValues());

    expect(result.loanPrincipal).toBeCloseTo(500000 * 0.9, 6);
  });

  it("finances the full home price when the down payment percent is zero", () => {
    const result = projectRentVsBuy(makeValues({ downPaymentPercent: 0 }));

    expect(result.loanPrincipal).toBeCloseTo(500000, 6);
  });

  it("handles a full down payment with a zero loan and equity equal to the home value", () => {
    const result = projectRentVsBuy(
      makeValues({ downPaymentPercent: 100, annualAppreciationRate: 0 }),
    );

    expect(result.loanPrincipal).toBeCloseTo(0, 6);
    expect(result.monthlyInstalment).toBeCloseTo(0, 6);
    // No instalment, so the budget is ownership costs only: 350.
    expect(result.buyMonthlyBudget).toBeCloseTo(350, 6);
    // Equity is the full (flat) home value every year with no loan balance.
    for (const row of result.yearlyComparison) {
      expect(row.remainingLoanBalance).toBeCloseTo(0, 6);
      expect(row.buyerEquity).toBeCloseTo(500000, 6);
    }
  });

  it("composes the buy monthly budget from instalment plus monthly ownership costs", () => {
    const result = projectRentVsBuy(makeValues());

    // Instalment: 450000 principal over 360 months at 0% is 1250 exactly.
    expect(result.monthlyInstalment).toBeCloseTo(1250, 6);
    // Ownership: 250 monthly + (600 + 240 + 360) / 12 annual.
    expect(result.monthlyEquivalentOwnershipCosts).toBeCloseTo(350, 6);
    // Budget: instalment + ownership = 1600.
    expect(result.buyMonthlyBudget).toBeCloseTo(1600, 6);
  });

  it("computes the renter investment as the positive difference between budget and rent", () => {
    const result = projectRentVsBuy(makeValues());

    // 1600 budget - 1200 rent.
    expect(result.renterMonthlyInvestment).toBeCloseTo(400, 6);
  });

  it("clamps the renter investment to zero when rent exceeds the buy budget", () => {
    const result = projectRentVsBuy(makeValues({ monthlyRent: 2000 }));

    expect(result.renterMonthlyInvestment).toBe(0);
    expect(result.finalRenterPortfolioValue).toBe(0);
    expect(
      result.yearlyComparison.every((row) => row.renterPortfolioValue === 0),
    ).toBe(true);
  });

  it("projects buyer equity as home value minus the remaining loan balance", () => {
    const result = projectRentVsBuy(makeValues());

    // Year 5: balance = 450000 - 1250 * 60 = 375000; home value stays 500000.
    const yearFive = result.yearlyComparison[4];
    expect(yearFive.remainingLoanBalance).toBeCloseTo(375000, 6);
    expect(yearFive.buyerEquity).toBeCloseTo(125000, 6);
  });

  it("compounds the renter portfolio monthly at the renter return rate", () => {
    // 400/month at 12% annual (1% monthly) for one year:
    // 400 * ((1.01^12 - 1) / 0.01) = 400 * 12.6825 = 5073.00.
    const result = projectRentVsBuy(
      makeValues({
        comparisonHorizonYears: 1,
        renterAnnualReturnRate: 12,
      }),
    );

    expect(result.yearlyComparison).toHaveLength(1);
    expect(result.finalRenterPortfolioValue).toBeCloseTo(5073.0, 2);
  });

  it("returns one row per year of the comparison horizon", () => {
    const result = projectRentVsBuy(makeValues({ comparisonHorizonYears: 7 }));

    expect(result.yearlyComparison).toHaveLength(7);
    expect(result.yearlyComparison.map((row) => row.year)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("reports the first year buyer equity reaches the portfolio as break-even", () => {
    const result = projectRentVsBuy(makeValues());

    // Buyer equity outgrows the renter portfolio from year one onward.
    expect(result.yearlyComparison[0].leader).toBe("buy");
    expect(result.breakEvenYear).toBe(1);
  });

  it("reports no break-even year and a rent verdict when the renter always leads", () => {
    const result = projectRentVsBuy(
      makeValues({
        homePrice: 360000,
        downPaymentPercent: 0,
        monthlyMaintenance: 0,
        annualCukaiTaksiran: 0,
        annualCukaiTanahOrPetak: 0,
        annualIndahWaterCost: 0,
        monthlyRent: 0,
        renterAnnualReturnRate: 12,
      }),
    );

    // Instalment = 360000 / 360 = 1000; the renter invests the full 1000/month.
    expect(result.renterMonthlyInvestment).toBeCloseTo(1000, 6);
    expect(result.breakEvenYear).toBeNull();
    expect(result.verdict).toBe("rent");
  });

  it("reports tied when equity and portfolio are exactly equal at the horizon", () => {
    const result = projectRentVsBuy(
      makeValues({
        homePrice: 360000,
        downPaymentPercent: 0,
        monthlyMaintenance: 0,
        annualCukaiTaksiran: 0,
        annualCukaiTanahOrPetak: 0,
        annualIndahWaterCost: 0,
        monthlyRent: 0,
        renterAnnualReturnRate: 0,
      }),
    );

    // 1000/month repays 12000/year; the renter invests 1000/month with 0% return.
    // Equity and portfolio both equal 12000 * N every year.
    expect(result.yearlyComparison[0].leader).toBe("tied");
    expect(result.verdict).toBe("tied");
  });

  it("sets the verdict to the leading path at the end of the horizon", () => {
    const result = projectRentVsBuy(makeValues());

    // Buyer equity 125000 outgrows the renter portfolio 24000 at year 5.
    expect(result.finalBuyerEquity).toBeCloseTo(125000, 6);
    expect(result.finalRenterPortfolioValue).toBeCloseTo(24000, 6);
    expect(result.verdict).toBe("buy");
    expect(result.verdict).toBe(result.yearlyComparison.at(-1)?.leader);
  });
});
