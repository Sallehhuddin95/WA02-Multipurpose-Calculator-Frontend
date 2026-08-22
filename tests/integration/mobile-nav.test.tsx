import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { navigationItems } from "@/components/layout/navigation-items";

vi.mock("next/navigation", () => ({
  usePathname: () => "/car-loan",
}));

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  },
}));

describe("MobileMenu", () => {
  it("renders a hamburger toggle with aria-expanded and aria-controls", () => {
    render(<MobileMenu />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-menu");
  });

  it("reveals all seven nav entries when activated", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(navigationItems).toHaveLength(7);
    navigationItems.forEach((item) => {
      expect(screen.getByRole("link", { name: item.label })).toBeInTheDocument();
    });
  });

  it("marks the active link with aria-current", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    expect(screen.getByRole("link", { name: "Car Loan" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    const toggle = screen.getByRole("button", { name: "Open menu" });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("renders nav links with the correct hrefs", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    navigationItems.forEach((item) => {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute(
        "href",
        item.href,
      );
    });
  });
});
