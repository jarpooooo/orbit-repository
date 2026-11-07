// app/components/layout/theme.tsx
//
// Light / dark theme. Used by <SettingsMenu /> (the "Mode gelap" switch) and the root layout.
// - Default: light (no data-theme on <html>). The OS setting is not used.
// - After the user flips the switch: data-theme="light|dark" on <html> + saved in localStorage.
// - <ThemeScript /> in <head> applies the saved choice before the first paint (no flash of the wrong theme).
// The choice is stored in localStorage (a display preference only, not request data).

"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "pinjamtedi:theme";
const CHANGE_EVENT = "pinjamtedi:theme-change";

const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark";

/** Runs in <head> before paint. Keep it tiny and dependency-free. */
// Dark mode is switched off (no switch in the settings menu): the page is always light, and a dark choice
// saved earlier is cleared so nobody stays stuck in it.
const THEME_SCRIPT = `(function(){try{localStorage.removeItem("${STORAGE_KEY}")}catch(e){}})()`;

/**
 * Inline script for the root layout's <head>.
 * The type switch avoids React's "script tag while rendering" warning on the client
 * (pattern from node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md).
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  );
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  // another tab changed the choice → apply it here too
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    if (isTheme(e.newValue)) document.documentElement.dataset.theme = e.newValue;
    else delete document.documentElement.dataset.theme;
    onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Current theme (the user's choice, otherwise light) + setter. The server always renders "light". */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
  return { theme, setTheme };
}
