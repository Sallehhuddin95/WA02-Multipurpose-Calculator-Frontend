import type { MessageKey } from "@/lib/i18n/messages";

export interface NavigationItem {
  readonly href: string;
  readonly labelKey: MessageKey;
}

export const navigationItems: readonly NavigationItem[] = [
  { href: "/", labelKey: "nav.overview" },
  { href: "/asb-financing", labelKey: "nav.asbFinancing" },
  { href: "/car-loan", labelKey: "nav.carLoan" },
  { href: "/compound-interest", labelKey: "nav.compoundInterest" },
  { href: "/property-investment", labelKey: "nav.propertyInvestment" },
  { href: "/retirement-fund", labelKey: "nav.retirementFund" },
  { href: "/salary-calculator", labelKey: "nav.salaryCalculator" },
];
