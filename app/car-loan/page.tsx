import { CarLoanCalculator } from "@/features/car-loan";

export default function CarLoanPage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          Car Loan and Early Settlement
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            Understand your full repayment cost before you commit to a car loan.
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            Compare financed amount, total interest, monthly instalment, and a
            documented early-settlement estimate in one place.
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          Assumptions: variable rate (reducing balance, EIR) is the default,
          reflecting the Hire-Purchase (Amendment) Act 2026; fixed rate (flat
          rate with a Rule of 78 style rebate) remains available for legacy
          comparisons. Early-settlement estimates are optional and off by
          default. This is a projection tool, not a lender-issued payoff quote.
        </div>
        <div className="mt-8">
          <CarLoanCalculator />
        </div>
      </section>
    </main>
  );
}
