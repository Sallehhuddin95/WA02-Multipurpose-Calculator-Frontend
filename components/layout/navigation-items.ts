import type { MessageKey } from "@/lib/i18n/messages";

export interface NavigationLink {
  readonly kind: "link";
  readonly href: string;
  readonly labelKey: MessageKey;
}

export interface NavigationGroup {
  readonly kind: "group";
  readonly labelKey: MessageKey;
  readonly items: readonly NavigationLink[];
}

export type NavigationItem = NavigationLink | NavigationGroup;

export const navigationItems: readonly NavigationItem[] = [
  { kind: "link", href: "/", labelKey: "nav.overview" },
  {
    kind: "group",
    labelKey: "nav.propertyGroup",
    items: [
      {
        kind: "link",
        href: "/property-investment",
        labelKey: "nav.propertyInvestment",
      },
      { kind: "link", href: "/rent-vs-buy", labelKey: "nav.rentVsBuy" },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.financingGroup",
    items: [
      { kind: "link", href: "/car-loan", labelKey: "nav.carLoan" },
      { kind: "link", href: "/asb-financing", labelKey: "nav.asbFinancing" },
    ],
  },
  {
    kind: "group",
    labelKey: "nav.investingGroup",
    items: [
      {
        kind: "link",
        href: "/compound-interest",
        labelKey: "nav.compoundInterest",
      },
      { kind: "link", href: "/retirement-fund", labelKey: "nav.retirementFund" },
    ],
  },
  { kind: "link", href: "/salary-calculator", labelKey: "nav.salaryCalculator" },
];
