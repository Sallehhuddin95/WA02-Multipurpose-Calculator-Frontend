import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { AsbFinancingCalculator } from "@/features/asb-financing";

const STORAGE_KEY = "asb-financing:form:v1";

describe("AsbFinancingCalculator persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores entered values and recomputed results after a refresh", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AsbFinancingCalculator />);

    fireEvent.change(screen.getByLabelText(/financing principal/i), {
      target: { value: "120000" },
    });

    await user.click(
      screen.getByRole("button", { name: /compare strategies/i }),
    );

    unmount();

    render(<AsbFinancingCalculator />);

    expect(await screen.findByDisplayValue("120000")).toBeInTheDocument();
    expect(
      screen.getByText(/scheduled monthly instalment/i).nextElementSibling,
    ).toHaveTextContent(/1,272\.79/);
  });

  it("clears the stored key and resets values on reset", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AsbFinancingCalculator />);

    fireEvent.change(screen.getByLabelText(/financing principal/i), {
      target: { value: "120000" },
    });
    await user.click(
      screen.getByRole("button", { name: /compare strategies/i }),
    );
    await user.click(screen.getByRole("button", { name: /reset inputs/i }));

    expect(screen.getByLabelText(/financing principal/i)).toHaveValue(50000);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    unmount();

    render(<AsbFinancingCalculator />);

    expect(await screen.findByDisplayValue("50000")).toBeInTheDocument();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to defaults and removes the key when stored JSON is malformed", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    render(<AsbFinancingCalculator />);

    expect(screen.getByLabelText(/financing principal/i)).toHaveValue(50000);

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  it("falls back to defaults and removes the key when stored values fail the schema", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        financingPrincipal: 50000,
        financingTenureYears: 10,
        annualFinancingRate: 5.0,
        annualDividendRate: 5.5,
        annualSideInvestmentReturnRate: 5.5,
        analysisHorizonYears: 15,
      }),
    );

    render(<AsbFinancingCalculator />);

    expect(screen.getByLabelText(/analysis horizon/i)).toHaveValue(10);

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
