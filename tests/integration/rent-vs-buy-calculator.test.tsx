import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RentVsBuyCalculator } from "@/features/rent-vs-buy";

describe("RentVsBuyCalculator", () => {
  it("renders the overview, verdict, and projection sections with default results", () => {
    render(<RentVsBuyCalculator />);

    expect(screen.getByText(/comparison overview/i)).toBeInTheDocument();
    expect(screen.getByText(/^verdict$/i)).toBeInTheDocument();
    expect(screen.getByText(/yearly comparison/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /compare rent and buy/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /show yearly projection/i }),
    ).toBeInTheDocument();
  });

  it("surfaces a field error when the comparison horizon exceeds the financing tenure", async () => {
    const user = userEvent.setup();

    render(<RentVsBuyCalculator />);

    fireEvent.change(screen.getByLabelText(/financing tenure/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/comparison horizon/i), {
      target: { value: "8" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare rent and buy/i }),
    );

    expect(
      await screen.findByText(
        /comparison horizon cannot exceed the financing tenure/i,
      ),
    ).toBeInTheDocument();
  });

  it("updates the yearly table row count when the horizon changes", async () => {
    const user = userEvent.setup();

    render(<RentVsBuyCalculator />);

    await user.click(
      screen.getByRole("button", { name: /show yearly projection/i }),
    );

    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(6); // header + 5 years

    fireEvent.change(screen.getByLabelText(/comparison horizon/i), {
      target: { value: "3" },
    });
    await user.click(
      screen.getByRole("button", { name: /compare rent and buy/i }),
    );

    expect(within(table).getAllByRole("row")).toHaveLength(4); // header + 3 years
  });
});
