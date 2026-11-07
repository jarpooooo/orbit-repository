// app/catalog/page.tsx
//
// "Katalog" page (Figma "1.4 Katalog", node 148:1201).
// Thin server page: reads the URL filters on the server (?q= from the navbar / hero, ?kategori= from the home
// page cards, plus ?grup= ?lokasi= ?kapasitas= ?tanggal=), then hands them to the client component.
// That way the card list is in the initial HTML (good for SEO).

import { Suspense } from "react";
import FacilityCatalog from "@/app/components/catalog/facility-catalog";

type SearchParams = Promise<{ q?: string; kategori?: string; grup?: string; lokasi?: string; kapasitas?: string; tanggal?: string }>;

// searchParams is runtime data → needs <Suspense> so the page shell can still be prerendered (Cache Components)
export default function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-page" />}>
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return (
    <FacilityCatalog
      initialQuery={params.q}
      initialCategory={params.kategori}
      initialGroup={params.grup}
      initialLocation={params.lokasi}
      initialCapacity={params.kapasitas}
      initialDate={params.tanggal}
    />
  );
}
