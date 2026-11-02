// app/katalog/layout.tsx
// Metadata halaman Katalog (page.tsx adalah client component, jadi metadata ditaruh di layout ini).

import type { Metadata } from "next";
import { SITUS } from "@/app/data/situs";

export const metadata: Metadata = {
  // template diulang di sini: title berupa string di layout akan memutus template dari root untuk halaman anak
  title: { absolute: `Katalog fasilitas | ${SITUS.nama}`, template: `%s | ${SITUS.nama}` },
  description:
    "Daftar alat dan ruang DTEDI yang bisa dipinjam: mikrokontroler, perangkat jaringan, alat ukur, ruang diskusi, PC lab, kamera, dan perlengkapan acara.",
  alternates: { canonical: "/katalog" },
};

export default function KatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
