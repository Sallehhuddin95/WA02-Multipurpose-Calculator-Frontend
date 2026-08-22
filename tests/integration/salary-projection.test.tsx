import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SalaryCalculator } from "@/features/salary-calculator";

describe("SalaryCalculator salary projection", () => {
  it("renders the three increment mode controls", () => {
    render(<SalaryCalculator />);

    expect(screen.getByRole("button", { name: "Percentage" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fixed amount" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "None" })).toBeInTheDocument();
  });

  it("shows and hides the conditional increment input per mode", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    // Default mode is none, so no conditional input is shown.
    expect(
      screen.queryByLabelText(/Annual increment rate/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Fixed annual increment/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Percentage" }));
    expect(screen.getByLabelText(/Annual increment rate/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Fixed annual increment/i),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fixed amount" }));
    expect(
      screen.queryByLabelText(/Annual increment rate/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/Fixed annual increment/i),
    ).toBeInTheDocument();
  });

  it("adds and removes one-off increment rows", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    expect(screen.queryByLabelText(/^Year$/)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Add one-off increment" }),
    );

    expect(screen.getByLabelText(/^Year$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Type$/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Value$/)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Remove one-off increment 1" }),
    );

    expect(screen.queryByLabelText(/^Year$/)).not.toBeInTheDocument();
  });

  it("renders the yearly projection table and summary metrics on submit", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    expect(
      screen.queryByText("Yearly Salary Projection"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Calculate projection" }),
    );

    expect(screen.getByText("Final-year gross monthly salary")).toBeInTheDocument();
    expect(screen.getByText("Final-year net monthly salary")).toBeInTheDocument();
    expect(screen.getByText("Cumulative net salary")).toBeInTheDocument();
    expect(screen.getByText("Cumulative employer cost")).toBeInTheDocument();
    expect(screen.getByText("Yearly Salary Projection")).toBeInTheDocument();
  });

  it("shows validation error when a one-off year exceeds the projection horizon", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    fireEvent.change(screen.getByLabelText(/Projection years/i), {
      target: { value: "2" },
    });
    await user.click(
      screen.getByRole("button", { name: "Add one-off increment" }),
    );
    fireEvent.change(screen.getByLabelText(/^Year$/), {
      target: { value: "5" },
    });

    await user.click(
      screen.getByRole("button", { name: "Calculate projection" }),
    );

    expect(
      await screen.findByText("Increment year cannot exceed the projection horizon."),
    ).toBeInTheDocument();
  });

  it("keeps the yearly projection collapsed by default and expandable", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    await user.click(
      screen.getByRole("button", { name: "Calculate projection" }),
    );

    const summary = screen.getByText("Yearly Salary Projection");
    const details = summary.closest("details") as HTMLDetailsElement | null;
    expect(details).not.toBeNull();
    if (!details) return;

    expect(details).not.toHaveAttribute("open");

    await user.click(summary);
    expect(details).toHaveAttribute("open");
  });

  it("does not change the monthly breakdown when projection inputs change", async () => {
    const user = userEvent.setup();
    render(<SalaryCalculator />);

    const netSalaryMetric = () =>
      screen.getAllByText("Net take-home salary")[0].nextElementSibling
        ?.textContent;

    const before = netSalaryMetric();

    fireEvent.change(screen.getByLabelText(/Projection years/i), {
      target: { value: "40" },
    });
    await user.click(screen.getByRole("button", { name: "Percentage" }));
    await user.click(
      screen.getByRole("button", { name: "Add one-off increment" }),
    );

    expect(netSalaryMetric()).toBe(before);
  });
});
