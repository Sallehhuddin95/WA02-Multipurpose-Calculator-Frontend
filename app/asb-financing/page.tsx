import { AsbFinancingCalculator } from "@/features/asb-financing";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";

export default async function AsbFinancingPage() {
  const { t } = await getServerTranslations();

  return (
    <main className="mx-auto w-[min(1180px,calc(100%_-_2rem))] pb-16 pt-10 md:pb-24 md:pt-14">
      <section className="border border-border bg-card/80 shadow-elevated backdrop-blur-lg rounded-4xl p-8 md:p-10">
        <p className="text-primary text-sm font-medium uppercase tracking-[0.22em]">
          {t("route.asbFinancing.kicker")}
        </p>
        <div className="mt-4 max-w-3xl">
          <h1 className="display-heading text-3xl leading-[1.14] md:text-5xl">
            {t("route.asbFinancing.heading")}
          </h1>
          <p className="text-muted-foreground mt-4 text-base leading-7 md:text-lg">
            {t("route.asbFinancing.intro")}
          </p>
        </div>
        <div className="bg-accent text-accent-foreground mt-6 rounded-3xl border border-border px-5 py-4 text-sm leading-6">
          {t("route.asbFinancing.assumptions")}
        </div>
        <div className="mt-8">
          <AsbFinancingCalculator />
        </div>
      </section>
    </main>
  );
}
