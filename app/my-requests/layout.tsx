// app/my-requests/layout.tsx
// "Pengajuan saya" metadata (page.tsx is a client component). Personal data → not indexed.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengajuan saya",
  description: "Riwayat dan status pengajuan peminjaman alat dan ruang DTEDI.",
  robots: { index: false, follow: true },
};

export default function MyRequestsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
