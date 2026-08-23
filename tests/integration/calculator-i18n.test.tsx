import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CarLoanCalculator } from "@/features/car-loan";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe("Calculator i18n", () => {
  it("renders Malay labels when the provider locale is Malay", () => {
    render(
      <I18nProvider initialLocale="ms">
        <CarLoanCalculator />
      </I18nProvider>,
    );

    expect(screen.getAllByText("Ansuran bulanan").length).toBeGreaterThan(0);
    expect(screen.getByText("Ringkasan Pinjaman")).toBeInTheDocument();
    expect(screen.getByText("Kira pinjaman")).toBeInTheDocument();
  });

  it("renders English labels by default without a provider", () => {
    render(<CarLoanCalculator />);

    expect(screen.getAllByText("Monthly instalment").length).toBeGreaterThan(0);
    expect(screen.getByText("Loan Summary")).toBeInTheDocument();
    expect(screen.getByText("Calculate loan")).toBeInTheDocument();
  });
});
