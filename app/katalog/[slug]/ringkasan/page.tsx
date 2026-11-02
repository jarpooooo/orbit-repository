// app/katalog/[slug]/ringkasan/page.tsx
//
// Langkah 5 "Ringkasan" (Figma "06 Ringkasan – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:1633).
// Server page tipis: cari barang dari slug, serahkan ke komponen client (baca kode/hari/sesi/jumlah dari query).

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import RingkasanPengajuan from "@/app/components/katalog/ringkasan-pengajuan";
import { FASILITAS, getFasilitas } from "@/app/data/fasilitas";

type Params = { slug: string };

export function generateStaticParams() {
  return FASILITAS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const f = getFasilitas((await params).slug);
  return { title: f ? `Pengajuan ${f.name} terkirim | PinjamTEDI` : "Ringkasan | PinjamTEDI" };
}

export default function RingkasanPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#d7eefb]" />}>
      <Isi params={params} />
    </Suspense>
  );
}

async function Isi({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const f = getFasilitas(slug);
  if (!f) notFound();
  // RingkasanPengajuan memakai useSearchParams → butuh <Suspense> (sudah ada di atas)
  return <RingkasanPengajuan f={f} />;
}