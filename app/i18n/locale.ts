// app/i18n/locale.ts
//
// Supported UI languages. Indonesian is the default (and what the server renders);
// English is a per-browser preference picked in the settings menu (see components/layout/language.tsx).

export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "id";

export const isLocale = (value: unknown): value is Locale => value === "id" || value === "en";

/** A text dictionary: the same shape for every locale. Write `id` first, then `en: typeof id`. */
export type Dictionary<T> = Record<Locale, T>;
