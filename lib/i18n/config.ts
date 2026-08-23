export const DEFAULT_LOCALE = "en";

export const SUPPORTED_LOCALES = ["en", "ms"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_COOKIE = "locale";
