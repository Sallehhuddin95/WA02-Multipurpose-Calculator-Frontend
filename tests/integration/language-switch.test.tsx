import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { useTranslations } from "@/lib/i18n/use-i18n";

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

function OverviewLabel() {
  const t = useTranslations();
  return <span>{t("nav.overview")}</span>;
}

function clearLocaleCookie() {
  document.cookie = "locale=; path=/; max-age=0";
}

beforeEach(() => {
  refreshMock.mockClear();
  clearLocaleCookie();
});

describe("LanguageSwitch", () => {
  it("renders English fallback when no provider is present", () => {
    render(
      <>
        <LanguageSwitch />
        <OverviewLabel />
      </>,
    );

    expect(
      screen.getByRole("button", { name: "Switch to English" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Switch to Malay" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("switches context locale and labels when Malay is selected", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitch />
        <OverviewLabel />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Switch to Malay" }));

    expect(screen.getByText("Laman Utama")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tukar ke Bahasa Melayu" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Tukar ke Bahasa Inggeris" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("writes the locale cookie and refreshes so the server can set html lang", async () => {
    const user = userEvent.setup();

    render(
      <I18nProvider initialLocale="en">
        <LanguageSwitch />
      </I18nProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Switch to Malay" }));

    // The cookie write plus router.refresh() is what lets the server-side
    // layout re-render with <html lang="ms"> on the next paint.
    expect(document.cookie).toContain("locale=ms");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
