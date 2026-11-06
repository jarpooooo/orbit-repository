// app/catalog/[slug]/letter/page.tsx
//
// Permission letter preview before downloading. Thin server page; the content is a client component.

import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import LetterPreview from "@/app/components/catalog/letter-preview";
import { FACILITIES, getFacility } from "@/app/data/facilities";
import { localizeFacility } from "@/app/i18n/facilities";
import { RequireAuth } from "@/app/components/layout/auth-gate";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ slug: f.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const facility = getFacility(slug);
  const f = facility && localizeFacility(facility, "id");
  return {
    title: f ? `Pratinjau surat ${f.name}` : "Pratinjau surat",
    robots: { index: false, follow: true },
    alternates: { canonical: `/catalog/${slug}/letter` },
  };
}

// LetterPreview uses useSearchParams → needs <Suspense>
export default function LetterPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-page" />}>
      <LetterContent params={params} />
    </Suspense>
  );
}

async function LetterContent({ params }: { params: Params }) {
  const f = getFacility((await params).slug);
  if (!f) notFound();
  // signed-in users only: the request is saved under the account (catalog + detail stay public)
  return (
    <RequireAuth>
      <LetterPreview facility={f} />
    </RequireAuth>
  );
}
