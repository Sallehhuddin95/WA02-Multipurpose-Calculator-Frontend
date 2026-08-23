import { getServerTranslations } from "@/lib/i18n/get-server-translations";

import { CurrentYear } from "./CurrentYear";

export async function Footer() {
  const { t } = await getServerTranslations();

  return (
    <footer className="border-t border-border py-8 md:py-10">
      <div className="mx-auto w-[min(1180px,calc(100%_-_2rem))]">
        <p className="text-muted-foreground text-sm">
          &copy; <CurrentYear /> {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
