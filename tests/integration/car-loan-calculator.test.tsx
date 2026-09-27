import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { CarLoanCalculator } from "@/features/car-loan";

describe("CarLoanCalculator", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows an empty results panel by default and the loan summary after calculating", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/loan summary/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(screen.getByText(/loan summary/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/annual interest rate \(eir\)/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/^early settlement estimate$/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/early settlement month/i),
    ).not.toBeInTheDocument();
  });

  it("clears stale results when the next submit fails validation", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(screen.getByText(/loan summary/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/vehicle price/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/down payment/i), {
      target: { value: "60000" },
    });

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(
      await screen.findByText(/down payment cannot exceed vehicle price/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/loan summary/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
  });

  it("hides results again on reset", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(screen.getByText(/loan summary/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset inputs/i }));

    expect(screen.queryByText(/loan summary/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no results yet/i)).toBeInTheDocument();
  });

  it("shows the early settlement estimate once the toggle is enabled", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    await user.click(
      screen.getByLabelText(/i want to check an early settlement estimate/i),
    );

    expect(
      screen.getByLabelText(/early settlement month/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(screen.getByText(/^early settlement estimate$/i)).toBeInTheDocument();
  });

  it("switches to the fixed-rate option and shows the flat annual interest rate field", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    await user.click(
      screen.getByRole("radio", {
        name: /fixed rate \(rule of 78, legacy\)/i,
      }),
    );

    expect(
      screen.getByLabelText(/flat annual interest rate/i),
    ).toBeInTheDocument();
  });

  it("shows validation guidance when down payment exceeds vehicle price", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    fireEvent.change(screen.getByLabelText(/vehicle price/i), {
      target: { value: "50000" },
    });
    fireEvent.change(screen.getByLabelText(/down payment/i), {
      target: { value: "60000" },
    });

    await user.click(screen.getByRole("button", { name: /calculate loan/i }));

    expect(
      await screen.findByText(/down payment cannot exceed vehicle price/i),
    ).toBeInTheDocument();
  });
});
