// app/catalog/page.tsx
//
// "Katalog" page (Figma "1.4 Katalog", node 148:1201).
// Static export (Firebase Hosting): there is no server to read the URL, so the filters (?q= from the navbar /
// hero, ?kategori= from the home page cards, plus ?grup= ?lokasi= ?kapasitas= ?tanggal=) are read in the browser
// by <CatalogFromUrl /> (useSearchParams). The static HTML holds the full, unfiltered catalog (the Suspense
// fallback), so every card is still in the initial HTML for search engines.

import { Suspense } from "react";
import FacilityCatalog from "@/app/components/catalog/facility-catalog";
import CatalogFromUrl from "@/app/components/catalog/catalog-from-url";

export default function CatalogPage() {
  return (
    <Suspense fallback={<FacilityCatalog />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
