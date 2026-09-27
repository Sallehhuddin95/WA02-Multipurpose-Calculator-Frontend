import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { MobileMenu } from "@/components/layout/MobileMenu";
import {
  navigationItems,
  type NavigationLink,
} from "@/components/layout/navigation-items";
import { getMessages } from "@/lib/i18n/messages";

const messages = getMessages("en");

// The panel lists Overview plus all seven calculator links: the two direct
// links and every link nested inside a group.
const flatLinks: NavigationLink[] = navigationItems.flatMap((item) =>
  item.kind === "link" ? [item] : [...item.items],
);

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

  it("reveals grouped sections and all calculator links when activated", async () => {
    const user = userEvent.setup();
    render(<MobileMenu />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    // Top-level navigation is now five entries: Overview, three groups, Salary.
    expect(navigationItems).toHaveLength(5);

    // Group section headings are present in the panel.
    expect(screen.getByText("Property")).toBeInTheDocument();
    expect(screen.getByText("Financing")).toBeInTheDocument();
    expect(screen.getByText("Investing")).toBeInTheDocument();

    // Overview plus all seven calculator links remain reachable.
    expect(flatLinks).toHaveLength(8);
    flatLinks.forEach((link) => {
      expect(
        screen.getByRole("link", { name: messages[link.labelKey] }),
      ).toBeInTheDocument();
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

    flatLinks.forEach((link) => {
      expect(
        screen.getByRole("link", { name: messages[link.labelKey] }),
      ).toHaveAttribute("href", link.href);
    });
  });
});
