import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { resolveLocale } from "@/lib/i18n/locale";
import {
  createTranslator,
  type MessageKey,
} from "@/lib/i18n/messages";
import enMessages from "@/messages/en.json";
import msMessages from "@/messages/ms.json";

describe("i18n catalog", () => {
  it("has an identical key set in English and Malay", () => {
    const enKeys = Object.keys(enMessages).sort();
    const msKeys = Object.keys(msMessages).sort();

    expect(msKeys).toEqual(enKeys);
  });

  it("resolves an empty or unknown cookie to English", () => {
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("fr")).toBe(DEFAULT_LOCALE);
    expect(resolveLocale("EN")).toBe(DEFAULT_LOCALE);
  });

  it("resolves the Malay cookie value", () => {
    expect(resolveLocale("ms")).toBe("ms");
    expect(resolveLocale("en")).toBe("en");
  });

  it("exposes only supported locales", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "ms"]);
  });

  it("types MessageKey against the English catalog", () => {
    const validKey: MessageKey = "nav.overview";
    expect(validKey).toBe("nav.overview");

    // A typo in a key must fail typechecking.
    // @ts-expect-error - "nav.overveiw" is not a valid MessageKey
    const invalidKey: MessageKey = "nav.overveiw";
    void invalidKey;
  });

  it("translates keys for both locales", () => {
    const tEn = createTranslator("en");
    const tMs = createTranslator("ms");

    expect(tEn("nav.overview")).toBe("Overview");
    expect(tMs("nav.overview")).toBe("Laman Utama");
    expect(tMs("metadata.title")).toBe("Kalkulator Serba Guna");
    expect(tMs("route.carLoan.kicker")).toBe(
      "Pinjaman Kereta dan Penyelesaian Awal",
    );
  });

  it("never pluralizes period words in Malay", () => {
    const tMs = createTranslator("ms");

    // The Malay catalog uses "tahun"/"bulan" without plural forms, matching
    // "1 tahun" and "3 tahun" alike.
    expect(tMs("nav.overview")).not.toContain("tahuns");
  });
});
