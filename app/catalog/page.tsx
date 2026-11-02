// app/catalog/page.tsx
//
// "Katalog fasilitas" page (Figma 02 Katalog, node 1:205).
// Thin server page: reads ?q= (from the navbar / hero) and ?kategori= (from the home page cards) on the server,
// then hands them to the client component. That way the card list is in the initial HTML (good for SEO).

import { Suspense } from "react";
import FacilityCatalog from "@/app/components/catalog/facility-catalog";

type SearchParams = Promise<{ q?: string; kategori?: string }>;

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
  return <FacilityCatalog initialQuery={params.q} initialCategory={params.kategori} />;
}
