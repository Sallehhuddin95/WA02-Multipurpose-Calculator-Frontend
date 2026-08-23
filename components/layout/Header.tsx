import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { HeaderControls } from "./HeaderControls";
import { PrimaryNav } from "./PrimaryNav";

export async function Header() {
  const { t } = await getServerTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-(--background)/75 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1180px,calc(100%_-_2rem))] items-center justify-between gap-6 py-4 md:py-5">
        <Link
          href="/"
          className="display-heading text-primary text-lg font-semibold whitespace-nowrap"
        >
          {t("nav.siteName")}
        </Link>

        <div className="flex items-center gap-4">
          <PrimaryNav />
          <HeaderControls className="hidden md:flex" />
        </div>
      </div>
    </header>
  );
}
