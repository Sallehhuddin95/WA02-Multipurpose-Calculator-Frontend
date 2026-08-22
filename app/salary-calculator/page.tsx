import { SalaryCalculator } from "@/features/salary-calculator";

export default function SalaryCalculatorPage() {
  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary">
          Salary Calculator
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            Break down your gross salary into net take-home pay and employer cost.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            See every statutory deduction - EPF, SOCSO, EIS, PCB - plus optional
            Lindung24 protection. Supports Malaysian citizens, permanent
            residents, and foreign workers.
          </p>
        </div>
        <div className="mt-6 rounded-3xl border border-border bg-accent px-5 py-4 text-sm leading-6 text-accent-foreground">
            Uses the latest published EPF, SOCSO, EIS, and PCB rate schedules.
            Foreign workers use a flat 30% PCB rate and optional EPF. This is
            planning guidance, not official payroll advice.
        </div>
        <div className="mt-8">
          <SalaryCalculator />
        </div>
      </section>
    </main>
  );
}
