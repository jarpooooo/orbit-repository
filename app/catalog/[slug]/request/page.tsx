// app/catalog/[slug]/request/page.tsx
//
// Step 4 "Ajukan" (Figma "05 Pengajuan – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:1342).
// Thin server page: looks the facility up by slug, then hands it to the client form (which reads hari/sesi/jumlah).

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import RequestForm from "@/app/components/catalog/request-form";
import { FACILITIES, getFacility } from "@/app/data/facilities";
import { localizeFacility } from "@/app/i18n/facilities";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const facility = getFacility(slug);
  const f = facility && localizeFacility(facility, "id");
  // form page: no need for search engines to index it
  return {
    title: f ? `Ajukan ${f.name}` : "Ajukan",
    robots: { index: false, follow: true },
    alternates: { canonical: `/catalog/${slug}/request` },
  };
}

// RequestForm uses useSearchParams → needs <Suspense>
export default function RequestPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-page" />}>
      <RequestContent params={params} />
    </Suspense>
  );
}

async function RequestContent({ params }: { params: Params }) {
  const f = getFacility((await params).slug);
  if (!f) notFound();
  return <RequestForm facility={f} />;
}
