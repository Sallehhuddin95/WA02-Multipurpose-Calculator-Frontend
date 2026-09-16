import { CompoundInterestCalculator } from "@/features/compound-interest";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";

export default async function CompoundInterestPage() {
  const { t } = await getServerTranslations();

  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-5 sm:p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          {t("route.compoundInterest.kicker")}
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-4xl leading-[1.14] md:text-5xl">
            {t("route.compoundInterest.heading")}
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            {t("route.compoundInterest.intro")}
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          {t("route.compoundInterest.assumptions")}
        </div>
        <div className="mt-8">
          <CompoundInterestCalculator />
        </div>
      </section>
    </main>
  );
}
