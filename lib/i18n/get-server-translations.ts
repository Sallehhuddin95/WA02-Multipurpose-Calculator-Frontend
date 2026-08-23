import { cookies } from "next/headers";

import { LOCALE_COOKIE, type Locale } from "./config";
import { resolveLocale } from "./locale";
import { createTranslator, type Translator } from "./messages";

export interface ServerTranslations {
  readonly locale: Locale;
  readonly t: Translator;
}

export async function getServerTranslations(): Promise<ServerTranslations> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  return { locale, t: createTranslator(locale) };
}
