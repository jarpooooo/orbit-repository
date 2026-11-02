// app/catalog/[slug]/summary/page.tsx
//
// Step 5 "Ringkasan" (Figma "06 Ringkasan – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:1633).
// Thin server page: looks the facility up by slug, then hands it to the client component (which reads kode/hari/sesi/jumlah).

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import RequestSummary from "@/app/components/catalog/request-summary";
import { FACILITIES, getFacility } from "@/app/data/facilities";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFacility(slug);
  // request result page: no need for search engines to index it
  return {
    title: f ? `Pengajuan ${f.name} terkirim` : "Ringkasan",
    robots: { index: false, follow: true },
    alternates: { canonical: `/catalog/${slug}/summary` },
  };
}

// RequestSummary uses useSearchParams → needs <Suspense>
export default function SummaryPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-page" />}>
      <SummaryContent params={params} />
    </Suspense>
  );
}

async function SummaryContent({ params }: { params: Params }) {
  const f = getFacility((await params).slug);
  if (!f) notFound();
  return <RequestSummary facility={f} />;
}
