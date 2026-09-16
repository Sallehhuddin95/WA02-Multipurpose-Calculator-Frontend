import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";
import { HeaderControls } from "./HeaderControls";
import { PrimaryNav } from "./PrimaryNav";

export async function Header() {
  const { t } = await getServerTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-(--background)/75 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1180px,calc(100%_-_2rem))] items-center justify-between gap-3 py-4 md:gap-6 md:py-5">
        <Link
          href="/"
          className="display-heading text-primary shrink-0 text-lg font-semibold whitespace-nowrap"
        >
          {t("nav.siteName")}
        </Link>

        <div className="flex min-w-0 items-center justify-end gap-4">
          <PrimaryNav />
          <HeaderControls className="hidden md:flex" />
        </div>
      </div>
    </header>
  );
}
