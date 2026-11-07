// app/components/layout/auth-gate.tsx
//
// Sign-in gates (state from useAuth(), app/lib/auth.ts):
// - <RequireAuth>: pages for signed-in users only ("Pengajuan saya", every request step after the detail
//   page, because the request is saved under the account). Signed out → /login?next=<this page>, and the
//   login page sends the user back afterwards.
// - <SignedInOnly>: renders its children only when signed in (e.g. the notification section on the home page).
// These are UX gates in the browser; the data itself is protected by firestore.rules.

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/app/lib/auth";

/** /login link that returns to `path` after signing in. */
export const loginHref = (path: string) => `/login?next=${encodeURIComponent(path)}`;

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.status === "signed-out") router.replace(loginHref(pathname + window.location.search));
  }, [auth.status, pathname, router]);

  // loading or on the way to /login: an empty page, so protected content never flashes
  if (auth.status !== "signed-in") return <main aria-busy className="min-h-screen bg-page" />;
  return children;
}

export function SignedInOnly({ children }: { children: ReactNode }) {
  return useAuth().status === "signed-in" ? children : null;
}

/** Admin pages. Signed out → /login; signed in without the admin role → a short notice. */
export function RequireAdmin({ children, denied }: { children: ReactNode; denied: ReactNode }) {
  const auth = useAuth();
  return (
    <RequireAuth>{auth.status === "signed-in" && auth.session.role === "admin" ? children : denied}</RequireAuth>
  );
}
