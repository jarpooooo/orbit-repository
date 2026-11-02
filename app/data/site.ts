// app/data/site.ts
//
// Shared site info for SEO: used by the root layout (metadata), sitemap.ts, robots.ts, and the home page JSON-LD.
// The site URL comes from NEXT_PUBLIC_SITE_URL (set on deploy, e.g. https://pinjamtedi.vercel.app).
// If it is empty: on Vercel the production domain is used automatically, locally it falls back to localhost.

export const SITE = {
  name: "PinjamTEDI",
  description:
    "Pinjam alat dan ruang Departemen Teknik Elektro dan Informatika (DTEDI) Sekolah Vokasi UGM. Cek stok Arduino, jadwal ruang diskusi, sampai kamera departemen dari satu tempat.",
  organization: "Departemen Teknik Elektro dan Informatika, Sekolah Vokasi Universitas Gadjah Mada",
  address: "Jl. Yacaranda, Sekip Unit III, Yogyakarta 55281",
} as const;

/** Base Open Graph data. `openGraph` metadata is merged shallowly, so pages that override openGraph must spread this. */
export const BASE_OPEN_GRAPH = {
  type: "website",
  locale: "id_ID",
  siteName: SITE.name,
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
