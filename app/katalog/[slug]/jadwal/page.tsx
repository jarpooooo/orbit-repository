// app/katalog/[slug]/jadwal/page.tsx
//
// Langkah 3 "Jadwal" (Figma "04 Jadwal – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:979).
// Server page tipis: cari barang dari slug, lalu serahkan ke komponen client yang interaktif.
// (Dipisah karena generateStaticParams hanya boleh di server, dan project ini memakai Cache Components.)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PilihJadwal from "@/app/components/katalog/pilih-jadwal";
import { FASILITAS, getFasilitas } from "@/app/data/fasilitas";

type Params = { slug: string };

export function generateStaticParams() {
  return FASILITAS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const f = getFasilitas((await params).slug);
  if (!f) return { title: "Pilih jadwal" };
  return {
    title: `Pilih jadwal ${f.name}`,
    description: `Cek ketersediaan dan pilih jadwal peminjaman ${f.name} di PinjamTEDI.`,
    alternates: { canonical: `/katalog/${f.slug}/jadwal` },
  };
}

export default async function JadwalPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const f = getFasilitas(slug);
  if (!f) notFound();
  return <PilihJadwal f={f} />;
}