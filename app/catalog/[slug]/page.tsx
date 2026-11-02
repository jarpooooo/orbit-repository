// app/catalog/[slug]/page.tsx
//
// Facility detail page (Figma "03 Detail – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:722).
// ONE page for every facility: content comes from app/data/facilities.ts by slug.
// Server component: static params, metadata (Indonesian), and notFound; the content is <FacilityDetail />
// (client, follows the language preference).

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import FacilityDetail from "@/app/components/catalog/facility-detail";
import { FACILITIES, getFacility } from "@/app/data/facilities";
import { BASE_OPEN_GRAPH } from "@/app/data/site";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const f = getFacility((await params).slug);
  if (!f) return { title: "Fasilitas" };
  const url = `/catalog/${f.slug}`;
  return {
    title: f.name,
    description: f.longDescription ?? f.description,
    alternates: { canonical: url },
    openGraph: { ...BASE_OPEN_GRAPH, title: f.name, description: f.description, url },
  };
}

export default async function FacilityDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getFacility(slug)) notFound();
  return <FacilityDetail slug={slug} />;
}
