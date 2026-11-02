// app/jadwal-ruang/layout.tsx
// Metadata halaman Jadwal Ruang (page.tsx adalah client component, jadi metadata ditaruh di layout ini).

import type { Metadata } from "next";
import { SITUS } from "@/app/data/situs";

export const metadata: Metadata = {
  // template diulang di sini: title berupa string di layout akan memutus template dari root untuk halaman anak
  title: { absolute: `Jadwal ruang | ${SITUS.nama}`, template: `%s | ${SITUS.nama}` },
  description: "Lihat ketersediaan ruang dan alat DTEDI per sesi untuk tiap hari kerja, lalu langsung ajukan peminjaman.",
  alternates: { canonical: "/jadwal-ruang" },
};

export default function JadwalRuangLayout({ children }: { children: React.ReactNode }) {
  return children;
}
