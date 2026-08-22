import Link from "next/link";
import { Button } from "@/components/ui/button";

const liveCalculators = [
  {
    name: "Compound Interest",
    href: "/compound-interest",
    summary:
      "Project future savings growth with fixed annual rates and configurable compounding frequency.",
  },
  {
    name: "Car Loan",
    href: "/car-loan",
    summary:
      "Estimate monthly instalments and total repayment for variable-rate or fixed-rate financing, with an optional early-settlement estimate.",
  },
  {
    name: "ASB Financing",
    href: "/asb-financing",
    summary:
      "Three-strategy comparison around leverage, dividends, and direct ASB contributions.",
  },
  {
    name: "Property Investment vs REIT",
    href: "/property-investment",
    summary:
      "Rental-property cash flow, exit proceeds, and REIT benchmark comparison over the same holding period.",
  },
  {
    name: "Retirement Fund",
    href: "/retirement-fund",
    summary:
      "Project EPF-style retirement savings growth, then simulate how long the fund lasts under a gratuity-and-pension withdrawal pattern.",
  },
  {
    name: "Salary Calculator",
    href: "/salary-calculator",
    summary:
      "Break down gross salary into net take-home pay and employer cost with EPF, SOCSO, EIS, PCB, and optional Lindung24.",
  },
];

function CheckmarkIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="14" cy="14" r="14" fill="var(--accent)" />
      <path
        d="M8 14l4 4 8-8"
        stroke="var(--accent-foreground)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutCard() {
  const notes = [
    {
      title: "Estimates only",
      body: "Results are approximations for planning, not financial or tax advice.",
    },
    {
      title: "Private by design",
      body: "Everything is calculated in your browser - nothing you enter is stored or sent.",
    },
    {
      title: "Check the assumptions",
      body: "Each calculator documents its formulas and assumptions next to its results.",
    },
  ];

  return (
    <div>
      <p className="text-primary mb-5 text-sm font-medium uppercase tracking-[0.22em]">
        About this app
      </p>

      <ul className="space-y-5">
        {notes.map((note) => (
          <li key={note.title}>
            <p className="font-semibold text-(--foreground)">{note.title}</p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{note.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-border pt-6">
        <Button variant="secondary" disabled>
          Send feedback
        </Button>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          The feedback form will connect to our Telegram bot soon.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="mb-10 md:mb-14">
        <h1 className="display-heading text-(--foreground) text-3xl font-semibold leading-tight md:text-4xl">
          Practical calculators to help you make clearer money decisions.
        </h1>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-4xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur-lg md:p-10">
          <div className="mb-8">
            <p className="text-primary mb-4 text-sm font-medium uppercase tracking-[0.22em]">
              All Shipped
            </p>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <CheckmarkIcon />
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-(--foreground)">
              Every planned calculator is now live and ready to use.
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              All six calculators have shipped and are available below. Click
              any one to get started.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveCalculators.map((calculator) => (
              <Link
                key={calculator.name}
                href={calculator.href}
                className="group rounded-3xl border border-border bg-card/80 px-5 py-4 transition hover:border-primary hover:bg-card motion-safe:hover:scale-[1.03] motion-reduce:transform-none"
              >
                <p className="text-base font-semibold">{calculator.name}</p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {calculator.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-4xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur-lg md:p-10">
          <AboutCard />
        </aside>
      </section>
    </main>
  );
}
