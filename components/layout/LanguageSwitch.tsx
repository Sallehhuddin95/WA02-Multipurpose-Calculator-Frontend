"use client";

import React from "react";

import { useLocale, useTranslations } from "@/lib/i18n/use-i18n";

const segmentClass =
  "rounded-full px-1.5 py-0 text-[11px] font-semibold leading-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  return (
    <div
      role="group"
      aria-label={t("lang.groupLabel")}
      className="flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
    >
      <button
        type="button"
        aria-pressed={locale === "en"}
        aria-label={t("lang.switchToEnglish")}
        onClick={() => setLocale("en")}
        className={`${segmentClass} ${
          locale === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        aria-pressed={locale === "ms"}
        aria-label={t("lang.switchToMalay")}
        onClick={() => setLocale("ms")}
        className={`${segmentClass} ${
          locale === "ms"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        MS
      </button>
    </div>
  );
}
