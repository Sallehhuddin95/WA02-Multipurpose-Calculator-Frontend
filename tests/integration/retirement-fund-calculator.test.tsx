import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RetirementFundCalculator } from "@/features/retirement-fund";

describe("RetirementFundCalculator", () => {
  it("renders both sections with default projection and drawdown results", () => {
    render(<RetirementFundCalculator />);

    expect(
      screen.getByText(/section a · retirement savings projection/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/section b · retirement fund longevity simulation/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/final capital/i).length).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/total contributions/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/total growth/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/stays invested/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/fully withdrawn/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/time to depletion/i).length).toBeGreaterThanOrEqual(
      2,
    );
  });

  it("switches Section A salary growth mode between percentage and fixed ringgit increase", async () => {
    const user = userEvent.setup();

    render(<RetirementFundCalculator />);

    expect(
      screen.getByLabelText(/annual salary increment rate/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/current monthly salary/i),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /fixed ringgit increase/i }),
    );

    expect(
      screen.queryByLabelText(/annual salary increment rate/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/fixed annual salary increase/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/current monthly salary/i),
    ).toBeInTheDocument();
  });

  it("keeps projection and depletion tables collapsed by default and expands them on demand", async () => {
    const user = userEvent.setup();

    render(<RetirementFundCalculator />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    const toggleButtons = screen.getAllByRole("button", {
      name: /show projection table/i,
    });
    expect(toggleButtons).toHaveLength(3);

    await user.click(toggleButtons[0]);

    expect(screen.getAllByRole("table")).toHaveLength(1);
  });

  it("rejects a whole-number violation for years to retirement", async () => {
    const user = userEvent.setup();

    render(<RetirementFundCalculator />);

    fireEvent.change(screen.getByLabelText(/years to retirement/i), {
      target: { value: "10.5" },
    });

    await user.click(screen.getByRole("button", { name: /project savings/i }));

    expect(
      await screen.findByText(/years to retirement must be a whole number/i),
    ).toBeInTheDocument();
  });

  it("rejects a combined employee and employer contribution rate above 100%", async () => {
    const user = userEvent.setup();

    render(<RetirementFundCalculator />);

    fireEvent.change(screen.getByLabelText(/employee contribution rate/i), {
      target: { value: "70" },
    });
    fireEvent.change(screen.getByLabelText(/employer contribution rate/i), {
      target: { value: "40" },
    });

    await user.click(screen.getByRole("button", { name: /project savings/i }));

    expect(
      await screen.findByText(
        /combined employee and employer contribution rate cannot exceed 100%/i,
      ),
    ).toBeInTheDocument();
  });

  it("reports non-depletion for both scenarios when there are no withdrawals", async () => {
    const user = userEvent.setup();

    render(<RetirementFundCalculator />);

    fireEvent.change(screen.getByLabelText(/^monthly withdrawal/i), {
      target: { value: "0" },
    });

    await user.click(
      screen.getByRole("button", { name: /simulate longevity/i }),
    );

    const depletionValues = screen
      .getAllByText(/time to depletion/i)
      .map((label) => label.closest("div"));

    depletionValues.forEach((container) => {
      expect(container).not.toBeNull();
      if (container) {
        expect(
          within(container).getByText(/does not deplete within 100 years/i),
        ).toBeInTheDocument();
      }
    });
  });
});
