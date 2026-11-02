// app/components/layout/settings-menu.tsx
//
// Settings button for the navbar (gear) with a dropdown.
// Rows: Keyboard navigation, Dark mode (switches), Language (ID / EN choice).
// Always mounted inside the navbar, so keyboard shortcuts keep working while the dropdown is closed.
// Text: LAYOUT_TEXT.settings (app/i18n/site-layout.ts).

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import type { Locale } from "@/app/i18n/locale";
import { KEYBOARD_FOCUS_CSS, KeyboardHelpDialog, useKeyboardNav } from "./keyboard-nav";
import { useLocale } from "./language";
import { useTheme } from "./theme";

/** Language options: short code on the button, full name for screen readers (each in its own language). */
const LANGUAGE_OPTIONS: readonly { locale: Locale; code: string; name: string }[] = [
  { locale: "id", code: "ID", name: "Bahasa Indonesia" },
  { locale: "en", code: "EN", name: "English" },
];

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
  action,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: () => void;
  action?: React.ReactNode;
}) {
  const labelId = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span id={labelId} className="text-[15px] font-bold leading-[1.3] text-ink">{label}</span>
        <span className="text-[13px] leading-[1.4] text-ink-muted">{hint}</span>
        {action}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onChange}
        className={`relative mt-0.5 h-7 w-[50px] shrink-0 rounded-full border-2 border-line-strong transition-colors ${
          checked ? "bg-status-available" : "bg-pair-gray-bg"
        }`}
      >
        <span
          aria-hidden
          className={`absolute top-1/2 size-5 -translate-y-1/2 rounded-full border-2 border-line-strong bg-white transition-all ${
            checked ? "left-[22px]" : "left-[1px]"
          }`}
        />
      </button>
    </div>
  );
}

/** Same layout as SwitchRow, with a two-button choice instead of a switch. */
function LanguageRow({ label, hint }: { label: string; hint: string }) {
  const labelId = useId();
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl p-3">
      <div className="flex min-w-0 flex-col gap-1">
        <span id={labelId} className="text-[15px] font-bold leading-[1.3] text-ink">{label}</span>
        <span className="text-[13px] leading-[1.4] text-ink-muted">{hint}</span>
      </div>
      <div role="group" aria-labelledby={labelId} className="mt-0.5 flex shrink-0 overflow-hidden rounded-full border-2 border-line-strong">
        {LANGUAGE_OPTIONS.map((option) => {
          const active = option.locale === locale;
          return (
            <button
              key={option.locale}
              type="button"
              lang={option.locale}
              aria-label={option.name}
              aria-pressed={active}
              onClick={() => setLocale(option.locale)}
              className={`h-7 min-w-[42px] px-2 text-[13px] font-extrabold leading-none transition-colors ${
                active ? "bg-brand-secondary text-on-secondary" : "bg-surface text-ink hover:bg-surface-warm"
              }`}
            >
              {option.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SettingsMenu() {
  const pathname = usePathname();
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const keyboard = useKeyboardNav();
  const { theme, setTheme } = useTheme();
  const t = LAYOUT_TEXT[useLocale().locale].settings;

  // close on navigation
  useEffect(() => setOpen(false), [pathname]);

  // close on outside click / Escape (focus returns to the button)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !keyboard.helpOpen) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, keyboard.helpOpen]);

  return (
    <div ref={wrapRef} className="relative">
      <style>{KEYBOARD_FOCUS_CSS}</style>

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t.label}
        className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong bg-surface text-ink transition-colors hover:bg-brand-secondary/40 sm:size-12"
      >
        <Settings size={20} strokeWidth={2.25} aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          role="group"
          aria-label={t.label}
          className="fixed inset-x-3 top-[84px] z-50 rounded-3xl border-2 border-line-strong bg-surface p-2 shadow-hard-royal sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[320px]"
        >
          <SwitchRow
            label={t.keyboard.label}
            hint={t.keyboard.hint}
            checked={keyboard.enabled}
            onChange={() => keyboard.setEnabled((v) => !v)}
            action={
              keyboard.enabled ? (
                <button
                  type="button"
                  onClick={() => keyboard.setHelpOpen(true)}
                  className="w-fit text-[13px] font-bold text-link underline underline-offset-2"
                >
                  {t.keyboard.showShortcuts}
                </button>
              ) : null
            }
          />
          <SwitchRow
            label={t.darkMode.label}
            hint={t.darkMode.hint}
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
          <LanguageRow label={t.language.label} hint={t.language.hint} />
        </div>
      )}

      {keyboard.helpOpen && <KeyboardHelpDialog onClose={() => keyboard.setHelpOpen(false)} />}
    </div>
  );
}
