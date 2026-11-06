// app/components/layout/account-menu.tsx
//
// Account button in the navbar.
// - signed out (or still loading): user icon → /login
// - signed in: initial / photo; the menu shows name, email, role, "Pengajuan saya", and "Keluar"
// Session from useAuth() (app/lib/auth.ts). Text: ACCOUNT_TEXT (app/i18n/account.ts).

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { User } from "lucide-react";
import { ACCOUNT_TEXT } from "@/app/i18n/account";
import { signOut, useAuth } from "@/app/lib/auth";
import { useText } from "./language";

const BUTTON =
  "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border-2 border-line-strong transition-colors sm:size-12";

export default function AccountMenu() {
  const t = useText(ACCOUNT_TEXT);
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // close on outside click / Escape (state changes happen in the event callbacks)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (auth.status !== "signed-in") {
    return (
      <Link
        href="/login"
        aria-label={t.signIn}
        title={t.signIn}
        aria-current={pathname === "/login" ? "page" : undefined}
        className={`${BUTTON} bg-surface text-ink hover:bg-brand-secondary/40`}
      >
        <User size={20} strokeWidth={2.25} aria-hidden />
      </Link>
    );
  }

  const { session } = auth;
  const initial = session.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={t.account(session.name)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={`${BUTTON} bg-brand-secondary text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)]`}
      >
        {session.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google profile photo from an external host
          <img src={session.photoUrl} alt="" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <span aria-hidden className="font-display text-[20px] leading-none">{initial}</span>
        )}
      </button>

      {open && (
        <div
          id={panelId}
          className="fixed inset-x-3 top-[84px] z-50 flex flex-col gap-3 rounded-[18px] border-2 border-line-strong bg-surface p-4 shadow-[5px_5px_0_0_var(--color-shadow)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[280px]"
        >
          <div className="flex min-w-0 flex-col gap-[2px]">
            <span className="font-display truncate text-[20px] leading-[normal] text-ink">{session.name}</span>
            <span className="truncate text-[13px] text-ink-muted">{session.email}</span>
            <span className="mt-1 w-fit rounded-md bg-pair-gray-bg px-2 py-[3px] text-[12px] font-extrabold text-pair-gray-fg">
              {t.roles[session.role]}
            </span>
            {!session.emailVerified && <span className="mt-1 text-[12px] font-bold text-status-attention-fg">{t.unverified}</span>}
          </div>
          {/* <Link
            href="/my-requests"
            onClick={() => setOpen(false)}
            className="rounded-[12px] border-2 border-line-strong bg-surface px-3 py-2 text-[14px] font-extrabold text-ink hover:bg-surface-warm"
          >
            {t.myRequests}
          </Link> */}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
            }}
            className="rounded-[12px] border-2 border-line-strong bg-brand-primary px-3 py-2 text-[14px] font-extrabold text-on-primary"
          >
            {t.signOut}
          </button>
        </div>
      )}
    </div>
  );
}
