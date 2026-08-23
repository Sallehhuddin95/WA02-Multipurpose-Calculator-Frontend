"use client";

import { useI18n } from "./I18nProvider";
import { DEFAULT_LOCALE, type Locale } from "./config";
import { createTranslator, type Translator } from "./messages";

export interface LocaleController {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => void;
}

export function useLocale(): LocaleController {
  const context = useI18n();
  return {
    locale: context?.locale ?? DEFAULT_LOCALE,
    setLocale: context?.setLocale ?? (() => {}),
  };
}

export function useTranslations(): Translator {
  const context = useI18n();
  return context?.t ?? createTranslator(context?.locale ?? DEFAULT_LOCALE);
}
