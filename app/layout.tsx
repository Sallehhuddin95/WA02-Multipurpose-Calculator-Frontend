import type { Metadata } from "next";
import { Geist, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { getServerTranslations } from "@/lib/i18n/get-server-translations";

const displayFont = Geist({
  subsets: ["latin"],
  variable: "--font-display",
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

interface RootLayoutProps {
  readonly children: ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
  };
}

export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const { locale } = await getServerTranslations();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="[font-family:var(--font-body)]">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-20 dot-grid"
        />
        <ThemeProvider>
          <I18nProvider initialLocale={locale}>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
