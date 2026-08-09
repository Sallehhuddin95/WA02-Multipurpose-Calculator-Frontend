import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
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
      <body
        style={{
          fontFamily: "var(--font-body)",
        }}
      >
        <div className="grain" />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
