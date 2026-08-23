import { describe, expect, it } from "vitest";

import { calculateSalaryBreakdown } from "@/features/salary-calculator/services/calculate-salary";
import type { SalaryCalculatorFormValues } from "@/features/salary-calculator/types/salary-calculator";

function makeValues(overrides: Partial<SalaryCalculatorFormValues> = {}): SalaryCalculatorFormValues {
  return {
    grossMonthlySalary: 5000,
    workerCategory: "malaysian",
    foreignWorkerEpfOptIn: false,
    lindung24OptIn: false,
    ...overrides,
  };
}

describe("calculateSalaryBreakdown", () => {
  describe("malaysian citizen under 60", () => {
    it("calculates EPF employee 11% and employer 12% for salary > 5000", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 6000 }));

      const epfEmployee = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.epfEmployee");
      const epfEmployer = result.employerContributions.find((c) => c.labelKey === "salary.deduction.epfEmployer");

      expect(epfEmployee?.employeeAmount).toBeCloseTo(660, 2);
      expect(epfEmployer?.employerAmount).toBeCloseTo(720, 2);
    });

    it("calculates EPF employee 11% and employer 13% for salary <= 5000", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 4000 }));

      const epfEmployer = result.employerContributions.find((c) => c.labelKey === "salary.deduction.epfEmployer");
      expect(epfEmployer?.employerAmount).toBeCloseTo(520, 2);
    });

    it("calculates SOCSO using First Category schedule", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 3000 }));

      const socso = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.socso");
      expect(socso).toBeDefined();
      expect(socso!.employeeAmount).toBeGreaterThan(0);
    });

    it("calculates EIS at 0.2% capped at RM4000", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 5000 }));

      const eis = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.eis");
      expect(eis?.employeeAmount).toBeCloseTo(8, 2);
    });

    it("calculates PCB progressively with EPF relief", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 5000 }));

      const pcb = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.pcb");
      expect(pcb).toBeDefined();
      expect(pcb!.employeeAmount).toBeGreaterThan(0);
    });

    it("net salary equals gross minus all deductions", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 5000 }));

      const totalDeductions = result.employeeDeductions.reduce(
        (sum, d) => sum + d.employeeAmount,
        0,
      );
      expect(result.netMonthlySalary).toBeCloseTo(5000 - totalDeductions, 2);
    });

    it("total employer cost equals gross plus all employer contributions", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 5000 }));

      const totalEmp = result.employerContributions.reduce(
        (sum, c) => sum + c.employerAmount,
        0,
      );
      expect(result.totalEmployerCost).toBeCloseTo(5000 + totalEmp, 2);
    });
  });

  describe("custom EPF rates", () => {
    it("uses custom employee and employer EPF rates when provided", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ grossMonthlySalary: 5000, employeeEpfRate: 9, employerEpfRate: 14 }),
      );

      const epfEmployee = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.epfEmployee");
      const epfEmployer = result.employerContributions.find((c) => c.labelKey === "salary.deduction.epfEmployer");

      expect(epfEmployee?.employeeAmount).toBeCloseTo(450, 2);
      expect(epfEmployer?.employerAmount).toBeCloseTo(700, 2);
    });

    it("falls back to statutory rates when custom rates are not provided", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 5000 }));

      const epfEmployee = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.epfEmployee");
      expect(epfEmployee?.employeeAmount).toBeCloseTo(550, 2);
    });
  });

  describe("foreign worker", () => {
    it("shows no EPF by default", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ workerCategory: "foreign-worker", grossMonthlySalary: 4000 }),
      );

      const epf = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.epfEmployee");
      expect(epf).toBeUndefined();
    });

    it("applies EPF employee 11% and employer flat RM5 when opted in", () => {
      const result = calculateSalaryBreakdown(
        makeValues({
          workerCategory: "foreign-worker",
          grossMonthlySalary: 4000,
          foreignWorkerEpfOptIn: true,
        }),
      );

      const epfEmployee = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.epfEmployee");
      const epfEmployer = result.employerContributions.find((c) => c.labelKey === "salary.deduction.epfEmployer");

      expect(epfEmployee?.employeeAmount).toBeCloseTo(440, 2);
      expect(epfEmployer?.employerAmount).toBe(5);
    });

    it("applies SOCSO Employment Injury only (no Invalidity)", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ workerCategory: "foreign-worker", grossMonthlySalary: 3000 }),
      );

      const socso = result.employeeDeductions.find(
        (d) => d.labelKey === "salary.deduction.socsoEmploymentInjury",
      );
      expect(socso).toBeDefined();
      expect(socso!.employeeAmount).toBeGreaterThan(0);
    });

    it("does not charge EIS", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ workerCategory: "foreign-worker" }),
      );

      const eis = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.eis");
      expect(eis).toBeUndefined();
    });

    it("applies flat 30% PCB rate", () => {
      const result = calculateSalaryBreakdown(
        makeValues({
          workerCategory: "foreign-worker",
          grossMonthlySalary: 4000,
          foreignWorkerEpfOptIn: true,
        }),
      );

      const pcb = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.pcb");
      expect(pcb?.employeeAmount).toBeCloseTo(1200, 2);
    });
  });

  describe("Lindung24", () => {
    it("adds Lindung24 deduction when opted in", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ lindung24OptIn: true, grossMonthlySalary: 3000 }),
      );

      const lindung = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.lindung24");
      expect(lindung).toBeDefined();
      expect(lindung!.employeeAmount).toBeGreaterThan(0);
    });

    it("does not add Lindung24 when opted out", () => {
      const result = calculateSalaryBreakdown(makeValues({ lindung24OptIn: false }));

      const lindung = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.lindung24");
      expect(lindung).toBeUndefined();
    });

    it("does not affect other statutory deductions", () => {
      const without = calculateSalaryBreakdown(makeValues({ lindung24OptIn: false }));
      const withLindung = calculateSalaryBreakdown(makeValues({ lindung24OptIn: true }));

      const withoutPcb = without.employeeDeductions.find((d) => d.labelKey === "salary.deduction.pcb");
      const withPcb = withLindung.employeeDeductions.find((d) => d.labelKey === "salary.deduction.pcb");
      expect(withoutPcb?.employeeAmount).toBe(withPcb?.employeeAmount);
    });
  });

  describe("edge cases", () => {
    it("returns zero PCB when chargeable income is zero", () => {
      const result = calculateSalaryBreakdown(
        makeValues({ grossMonthlySalary: 300 }),
      );

      const pcb = result.employeeDeductions.find((d) => d.labelKey === "salary.deduction.pcb");
      expect(pcb?.employeeAmount).toBe(0);
    });

    it("handles very high salary gracefully", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 100000 }));

      expect(result.netMonthlySalary).toBeGreaterThan(0);
      expect(result.totalEmployerCost).toBeGreaterThan(100000);
    });

    it("handles minimum viable salary", () => {
      const result = calculateSalaryBreakdown(makeValues({ grossMonthlySalary: 1500 }));

      expect(result.netMonthlySalary).toBeGreaterThan(0);
      expect(result.employeeDeductions).toHaveLength(4);
    });
  });
});
