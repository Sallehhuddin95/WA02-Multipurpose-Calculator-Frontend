import { CompoundInterestCalculator } from "@/features/compound-interest";

export default function CompoundInterestPage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          Compound Interest Calculator
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-4xl leading-[1.14] md:text-5xl">
            Model growth with fixed returns and optional monthly contributions.
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            This calculator uses the documented compound-growth model with a
            fixed annual rate, configurable compounding frequency, and
            end-of-period contribution treatment.
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          Assumptions: fixed annual rate across the full duration,
          annual/monthly/quarterly compounding, and optional monthly
          contributions applied at the end of each month.
        </div>
        <div className="mt-8">
          <CompoundInterestCalculator />
        </div>
      </section>
    </main>
  );
}
