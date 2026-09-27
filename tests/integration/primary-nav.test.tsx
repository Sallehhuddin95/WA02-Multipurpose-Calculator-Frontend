import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes, ReactNode } from "react";

import { PrimaryNav } from "@/components/layout/PrimaryNav";

const mocks = vi.hoisted(() => ({
  pathname: "/",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
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

beforeEach(() => {
  mocks.pathname = "/";
});

describe("PrimaryNav", () => {
  it("renders Overview and Salary as direct links", () => {
    render(<PrimaryNav />);

    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("link", { name: "Salary Calculator" }),
    ).toHaveAttribute("href", "/salary-calculator");
  });

  it("renders Property, Financing, and Investing as group toggles", () => {
    render(<PrimaryNav />);

    for (const name of ["Property", "Financing", "Investing"]) {
      const toggle = screen.getByRole("button", { name });
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(toggle).toHaveAttribute("aria-haspopup", "true");
    }
  });

  it("opens a group to reveal its child links", async () => {
    const user = userEvent.setup();
    render(<PrimaryNav />);

    await user.click(screen.getByRole("button", { name: "Property" }));

    expect(
      screen.getByRole("menuitem", { name: "Property vs REIT" }),
    ).toHaveAttribute("href", "/property-investment");
    expect(
      screen.getByRole("menuitem", { name: "Rent vs Buy" }),
    ).toHaveAttribute("href", "/rent-vs-buy");
  });

  it("keeps only one dropdown open at a time", async () => {
    const user = userEvent.setup();
    render(<PrimaryNav />);

    await user.click(screen.getByRole("button", { name: "Property" }));
    expect(
      screen.getByRole("menuitem", { name: "Property vs REIT" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Financing" }));
    expect(
      screen.queryByRole("menuitem", { name: "Property vs REIT" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Car Loan" }),
    ).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the toggle", async () => {
    const user = userEvent.setup();
    render(<PrimaryNav />);

    const toggle = screen.getByRole("button", { name: "Property" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("moves focus between menu items with arrow keys", async () => {
    const user = userEvent.setup();
    render(<PrimaryNav />);

    await user.click(screen.getByRole("button", { name: "Property" }));

    const firstItem = screen.getByRole("menuitem", {
      name: "Property vs REIT",
    });
    const secondItem = screen.getByRole("menuitem", { name: "Rent vs Buy" });

    // Opening a dropdown moves focus to its first menu item.
    expect(firstItem).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(secondItem).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(firstItem).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(secondItem).toHaveFocus();
  });

  it("closes when clicking outside the open dropdown", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <PrimaryNav />
        <button type="button">Outside</button>
      </div>,
    );

    const toggle = screen.getByRole("button", { name: "Property" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("menuitem", { name: "Property vs REIT" }),
    ).not.toBeInTheDocument();
  });

  it("closes the open dropdown when the route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<PrimaryNav />);

    const toggle = screen.getByRole("button", { name: "Property" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    mocks.pathname = "/car-loan";
    rerender(<PrimaryNav />);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("menuitem", { name: "Property vs REIT" }),
    ).not.toBeInTheDocument();
  });

  it("marks the active child link and highlights its parent group", async () => {
    mocks.pathname = "/property-investment";
    const user = userEvent.setup();
    render(<PrimaryNav />);

    const propertyToggle = screen.getByRole("button", { name: "Property" });
    const financingToggle = screen.getByRole("button", { name: "Financing" });

    // The parent toggle of the active child route gets the active styling.
    expect(propertyToggle).toHaveClass("border-primary");
    expect(financingToggle).toHaveClass("border-transparent");

    await user.click(propertyToggle);

    expect(
      screen.getByRole("menuitem", { name: "Property vs REIT" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("menuitem", { name: "Rent vs Buy" }),
    ).not.toHaveAttribute("aria-current");
  });
});
