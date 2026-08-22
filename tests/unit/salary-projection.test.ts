import { describe, expect, it } from "vitest";

import { calculateSalaryBreakdown } from "@/features/salary-calculator/services/calculate-salary";
import { projectSalary } from "@/features/salary-calculator/services/project-salary";
import type {
  SalaryCalculatorFormValues,
  SalaryProjectionFormValues,
} from "@/features/salary-calculator/types/salary-calculator";
import { roundToCents } from "@/utils/round-to-cents";

function makeBaseValues(
  overrides: Partial<SalaryCalculatorFormValues> = {},
): SalaryCalculatorFormValues {
  return {
    grossMonthlySalary: 5000,
    workerCategory: "malaysian",
    foreignWorkerEpfOptIn: false,
    lindung24OptIn: false,
    ...overrides,
  };
}

function makeProjection(
  overrides: Partial<SalaryProjectionFormValues> = {},
): SalaryProjectionFormValues {
  return {
    projectionYears: 5,
    incrementMode: "none",
    annualIncrementRate: 3,
    fixedAnnualIncrement: 200,
    oneOffIncrements: [],
    ...overrides,
  };
}

describe("projectSalary", () => {
  it("compounds salary by the annual percentage rate from year 2 onward", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({ incrementMode: "percentage", annualIncrementRate: 3 }),
    );

    result.yearlyProjection.forEach((row) => {
      expect(row.grossMonthlySalary).toBe(
        roundToCents(5000 * 1.03 ** (row.year - 1)),
      );
    });
  });

  it("adds the fixed ringgit amount once per year from year 2 onward", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({ incrementMode: "fixed-amount", fixedAnnualIncrement: 200 }),
    );

    result.yearlyProjection.forEach((row) => {
      expect(row.grossMonthlySalary).toBe(5000 + 200 * (row.year - 1));
    });
  });

  it("keeps the salary constant in none mode", () => {
    const result = projectSalary(makeBaseValues(), makeProjection());

    result.yearlyProjection.forEach((row) => {
      expect(row.grossMonthlySalary).toBe(5000);
    });
  });

  it("applies a one-off amount from its anchored year onward", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 4,
        oneOffIncrements: [{ year: 2, type: "amount", value: 500 }],
      }),
    );

    expect(result.yearlyProjection[0].grossMonthlySalary).toBe(5000);
    expect(result.yearlyProjection[1].grossMonthlySalary).toBe(5500);
    expect(result.yearlyProjection[2].grossMonthlySalary).toBe(5500);
    expect(result.yearlyProjection[3].grossMonthlySalary).toBe(5500);
  });

  it("compounds a one-off percentage in its anchored year and persists it", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 5,
        oneOffIncrements: [{ year: 3, type: "percentage", value: 10 }],
      }),
    );

    expect(result.yearlyProjection[0].grossMonthlySalary).toBe(5000);
    expect(result.yearlyProjection[1].grossMonthlySalary).toBe(5000);
    expect(result.yearlyProjection[2].grossMonthlySalary).toBeCloseTo(5500, 2);
    expect(result.yearlyProjection[3].grossMonthlySalary).toBeCloseTo(5500, 2);
    expect(result.yearlyProjection[4].grossMonthlySalary).toBeCloseTo(5500, 2);
  });

  it("applies recurring growth before one-off increments within each year", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 3,
        incrementMode: "percentage",
        annualIncrementRate: 3,
        oneOffIncrements: [{ year: 2, type: "amount", value: 500 }],
      }),
    );

    expect(result.yearlyProjection[0].grossMonthlySalary).toBe(5000);
    // Year 2: 5000 x 1.03 = 5150, then +500 = 5650.
    expect(result.yearlyProjection[1].grossMonthlySalary).toBeCloseTo(5650, 2);
    // Year 3: 5650 x 1.03 = 5819.5.
    expect(result.yearlyProjection[2].grossMonthlySalary).toBeCloseTo(5819.5, 2);
  });

  it("recomputes the statutory breakdown as the salary grows", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 2,
        incrementMode: "percentage",
        annualIncrementRate: 5,
      }),
    );

    const grownBreakdown = calculateSalaryBreakdown(
      makeBaseValues({ grossMonthlySalary: 5000 * 1.05 }),
    );

    expect(result.yearlyProjection[1].netMonthlySalary).toBeCloseTo(
      grownBreakdown.netMonthlySalary,
      2,
    );
    expect(result.yearlyProjection[1].totalEmployerCost).toBeCloseTo(
      grownBreakdown.totalEmployerCost,
      2,
    );
  });

  it("returns identical rows and annualised cumulative totals in none mode", () => {
    const projectionYears = 3;
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({ projectionYears }),
    );

    const baseBreakdown = calculateSalaryBreakdown(makeBaseValues());

    result.yearlyProjection.forEach((row) => {
      expect(row.netMonthlySalary).toBeCloseTo(baseBreakdown.netMonthlySalary, 2);
      expect(row.totalEmployerCost).toBeCloseTo(
        baseBreakdown.totalEmployerCost,
        2,
      );
    });

    expect(result.cumulativeNetSalary).toBeCloseTo(
      baseBreakdown.netMonthlySalary * 12 * projectionYears,
      2,
    );
    expect(result.cumulativeEmployerCost).toBeCloseTo(
      baseBreakdown.totalEmployerCost * 12 * projectionYears,
      2,
    );
  });

  it("rounds monetary values to cents", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 2,
        incrementMode: "fixed-amount",
        fixedAnnualIncrement: 123.456,
      }),
    );

    expect(result.yearlyProjection[1].grossMonthlySalary).toBe(5123.46);
    expect(result.yearlyProjection[1].netMonthlySalary).toBe(
      roundToCents(
        calculateSalaryBreakdown(
          makeBaseValues({ grossMonthlySalary: 5123.456 }),
        ).netMonthlySalary,
      ),
    );
  });

  it("returns a single row for a one-year projection", () => {
    const result = projectSalary(
      makeBaseValues(),
      makeProjection({
        projectionYears: 1,
        incrementMode: "percentage",
        annualIncrementRate: 10,
        oneOffIncrements: [{ year: 1, type: "amount", value: 300 }],
      }),
    );

    expect(result.yearlyProjection).toHaveLength(1);
    // Year 1 applies only year-1 one-offs; no recurring growth.
    expect(result.yearlyProjection[0].grossMonthlySalary).toBe(5300);
    expect(result.finalGrossMonthlySalary).toBe(5300);
  });

  it("carries the foreign worker EPF opt-in through the projection", () => {
    const baseValues = makeBaseValues({
      workerCategory: "foreign-worker",
      foreignWorkerEpfOptIn: true,
      grossMonthlySalary: 4000,
    });

    const result = projectSalary(
      baseValues,
      makeProjection({
        projectionYears: 3,
        incrementMode: "fixed-amount",
        fixedAnnualIncrement: 200,
      }),
    );

    result.yearlyProjection.forEach((row) => {
      const expected = calculateSalaryBreakdown({
        ...baseValues,
        grossMonthlySalary: row.grossMonthlySalary,
      });

      expect(row.netMonthlySalary).toBeCloseTo(expected.netMonthlySalary, 2);
      expect(row.totalEmployerCost).toBeCloseTo(expected.totalEmployerCost, 2);
    });
  });
});
