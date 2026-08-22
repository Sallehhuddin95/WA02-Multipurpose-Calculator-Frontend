import { PropertyInvestmentCalculator } from "@/features/property-investment";

export default function PropertyInvestmentPage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          Property Investment vs REIT
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            See whether a rental property or a REIT works harder for the same
            capital.
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            Compare loan balance, rental cash flow, and exit proceeds from a
            buy-to-rent property against a REIT invested with the same capital
            over the same holding period.
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          Assumptions: reducing-balance monthly amortized financing, constant
          annual rental income and expense assumptions across the holding
          period, one fixed property exit assumption, and one fixed REIT annual
          return rate. This is a planning projection, not tax, legal, or
          investment advice.
        </div>
        <div className="mt-8">
          <PropertyInvestmentCalculator />
        </div>
      </section>
    </main>
  );
}
