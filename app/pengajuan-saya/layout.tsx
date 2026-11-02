// app/pengajuan-saya/layout.tsx
// Metadata halaman Pengajuan saya (page.tsx adalah client component). Data pribadi → tidak diindeks.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengajuan saya",
  description: "Riwayat dan status pengajuan peminjaman alat dan ruang DTEDI.",
  robots: { index: false, follow: true },
};

export default function PengajuanSayaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
