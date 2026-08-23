import { DEFAULT_LOCALE, type Locale } from "./config";

export function resolveLocale(cookieValue?: string): Locale {
  switch (cookieValue) {
    case "ms":
      return "ms";
    case "en":
      return "en";
    default:
      return DEFAULT_LOCALE;
  }
}
