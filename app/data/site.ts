// app/data/site.ts
//
// Shared site info for SEO: used by the root layout (metadata), sitemap.ts, robots.ts, manifest.ts,
// opengraph-image.tsx, and the home page JSON-LD.
// The site URL comes from NEXT_PUBLIC_SITE_URL (set it on deploy).
// If it is empty: production builds use the Firebase Hosting domain, development uses localhost.

export const SITE = {
  name: "PinjamTEDI",
  description:
    "Pinjam alat dan ruang Departemen Teknik Elektro dan Informatika (DTEDI) Sekolah Vokasi UGM. Cek stok Arduino, jadwal ruang diskusi, sampai kamera departemen dari satu tempat.",
  organization: "Departemen Teknik Elektro dan Informatika, Sekolah Vokasi Universitas Gadjah Mada",
  address: "Jl. Yacaranda, Sekip Unit III, Yogyakarta 55281",
  /** [dummy] helpdesk address for "Lapor kendala" in the footer */
  email: "pinjamtedi@ugm.ac.id",
} as const;

/** Base Open Graph data. `openGraph` metadata is merged shallowly, so pages that override openGraph must spread this. */
export const BASE_OPEN_GRAPH = {
  type: "website" as const,
  locale: "id_ID",
  alternateLocale: ["en_US"],
  siteName: SITE.name,
  // app/opengraph-image.tsx. Listed here because a page that sets its own openGraph loses the inherited file image.
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE.name}: peminjaman alat dan ruang DTEDI Sekolah Vokasi UGM` }],
};

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production" ? "https://pinjamtedi.web.app" : "http://localhost:3000")
).replace(/\/$/, "");
