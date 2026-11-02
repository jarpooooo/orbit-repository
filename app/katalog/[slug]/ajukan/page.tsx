// app/katalog/[slug]/ajukan/page.tsx
//
// Langkah 4 "Ajukan" (Figma "05 Pengajuan – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:1342).
// Server page tipis: cari barang dari slug, serahkan ke komponen client (form + baca query hari/sesi/jumlah).

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import FormAjukan from "@/app/components/katalog/form-ajukan";
import { FASILITAS, getFasilitas } from "@/app/data/fasilitas";

type Params = { slug: string };

export function generateStaticParams() {
  return FASILITAS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFasilitas(slug);
  // halaman form: tidak perlu diindeks mesin pencari
  return {
    title: f ? `Ajukan ${f.name}` : "Ajukan",
    robots: { index: false, follow: true },
    alternates: { canonical: `/katalog/${slug}/ajukan` },
  };
}

export default function AjukanPage({ params }: { params: Promise<Params> }) {
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
  // FormAjukan memakai useSearchParams → butuh <Suspense> (sudah ada di atas)
  return <FormAjukan f={f} />;
}