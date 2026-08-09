import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CompoundInterestCalculator } from "@/features/compound-interest";

describe("CompoundInterestCalculator", () => {
  it("renders a projection summary from the default scenario", () => {
    render(<CompoundInterestCalculator />);

    expect(screen.getByText(/projected balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly contribution/i)).toBeInTheDocument();
  });

  it("shows validation guidance when annual rate is negative", async () => {
    const user = userEvent.setup();

    render(<CompoundInterestCalculator />);

    const annualRateInput = screen.getByLabelText(/annual rate/i);
    fireEvent.change(annualRateInput, { target: { value: "-4" } });

    await user.click(screen.getByRole("button", { name: /calculate growth/i }));

    expect(
      await screen.findByText(/annual rate cannot be negative/i),
    ).toBeInTheDocument();
  });
});
