// app/catalog/[slug]/schedule/page.tsx
//
// Step 3 "Jadwal" (Figma "04 Jadwal – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:979).
// Thin server page: looks the facility up by slug, then hands it to the interactive client component.
// (Split because generateStaticParams is server-only, and this project uses Cache Components.)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchedulePicker from "@/app/components/catalog/schedule-picker";
import { FACILITIES, getFacility } from "@/app/data/facilities";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const f = getFacility((await params).slug);
  if (!f) return { title: "Pilih jadwal" };
  return {
    title: `Pilih jadwal ${f.name}`,
    description: `Cek ketersediaan dan pilih jadwal peminjaman ${f.name} di PinjamTEDI.`,
    alternates: { canonical: `/catalog/${f.slug}/schedule` },
  };
}

export default async function SchedulePage({ params }: { params: Params }) {
  const f = getFacility((await params).slug);
  if (!f) notFound();
  return <SchedulePicker facility={f} />;
}
