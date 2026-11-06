// app/components/catalog/catalog-from-url.tsx  (used by app/catalog/page.tsx)
//
// Reads the catalog filters from the URL in the browser and hands them to <FacilityCatalog />
// (the static export has no server to read them). URL params stay Indonesian: q, kategori, grup, lokasi,
// kapasitas, tanggal.

"use client";

import { useSearchParams } from "next/navigation";
import FacilityCatalog from "./facility-catalog";

export default function CatalogFromUrl() {
  const params = useSearchParams();
  const get = (key: string) => params.get(key) ?? undefined;
  return (
    // no `key` from the params: FacilityCatalog writes its filters back with history.replaceState, which
    // updates useSearchParams; a key would remount the catalog (and drop input focus) on every keystroke
    <FacilityCatalog
      initialQuery={get("q")}
      initialCategory={get("kategori")}
      initialGroup={get("grup")}
      initialLocation={get("lokasi")}
      initialCapacity={get("kapasitas")}
      initialDate={get("tanggal")}
    />
  );
}
