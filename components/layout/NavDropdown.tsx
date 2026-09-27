"use client";

import React, {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import type { MessageKey } from "@/lib/i18n/messages";
import { useTranslations } from "@/lib/i18n/use-i18n";

import type { NavigationLink } from "./navigation-items";

interface NavDropdownProps {
  readonly labelKey: MessageKey;
  readonly items: readonly NavigationLink[];
  readonly pathname: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onClose: () => void;
}

const toggleBaseClass =
  "inline-flex items-center gap-1 rounded-sm border-b-2 px-2 pb-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const itemBaseClass =
  "block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function NavDropdown({
  labelKey,
  items,
  pathname,
  isOpen,
  onToggle,
  onClose,
}: NavDropdownProps) {
  const t = useTranslations();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasActiveChild = items.some((item) => item.href === pathname);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const clickedToggle = toggleRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedToggle && !clickedMenu) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const firstItem =
      menuRef.current?.querySelector<HTMLAnchorElement>('a[role="menuitem"]');
    firstItem?.focus();
  }, [isOpen]);

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const links = Array.from(
      menuRef.current?.querySelectorAll<HTMLAnchorElement>(
        'a[role="menuitem"]',
      ) ?? [],
    );

    if (links.length === 0) return;

    const currentIndex = links.indexOf(
      document.activeElement as HTMLAnchorElement,
    );

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % links.length;
      links[nextIndex]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (currentIndex - 1 + links.length) % links.length;
      links[nextIndex]?.focus();
    }
  }

  return (
    <div className="relative">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={onToggle}
        className={`${toggleBaseClass} ${
          hasActiveChild
            ? "text-accent-foreground border-primary"
            : "text-(--foreground) border-transparent hover:text-accent-foreground"
        }`}
      >
        {t(labelKey)}
        <ChevronDown
          className={`size-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={t(labelKey)}
          onKeyDown={handleMenuKeyDown}
          className="absolute left-0 top-full z-50 mt-2 min-w-48 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-elevated"
        >
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                aria-current={isActive ? "page" : undefined}
                tabIndex={-1}
                onClick={onClose}
                className={`${itemBaseClass} ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-(--foreground) hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
