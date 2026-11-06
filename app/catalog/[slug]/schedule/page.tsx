// app/catalog/[slug]/schedule/page.tsx
//
// Step 3 "Jadwal" (Figma "04 Jadwal – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:979).
// Thin server page: looks the facility up by slug, then hands it to the interactive client component.
// (Split because generateStaticParams is server-only, and this project uses Cache Components.)

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SchedulePicker from "@/app/components/catalog/schedule-picker";
import { FACILITIES, getFacility } from "@/app/data/facilities";
import { localizeFacility } from "@/app/i18n/facilities";
import { RequireAuth } from "@/app/components/layout/auth-gate";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const facility = getFacility((await params).slug);
  if (!facility) return { title: "Pilih jadwal" };
  const f = localizeFacility(facility, "id");
  return {
    title: `Pilih jadwal ${f.name}`,
    description: `Cek ketersediaan dan pilih jadwal peminjaman ${f.name} di PinjamTEDI.`,
    alternates: { canonical: `/catalog/${f.id}/schedule` },
    // signed-in only (RequireAuth): crawlers would only see an empty page
    robots: { index: false, follow: true },
  };
}

export default async function SchedulePage({ params }: { params: Params }) {
  const f = getFacility((await params).slug);
  if (!f) notFound();
  // signed-in users only: the request is saved under the account (catalog + detail stay public)
  return (
    <RequireAuth>
      <SchedulePicker facility={f} />
    </RequireAuth>
  );
}
