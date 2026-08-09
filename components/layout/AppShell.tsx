import Link from "next/link";
import type { ReactNode } from "react";

interface AppShellProps {
  readonly children: ReactNode;
}

const navigationItems = [
  {
    href: "/",
    label: "Overview",
  },
  {
    href: "/asb-financing",
    label: "ASB Financing",
  },
  {
    href: "/car-loan",
    label: "Car Loan",
  },
  {
    href: "/compound-interest",
    label: "Compound Interest",
  },
  {
    href: "/property-investment",
    label: "Property Investment vs REIT",
  },
  {
    href: "/retirement-fund",
    label: "Retirement Fund",
  },
  {
    href: "/salary-calculator",
    label: "Salary Calculator",
  },
];

export function AppShell({ children }: Readonly<AppShellProps>) {
  return (
    <div className="min-h-screen pb-10">
      <header className="page-shell pt-6 md:pt-8">
        <div className="surface-card flex flex-col gap-5 rounded-[1.75rem] px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <Link
              href="/"
              className="text-(--accent) text-sm font-medium uppercase tracking-[0.22em]"
            >
              Multipurpose Calculators
            </Link>
            <p className="text-(--muted) mt-2 text-sm">
              Practical calculators to help you make clearer money decisions.
            </p>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap gap-3">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-(--foreground) hover:border-(--accent) hover:text-(--accent-strong) rounded-full border border-(--line) bg-white/60 px-4 py-2 text-sm font-medium transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
