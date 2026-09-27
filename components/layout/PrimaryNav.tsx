"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTranslations } from "@/lib/i18n/use-i18n";

import { MobileMenu } from "./MobileMenu";
import { NavDropdown } from "./NavDropdown";
import { navigationItems } from "./navigation-items";

export function PrimaryNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const [openGroupIndex, setOpenGroupIndex] = useState<number | null>(null);

  useEffect(() => {
    setOpenGroupIndex(null);
  }, [pathname]);

  return (
    <>
      <nav
        aria-label={t("nav.ariaPrimary")}
        className="hidden flex-wrap items-center gap-x-4 gap-y-1 md:flex"
      >
        {navigationItems.map((item, index) => {
          if (item.kind === "link") {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`border-b-2 px-2 pb-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm ${
                  isActive
                    ? "text-accent-foreground border-primary"
                    : "text-(--foreground) border-transparent hover:text-accent-foreground"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          }

          return (
            <NavDropdown
              key={item.labelKey}
              labelKey={item.labelKey}
              items={item.items}
              pathname={pathname}
              isOpen={openGroupIndex === index}
              onToggle={() =>
                setOpenGroupIndex((current) =>
                  current === index ? null : index,
                )
              }
              onClose={() => setOpenGroupIndex(null)}
            />
          );
        })}
      </nav>

      <MobileMenu />
    </>
  );
}
