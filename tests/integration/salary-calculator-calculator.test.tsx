import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SalaryCalculator } from "@/features/salary-calculator";

describe("SalaryCalculator", () => {
  it("renders default breakdown and result panels", () => {
    render(<SalaryCalculator />);

    expect(screen.getByText(/Employee Breakdown/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Employer Cost/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Net take-home salary/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Total employer cost/i).length).toBeGreaterThan(0);
  });

  it("renders all four deduction lines for default Malaysian scenario", () => {
    render(<SalaryCalculator />);

    expect(screen.getAllByText("EPF (Employee)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SOCSO").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EIS (SIP)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("PCB (MTD)").length).toBeGreaterThan(0);
  });

  it("shows employer contribution lines", () => {
    render(<SalaryCalculator />);

    expect(screen.getAllByText("EPF (Employer)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SOCSO (Employer)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EIS (Employer)").length).toBeGreaterThan(0);
  });

  it("shows radio buttons for all three worker categories", () => {
    render(<SalaryCalculator />);

    expect(screen.getByText("Malaysian citizen")).toBeInTheDocument();
    expect(screen.getByText("Permanent resident")).toBeInTheDocument();
    expect(screen.getByText("Foreign worker")).toBeInTheDocument();
  });

  it("shows EPF opt-in toggle for foreign worker", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    const foreignOption = screen.getByText("Foreign worker");
    await user.click(foreignOption);

    expect(screen.getByText(/Opt in to EPF contributions/i)).toBeInTheDocument();
  });

  it("hides EPF opt-in for Malaysian citizen", () => {
    render(<SalaryCalculator />);

    expect(screen.queryByText(/Opt in to EPF contributions/i)).not.toBeInTheDocument();
  });

  it("shows Lindung24 checkbox", () => {
    render(<SalaryCalculator />);

    expect(screen.getByText(/Lindung24 protection/i)).toBeInTheDocument();
  });

  it("shows annualised projection when details are expanded", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    const summary = screen.getByText("Annualised Projection");
    await user.click(summary);

    expect(screen.getByText("Annual net take-home")).toBeInTheDocument();
    expect(screen.getByText("Annual employer cost")).toBeInTheDocument();
  });

  it("shows validation error for negative salary", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    const salaryInput = screen.getByLabelText(/Gross monthly salary/i);
    fireEvent.change(salaryInput, { target: { value: "-1000" } });

    await user.click(screen.getByRole("button", { name: /calculate breakdown/i }));

    expect(
      await screen.findByText(/Gross monthly salary must be greater than zero/i),
    ).toBeInTheDocument();
  });

  it("recalculates when gross salary changes and form is submitted", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    const salaryInput = screen.getByLabelText(/Gross monthly salary/i);
    fireEvent.change(salaryInput, { target: { value: "7500" } });

    await user.click(screen.getByRole("button", { name: /calculate breakdown/i }));

    const grossValues = screen.getAllByText(/7,\s*500/i);
    expect(grossValues.length).toBeGreaterThan(0);
  });
});
