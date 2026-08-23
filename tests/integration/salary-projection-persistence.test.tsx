import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { SalaryCalculator } from "@/features/salary-calculator";

describe("SalaryCalculator persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores main and projection values plus the projection result after a refresh", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<SalaryCalculator />);

    fireEvent.change(screen.getByLabelText(/gross monthly salary/i), {
      target: { value: "7500" },
    });
    fireEvent.change(screen.getByLabelText(/projection years/i), {
      target: { value: "15" },
    });

    await user.click(
      screen.getByRole("button", { name: /calculate projection/i }),
    );

    expect(
      screen.getByText(/final-year gross monthly salary/i),
    ).toBeInTheDocument();

    unmount();

    render(<SalaryCalculator />);

    expect(await screen.findByDisplayValue("7500")).toBeInTheDocument();
    expect(screen.getByLabelText(/projection years/i)).toHaveValue(15);
    expect(
      await screen.findByText(/final-year gross monthly salary/i),
    ).toBeInTheDocument();
  });

  it("keeps the projection result hidden when it was never computed before refresh", async () => {
    const { unmount } = render(<SalaryCalculator />);

    fireEvent.change(screen.getByLabelText(/projection years/i), {
      target: { value: "15" },
    });

    unmount();

    render(<SalaryCalculator />);

    expect(await screen.findByDisplayValue("15")).toBeInTheDocument();
    expect(
      screen.queryByText(/final-year gross monthly salary/i),
    ).not.toBeInTheDocument();
  });
});
