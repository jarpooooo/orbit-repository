// app/catalog/layout.tsx
// Catalog page metadata (kept in the layout so child pages inherit the title template).

import type { Metadata } from "next";
import { SITE } from "@/app/data/site";

export const metadata: Metadata = {
  // the template is repeated here: a plain string title in a layout would cut child pages off from the root template
  title: { absolute: `Katalog fasilitas | ${SITE.name}`, template: `%s | ${SITE.name}` },
  description:
    "Daftar alat dan ruang DTEDI yang bisa dipinjam: mikrokontroler, perangkat jaringan, alat ukur, ruang diskusi, PC lab, kamera, dan perlengkapan acara.",
  alternates: { canonical: "/catalog" },
};

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
