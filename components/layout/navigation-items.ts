export interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

export const navigationItems: readonly NavigationItem[] = [
  { href: "/", label: "Overview" },
  { href: "/asb-financing", label: "ASB Financing" },
  { href: "/car-loan", label: "Car Loan" },
  { href: "/compound-interest", label: "Compound Interest" },
  { href: "/property-investment", label: "Property vs REIT" },
  { href: "/retirement-fund", label: "Retirement Fund" },
  { href: "/salary-calculator", label: "Salary Calculator" },
];
