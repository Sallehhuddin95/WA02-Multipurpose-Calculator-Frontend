import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PropertyInvestmentCalculator } from "@/features/property-investment";

describe("PropertyInvestmentCalculator", () => {
  it("renders the property and REIT overview by default", () => {
    render(<PropertyInvestmentCalculator />);

    expect(screen.getByText(/property overview/i)).toBeInTheDocument();
    expect(screen.getByText(/reit overview/i)).toBeInTheDocument();
    expect(screen.getByText(/strategy ranking/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purchase price/i)).toBeInTheDocument();
  });

  it("switches to the loan-principal input mode and shows the loan principal field", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    await user.click(
      screen.getByRole("radio", { name: /loan principal directly/i }),
    );

    expect(screen.getByLabelText(/^loan principal$/i)).toBeInTheDocument();
  });

  it("switches the exit assumption to an expected exit price and shows that field", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    await user.click(
      screen.getByRole("radio", { name: /expected exit price/i }),
    );

    expect(screen.getByLabelText(/^expected exit price$/i)).toBeInTheDocument();
  });

  it("shows the yearly projection table once expanded", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    const yearlyProjectionSection = screen
      .getByText(/yearly projection/i)
      .closest("section") as HTMLElement;

    expect(
      within(yearlyProjectionSection).queryByRole("table"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /show yearly projection/i }),
    );

    expect(
      within(yearlyProjectionSection).getByRole("table"),
    ).toBeInTheDocument();
    expect(
      within(yearlyProjectionSection).getByRole("columnheader", {
        name: /^loan balance$/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows validation guidance when down payment exceeds purchase price", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    fireEvent.change(screen.getByLabelText(/purchase price/i), {
      target: { value: "300000" },
    });
    fireEvent.change(screen.getByLabelText(/down payment/i), {
      target: { value: "350000" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare property and reit/i }),
    );

    expect(
      await screen.findByText(/down payment cannot exceed purchase price/i),
    ).toBeInTheDocument();
  });

  it("shows validation guidance when holding period exceeds financing tenure", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    fireEvent.change(screen.getByLabelText(/holding period/i), {
      target: { value: "40" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare property and reit/i }),
    );

    expect(
      await screen.findByText(
        /holding period cannot exceed the financing tenure/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows the MRTT payment treatment and cost field by default", () => {
    render(<PropertyInvestmentCalculator />);

    expect(
      screen.getByRole("radio", { name: /upfront cash cost/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^mrtt cost$/i)).toBeInTheDocument();
  });

  it("switches to MLTT and shows the recurring annual cost field instead", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    await user.click(
      screen.getByRole("radio", { name: /mltt \(recurring premium\)/i }),
    );

    expect(screen.getByLabelText(/annual mltt cost/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("radio", { name: /upfront cash cost/i }),
    ).not.toBeInTheDocument();
  });

  it("accepts a zero REIT initial capital without validation error", async () => {
    const user = userEvent.setup();

    render(<PropertyInvestmentCalculator />);

    fireEvent.change(screen.getByLabelText(/reit initial capital/i), {
      target: { value: "0" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare property and reit/i }),
    );

    expect(
      screen.queryByText(/reit initial capital cannot be negative/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText(/reit \(instalment-matched\)/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/reit \(instalment \+ costs\)/i).length,
    ).toBeGreaterThan(0);
  });
});
