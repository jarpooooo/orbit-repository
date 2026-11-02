// app/components/layout/language.tsx
//
// UI language (Indonesian / English). Used by <SettingsMenu /> (the "Bahasa" row) and every translated component.
// - Default: Indonesian. The server always renders Indonesian, so pages stay static.
// - After the user picks English: data-lang="en" + lang="en" on <html>, saved in localStorage.
// - <LanguageScript /> in <head> applies the saved choice before the first paint. For English it also sets
//   data-lang-pending, which hides the page (globals.css) until <LanguageReady /> has re-rendered it in English,
//   so the Indonesian server HTML never flashes. A timeout lifts the hold if JavaScript fails.
// The choice is stored in localStorage (a display preference only, not request data).

"use client";

import { useEffect, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, isLocale, type Dictionary, type Locale } from "@/app/i18n/locale";

const STORAGE_KEY = "pinjamtedi:lang";
const CHANGE_EVENT = "pinjamtedi:lang-change";
const PENDING_ATTR = "data-lang-pending";

/** Runs in <head> before paint. Keep it tiny and dependency-free. */
const LANGUAGE_SCRIPT = `(function(){try{var l=localStorage.getItem("${STORAGE_KEY}");if(l==="en"){var h=document.documentElement;h.dataset.lang=l;h.lang=l;h.setAttribute("${PENDING_ATTR}","");setTimeout(function(){h.removeAttribute("${PENDING_ATTR}")},1500)}}catch(e){}})()`;

/** Inline script for the root layout's <head> (same pattern as <ThemeScript />). */
export function LanguageScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: LANGUAGE_SCRIPT }}
    />
  );
}

function readLocale(): Locale {
  const chosen = document.documentElement.dataset.lang;
  return isLocale(chosen) ? chosen : DEFAULT_LOCALE;
}

function applyLocale(locale: Locale) {
  const html = document.documentElement;
  html.dataset.lang = locale;
  html.lang = locale;
}

function subscribe(onChange: () => void) {
  // another tab changed the choice → apply it here too
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    applyLocale(isLocale(e.newValue) ? e.newValue : DEFAULT_LOCALE);
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setLocale(locale: Locale) {
  applyLocale(locale);
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Current UI language + setter. The server (and hydration) always use Indonesian. */
export function useLocale() {
  const locale = useSyncExternalStore(subscribe, readLocale, () => DEFAULT_LOCALE);
  return { locale, setLocale };
}

/** Picks the current language's entry from a dictionary. */
export function useText<T>(dictionary: Dictionary<T>): T {
  return dictionary[useLocale().locale];
}

/** Mounted once in the root layout: lifts the English pre-paint hold after hydration has re-rendered the page. */
export function LanguageReady() {
  useEffect(() => {
    // two frames: hydration commits with Indonesian, then useSyncExternalStore re-renders in the saved language
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => document.documentElement.removeAttribute(PENDING_ATTR));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  return null;
}
