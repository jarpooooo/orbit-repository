// app/lib/auth.ts
//
// DEMO login state, no real authentication and no backend.
// A flag in localStorage ("pinjamtedi:session") says whether someone is "signed in".
// The login page calls signIn(); anything can read it with useSession().
// Replace with real auth (cookies / API) later; keep the useSession() shape.

"use client";

import { useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "pinjamtedi:session";

export type SessionRole = "student" | "staff";
export type Session = { role: SessionRole; name: string };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange(); // other tab signed in/out
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function signIn(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore: private mode */
  }
  notify();
}

export function signOut() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  notify();
}

/** Current session, or null when signed out (also null on the server and during hydration). */
export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as Partial<Session>;
      return (s.role === "student" || s.role === "staff") && typeof s.name === "string" ? { role: s.role, name: s.name } : null;
    } catch {
      return null;
    }
  }, [raw]);
}