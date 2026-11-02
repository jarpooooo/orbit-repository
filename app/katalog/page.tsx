// app/katalog/page.tsx
//
// Halaman "Katalog fasilitas" (Figma 02 Katalog, node 1:205).
// Server page tipis: baca ?q= (dari navbar / hero) dan ?kategori= (dari kartu Beranda) di server,
// lalu serahkan ke komponen client. Dengan begitu daftar kartu ikut ada di HTML awal (baik untuk SEO).

import { Suspense } from "react";
import KatalogFasilitas from "@/app/components/katalog/katalog-fasilitas";

type SearchParams = Promise<{ q?: string; kategori?: string }>;

// searchParams = data runtime → butuh <Suspense> supaya kerangka halaman tetap bisa di-prerender (Cache Components)
export default function KatalogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#d7eefb]" />}>
      <Isi searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  return <KatalogFasilitas initialQuery={sp.q} initialKategori={sp.kategori} />;
}
