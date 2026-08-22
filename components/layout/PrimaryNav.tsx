"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MobileMenu } from "./MobileMenu";
import { navigationItems } from "./navigation-items";

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="Primary"
        className="hidden flex-wrap items-center gap-x-6 gap-y-1 md:flex"
      >
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`border-b-2 pb-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm ${
                isActive
                  ? "text-accent-foreground border-primary"
                  : "text-(--foreground) border-transparent hover:text-accent-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <MobileMenu />
    </>
  );
}
