// app/jadwal-ruang/paling-sering-dipinjam/layout.tsx
// Metadata halaman Paling sering dipinjam (page.tsx adalah client component).

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paling sering dipinjam",
  description: "Peringkat alat dan ruang DTEDI yang paling sering dipinjam minggu ini, bulan ini, dan semester ini.",
  alternates: { canonical: "/jadwal-ruang/paling-sering-dipinjam" },
};

export default function PalingSeringLayout({ children }: { children: React.ReactNode }) {
  return children;
}
