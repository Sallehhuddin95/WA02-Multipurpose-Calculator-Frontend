import { RetirementFundCalculator } from "@/features/retirement-fund";

export default function RetirementFundPage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          Retirement Fund Calculator
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            Project retirement savings and see how long they will last.
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            Model EPF-style contributions through your working years, then
            simulate a gratuity-and-pension-style withdrawal pattern to see how
            long the accumulated fund lasts.
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          Assumptions: annual return credited once per year on the end-of-year
          balance, not compounded monthly, matching the ASB financing
          dividend-crediting convention. Outputs are nominal and do not adjust
          for inflation, tax, or EPF withdrawal rules. This is planning
          guidance, not financial advice.
        </div>
        <div className="mt-8">
          <RetirementFundCalculator />
        </div>
      </section>
    </main>
  );
}
