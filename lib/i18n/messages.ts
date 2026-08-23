import enMessages from "@/messages/en.json";
import msMessages from "@/messages/ms.json";

import type { Locale } from "./config";

export type Messages = typeof enMessages;
export type MessageKey = keyof Messages;
export type Translator = (key: MessageKey) => string;

/**
 * The Malay catalog is asserted to match the English key set. A compile-time
 * gap would be caught by the catalog-parity unit test, while a runtime gap
 * (for example a hand-edited JSON file) degrades to the English string.
 */
const msCatalog = msMessages as Messages;

export function getMessages(locale: Locale): Messages {
  return locale === "ms" ? msCatalog : enMessages;
}

export function createTranslator(locale: Locale): Translator {
  const catalog = getMessages(locale);
  return (key) => catalog[key] ?? enMessages[key];
}
