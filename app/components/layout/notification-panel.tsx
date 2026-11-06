// app/components/layout/notification-panel.tsx
//
// Bell + notification panel (Figma "08 Notifikasi (panel terbuka)", panel node 1:2494).
// One file: bell button (orange dot when something is unread) + dropdown panel.
//  - Click the bell = open/close. Also closes on outside click, Escape, or navigation.
//  - "Tandai dibaca" marks every row as read (yellow row → plain surface, dot disappears).
//  - Screens < xl: the panel spans the full width under the navbar. xl screens: 360px under the bell.
// SAMPLE_NOTIFICATIONS = example data from Figma (static, not persisted yet); its text lives in
// LAYOUT_TEXT.notifications.samples (app/i18n/site-layout.ts).

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { LAYOUT_TEXT, type SampleNotificationKey } from "@/app/i18n/site-layout";
import { useText } from "./language";

type Notification = { id: SampleNotificationKey; href: string; unread: boolean };

// Sample data (text in LAYOUT_TEXT, exactly as in Figma). Replace with API data later.
const SAMPLE_NOTIFICATIONS: readonly Notification[] = [
  { id: "n1", href: "/my-requests", unread: true },
  { id: "n2", href: "/my-requests", unread: false },
  { id: "n3", href: "/my-requests", unread: false },
];

export default function NotificationPanel() {
  const t = useText(LAYOUT_TEXT).notifications;
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<readonly Notification[]>(SAMPLE_NOTIFICATIONS);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // close on navigation
  useEffect(() => setOpen(false), [pathname]);

  // outside click / Escape closes the panel
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        bellRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, unread: false })));
  const markRead = (id: string) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <div ref={containerRef} className="relative">
      {/* Bell */}
      <button
        ref={bellRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t.bellLabel(unreadCount)}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-brand-interactive text-on-interactive transition-colors hover:bg-brand-interactive-hover sm:size-12"
      >
        <Bell size={20} strokeWidth={2.25} aria-hidden />
        {unreadCount > 0 && <span aria-hidden className="absolute -right-1 -top-1 size-[10px] rounded-full bg-tangerine-300" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label={t.title}
          className="fixed inset-x-3 top-[84px] z-50 overflow-hidden rounded-[18px] border-2 border-line-strong bg-surface shadow-[4px_4px_0_0_var(--color-shadow)] sm:inset-x-8 sm:top-[92px] xl:absolute xl:inset-x-auto xl:right-0 xl:top-[calc(100%+14px)] xl:w-[360px] xl:shadow-[6px_6px_0_0_var(--color-shadow)]"
        >
          <div className="flex items-center justify-between gap-3 bg-brand-secondary px-4 py-3 text-on-secondary">
            <h2 className="font-display text-[22px] font-normal leading-[normal] text-on-secondary">{t.title}</h2>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="text-[12px] font-extrabold leading-[normal] hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
            >
              {t.markAllRead}
            </button>
          </div>

          <ul data-lenis-prevent className="max-h-[60dvh] overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => markRead(n.id)}
                  className={`flex flex-col gap-[2px] px-4 py-3 leading-[normal] transition-colors hover:bg-surface-row focus-visible:bg-surface-row ${n.unread ? "bg-surface-row" : "bg-surface"}`}
                >
                  <span className="text-[14px] font-extrabold text-ink">
                    {n.unread && <span className="sr-only">{t.unread}</span>}
                    {t.samples[n.id].title}
                  </span>
                  <span className="text-[12px] text-ink-muted">{t.samples[n.id].info}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
