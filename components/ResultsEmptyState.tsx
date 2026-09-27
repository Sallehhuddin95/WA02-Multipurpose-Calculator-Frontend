"use client";

import React from "react";

import { useTranslations } from "@/lib/i18n/use-i18n";

/**
 * Placeholder shown in a calculator's results column before the first
 * successful calculation (and after reset or a failed validation).
 * Keeps the results panel visible but empty, per the shared UI spec.
 */
export function ResultsEmptyState() {
  const t = useTranslations();

  return (
    <section
      aria-live="polite"
      className="min-w-0 rounded-3xl border border-dashed border-border bg-card/50 p-6"
    >
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
        {t("common.resultsEmpty.heading")}
      </p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {t("common.resultsEmpty.body")}
      </p>
    </section>
  );
}
