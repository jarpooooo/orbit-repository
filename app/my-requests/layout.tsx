// app/my-requests/layout.tsx
// "Pengajuan saya" metadata (page.tsx is a client component). Personal data → not indexed.
// Signed-in users only: <RequireAuth> sends everyone else to /login?next=/my-requests.

import type { Metadata } from "next";
import { RequireAuth } from "@/app/components/layout/auth-gate";

export const metadata: Metadata = {
  title: "Pengajuan saya",
  description: "Riwayat dan status pengajuan peminjaman alat dan ruang DTEDI.",
  robots: { index: false, follow: true },
};

export default function MyRequestsLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
