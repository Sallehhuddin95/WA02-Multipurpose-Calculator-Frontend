import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { AsbFinancingCalculator } from "@/features/asb-financing";

describe("AsbFinancingCalculator", () => {
  it("renders all three strategy comparisons from the default scenario", () => {
    render(<AsbFinancingCalculator />);

    expect(screen.getByText(/financing overview/i)).toBeInTheDocument();
    expect(screen.getAllByText(/compounding strategy/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText(/dividend-offset strategy/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/direct asb strategy/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getByLabelText(/annual side-investment return rate/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/side investment value/i).length).toBe(4);
    expect(screen.getAllByText(/surrender value/i).length).toBe(5);
    expect(screen.getByText(/not applicable/i)).toBeInTheDocument();
    expect(screen.getByText(/strategy ranking/i)).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText(/what do these numbers mean/i)).toBeInTheDocument();
  });

  it("shows validation guidance when the analysis horizon exceeds the financing tenure", async () => {
    const user = userEvent.setup();

    render(<AsbFinancingCalculator />);

    fireEvent.change(screen.getByLabelText(/financing tenure/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/analysis horizon/i), {
      target: { value: "8" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare strategies/i }),
    );

    expect(
      await screen.findByText(
        /analysis horizon cannot exceed the financing tenure/i,
      ),
    ).toBeInTheDocument();
  });
});
