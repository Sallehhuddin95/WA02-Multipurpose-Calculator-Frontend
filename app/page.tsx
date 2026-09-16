import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import type { MessageKey, Translator } from "@/lib/i18n/messages";

interface CalculatorCard {
  readonly href: string;
  readonly nameKey: MessageKey;
  readonly summaryKey: MessageKey;
}

const liveCalculators: readonly CalculatorCard[] = [
  {
    nameKey: "home.compoundInterest.name",
    summaryKey: "home.compoundInterest.summary",
    href: "/compound-interest",
  },
  {
    nameKey: "home.carLoan.name",
    summaryKey: "home.carLoan.summary",
    href: "/car-loan",
  },
  {
    nameKey: "home.asbFinancing.name",
    summaryKey: "home.asbFinancing.summary",
    href: "/asb-financing",
  },
  {
    nameKey: "home.propertyInvestment.name",
    summaryKey: "home.propertyInvestment.summary",
    href: "/property-investment",
  },
  {
    nameKey: "home.retirementFund.name",
    summaryKey: "home.retirementFund.summary",
    href: "/retirement-fund",
  },
  {
    nameKey: "home.salaryCalculator.name",
    summaryKey: "home.salaryCalculator.summary",
    href: "/salary-calculator",
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

function AboutCard({ t }: { t: Translator }) {
  const notes = [
    { title: t("home.about.note1.title"), body: t("home.about.note1.body") },
    { title: t("home.about.note2.title"), body: t("home.about.note2.body") },
    { title: t("home.about.note3.title"), body: t("home.about.note3.body") },
  ];

  return (
    <div>
      <p className="text-primary mb-5 text-sm font-medium uppercase tracking-[0.22em]">
        {t("home.about.heading")}
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
          {t("home.about.feedback")}
        </Button>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          {t("home.about.feedbackNote")}
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const { t } = await getServerTranslations();

  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="mb-10 md:mb-14">
        <h1 className="display-heading text-(--foreground) text-3xl font-semibold leading-tight md:text-4xl">
          {t("home.hero")}
        </h1>
      </section>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-4xl border border-border bg-card/80 p-5 shadow-elevated backdrop-blur-lg sm:p-8 md:p-10">
          <div className="mb-8">
            <p className="text-primary mb-4 text-sm font-medium uppercase tracking-[0.22em]">
              {t("home.allShipped")}
            </p>
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <CheckmarkIcon />
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-(--foreground)">
              {t("home.allShippedHeading")}
            </h2>
            <p className="text-muted-foreground mt-3 text-sm leading-6">
              {t("home.allShippedParagraph")}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveCalculators.map((calculator) => (
              <Link
                key={calculator.nameKey}
                href={calculator.href}
                className="group rounded-3xl border border-border bg-card/80 px-5 py-4 transition hover:border-primary hover:bg-card motion-safe:hover:scale-[1.03] motion-reduce:transform-none"
              >
                <p className="text-base font-semibold">
                  {t(calculator.nameKey)}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {t(calculator.summaryKey)}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-4xl border border-border bg-card/80 p-5 shadow-elevated backdrop-blur-lg sm:p-8 md:p-10">
          <AboutCard t={t} />
        </aside>
      </section>
    </main>
  );
}
