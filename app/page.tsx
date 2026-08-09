import Link from "next/link";

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
    name: "Retirement Fund Calculator",
    href: "/retirement-fund",
    summary:
      "Project EPF-style retirement savings growth, then simulate how long the fund lasts under a gratuity-and-pension withdrawal pattern.",
  },
];

const upcomingCalculators = [
  {
    name: "Salary Calculator",
    status: "Planned",
    summary:
      "Take-home pay estimate from gross salary, statutory deductions, and reliefs.",
  },
];

export default function HomePage() {
  return (
    <main className="page-shell pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card rounded-[2rem] p-8 md:p-10">
          <p className="text-(--accent) mb-4 text-sm font-medium uppercase tracking-[0.22em]">
            Multipurpose Calculators
          </p>
          <h1 className="display-heading max-w-2xl text-4xl leading-[1.08] md:text-6xl">
            Make clearer money decisions with fast, practical calculators.
          </h1>
          <p className="text-(--muted) mt-5 max-w-xl text-base leading-7 md:text-lg">
            Start with compound interest, car-loan, ASB financing,
            property-versus-REIT, and retirement fund scenarios today, with more
            everyday money calculators on the way.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveCalculators.map((calculator) => (
              <Link
                key={calculator.name}
                href={calculator.href}
                className="group rounded-3xl border border-(--line) bg-white/78 px-5 py-4 transition hover:border-(--accent) hover:bg-white"
              >
                <p className="text-base font-semibold">
                  Open {calculator.name}
                </p>
                <p className="text-(--muted) mt-2 text-sm leading-6">
                  {calculator.summary}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="surface-card rounded-[2rem] p-8 md:p-10">
          <p className="text-(--warning) text-sm font-medium uppercase tracking-[0.2em]">
            Planned Next
          </p>
          <ul className="mt-5 grid gap-4">
            {upcomingCalculators.map((calculator) => (
              <li
                key={calculator.name}
                className="rounded-3xl border border-(--line) bg-white/70 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">{calculator.name}</h2>
                  <span
                    className={
                      calculator.status === "Specified"
                        ? "bg-(--accent-soft) text-(--accent-strong) rounded-full px-3 py-1 text-xs font-semibold"
                        : "text-(--muted) rounded-full border border-(--line) bg-white/60 px-3 py-1 text-xs font-semibold"
                    }
                  >
                    {calculator.status}
                  </span>
                </div>
                <p className="text-(--muted) mt-3 text-sm leading-6">
                  {calculator.summary}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </main>
  );
}
