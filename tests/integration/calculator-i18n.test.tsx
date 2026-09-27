import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CarLoanCalculator } from "@/features/car-loan";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("Calculator i18n", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders Malay labels when the provider locale is Malay", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="ms">
        <CarLoanCalculator />
      </I18nProvider>,
    );

    expect(screen.getByText("Tiada keputusan lagi")).toBeInTheDocument();
    expect(screen.getByText("Kira pinjaman")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Kira pinjaman" }));

    expect(screen.getAllByText("Ansuran bulanan").length).toBeGreaterThan(0);
    expect(screen.getByText("Ringkasan Pinjaman")).toBeInTheDocument();
  });

  it("renders English labels by default without a provider", async () => {
    const user = userEvent.setup();

    render(<CarLoanCalculator />);

    expect(screen.getByText("No results yet")).toBeInTheDocument();
    expect(screen.getByText("Calculate loan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Calculate loan" }));

    expect(screen.getAllByText("Monthly instalment").length).toBeGreaterThan(0);
    expect(screen.getByText("Loan Summary")).toBeInTheDocument();
  });
});
