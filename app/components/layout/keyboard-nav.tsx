// app/components/layout/keyboard-nav.tsx
//
// Keyboard navigation mode. Used by <SettingsMenu /> in the navbar (the switch lives in its dropdown).
// When ENABLED:
//   - keyboard focus gets a thicker, clearer ring (data-kbd="on" on <html>)
//   - shortcuts work:  /  = focus the search field
//                      ?  = open / close the shortcut list
//                      g then b/c/s/h/m = go to Home / Catalog / Schedule / How to borrow / My requests
//                      Esc = close the shortcut list
// When DISABLED (default): no single-letter shortcuts (safe for screen readers and voice control,
// WCAG 2.1.4). Normal Tab / Enter navigation always works.
// The choice is stored in localStorage (a display preference only, not request data).

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LAYOUT_TEXT, type PageKey } from "@/app/i18n/site-layout";
import { useText } from "./language";

const STORAGE_KEY = "pinjamtedi:keyboard-nav";

/** "g" then a letter. Letters stay the same in every language; page names come from LAYOUT_TEXT.pages. */
const GO_TO: Record<string, { href: string; page: PageKey }> = {
  b: { href: "/", page: "home" },
  c: { href: "/catalog", page: "catalog" },
  s: { href: "/room-schedule", page: "roomSchedule" },
  h: { href: "/how-to-borrow", page: "howToBorrow" },
  m: { href: "/my-requests", page: "myRequests" },
};

/** Rows shown in the shortcut list: [keys, label]. */
function shortcutRows(text: (typeof LAYOUT_TEXT)["id"]): [string[], string][] {
  const t = text.keyboard;
  return [
    [["/"], t.focusSearch],
    [["?"], t.toggleList],
    [["Esc"], t.closeList],
    ...Object.entries(GO_TO).map(([key, route]) => [["g", key], t.goTo(text.pages[route.page])] as [string[], string]),
  ];
}

/** Thicker focus ring while the mode is on. */
export const KEYBOARD_FOCUS_CSS = `html[data-kbd="on"] :focus-visible { outline: 3px solid var(--color-sun-200) !important; outline-offset: 3px !important; box-shadow: 0 0 0 6px var(--color-focus-halo) !important; }`;

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable;
}

export function useKeyboardNav() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const waitingForG = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // read the saved choice
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") setEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  // mark <html> + save
  useEffect(() => {
    document.documentElement.dataset.kbd = enabled ? "on" : "off";
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (!enabled) setHelpOpen(false);
  }, [enabled]);

  // shortcuts
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") return setHelpOpen(false);
      if (isTyping(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        return setHelpOpen((v) => !v);
      }
      if (e.key === "/") {
        const field = [...document.querySelectorAll<HTMLInputElement>('input[type="search"]')].find((i) => i.offsetParent !== null);
        if (field) {
          e.preventDefault();
          field.focus();
        }
        return;
      }
      if (waitingForG.current) {
        waitingForG.current = false;
        clearTimeout(gTimer.current);
        const route = GO_TO[e.key.toLowerCase()];
        if (route) {
          e.preventDefault();
          router.push(route.href);
        }
        return;
      }
      if (e.key === "g") {
        waitingForG.current = true;
        gTimer.current = setTimeout(() => (waitingForG.current = false), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(gTimer.current);
      waitingForG.current = false;
    };
  }, [enabled, router]);

  return { enabled, setEnabled, helpOpen, setHelpOpen };
}

export function KeyboardHelpDialog({ onClose }: { onClose: () => void }) {
  const text = useText(LAYOUT_TEXT);
  const t = text.keyboard;
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/50 p-5" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-[20px] border-2 border-line-strong bg-surface p-6 text-ink shadow-[5px_5px_0_0_var(--color-shadow-interactive)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[26px] font-normal leading-none">{t.title}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-[10px] border-2 border-line-strong px-3 py-1 text-[13px] font-extrabold"
          >
            {t.close}
          </button>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {shortcutRows(text).map(([keys, label]) => (
            <li key={label} className="flex items-center justify-between gap-4 text-[14px]">
              <span className="text-ink-body">{label}</span>
              <span className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-[12px] text-ink-muted">{t.then}</span>}
                    <kbd className="min-w-6 rounded-[6px] border-2 border-line-strong bg-surface-warm px-1.5 text-center text-[13px] font-extrabold">{k}</kbd>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12px] text-ink-muted">{t.footnote}</p>
      </div>
    </div>
  );
}