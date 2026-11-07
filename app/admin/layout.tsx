// app/admin/layout.tsx
// Admin page metadata (page.tsx is a client component). Never indexed. Admin accounts only (ADMIN_EMAILS in
// app/lib/auth.ts, isAdmin() in firestore.rules); anyone else sees a notice.

import type { Metadata } from "next";
import Link from "next/link";
import { RequireAdmin } from "@/app/components/layout/auth-gate";

export const metadata: Metadata = {
  title: "Panel admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin
      denied={
        <main className="min-h-screen bg-page px-5 pb-16 pt-[132px] sm:px-8 xl:px-[140px]">
          <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-4">
            <h1 className="font-display text-[40px] leading-none text-ink">403</h1>
            <p className="text-[16px] text-ink-body">Halaman ini khusus admin. / This page is for admins only.</p>
            <Link href="/" className="font-bold text-link underline">
              Beranda / Home
            </Link>
          </div>
        </main>
      }
    >
      {children}
    </RequireAdmin>
  );
}
