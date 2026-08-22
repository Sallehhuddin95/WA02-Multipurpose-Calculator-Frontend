import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz"],
});

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Multipurpose Calculators",
  description:
    "Financial calculators for compound growth, loans, and strategy comparison.",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="[font-family:var(--font-body)]">
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 opacity-20 dot-grid"
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
