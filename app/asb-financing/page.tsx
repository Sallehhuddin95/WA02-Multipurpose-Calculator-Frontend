import { AsbFinancingCalculator } from "@/features/asb-financing";

export default function AsbFinancingPage() {
  return (
    <main className="page-shell pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="surface-card rounded-4xl p-8 md:p-10">
        <p className="text-(--accent) text-sm font-medium uppercase tracking-[0.22em]">
          ASB Financing Comparison
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            Compare leverage, dividends, and direct contributions before you
            commit to ASB financing.
          </h1>
          <p className="text-(--muted) mt-4 text-base leading-7 md:text-lg">
            See how a compounding strategy, a dividend-offset strategy, and
            direct ASB contributions compare over the same analysis horizon.
          </p>
        </div>
        <div className="bg-(--accent-soft) text-(--accent-strong) mt-6 rounded-3xl border border-(--line) px-5 py-4 text-sm leading-6">
          Assumptions: reducing-balance monthly amortized financing, a fixed
          annual ASB dividend rate credited once per year, and dividends
          reinvested unless a strategy explicitly redirects them. All three
          strategies commit the same monthly cash amount; the dividend-offset
          strategy tracks freed-up cash in a side investment with its own annual
          return rate instead of letting it disappear from the comparison. This
          is a planning projection, not a bank-issued ASBF quote.
        </div>
        <div className="mt-8">
          <AsbFinancingCalculator />
        </div>
      </section>
    </main>
  );
}
