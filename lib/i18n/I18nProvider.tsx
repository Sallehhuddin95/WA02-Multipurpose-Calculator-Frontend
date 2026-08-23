"use client";

import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { LOCALE_COOKIE, type Locale } from "./config";
import { createTranslator, type Translator } from "./messages";

interface I18nContextValue {
  readonly locale: Locale;
  readonly t: Translator;
  readonly setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  readonly initialLocale: Locale;
  readonly children: React.ReactNode;
}

export function I18nProvider({
  initialLocale,
  children,
}: I18nProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      if (nextLocale === locale) return;
      setLocaleState(nextLocale);
      document.cookie = `${LOCALE_COOKIE}=${nextLocale}; path=/; max-age=31536000`;
      router.refresh();
    },
    [locale, router],
  );

  const t = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({ locale, t, setLocale }),
    [locale, t, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue | null {
  return useContext(I18nContext);
}
