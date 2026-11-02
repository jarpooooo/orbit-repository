// app/data/situs.ts
//
// Info situs BERSAMA untuk SEO: dipakai layout (metadata), sitemap.ts, robots.ts, dan JSON-LD Beranda.
// Alamat situs diambil dari env NEXT_PUBLIC_SITE_URL (isi saat deploy, mis. https://pinjamtedi.vercel.app).
// Kalau kosong: di Vercel pakai domain produksi otomatis, di lokal pakai localhost.

export const SITUS = {
  nama: "PinjamTEDI",
  deskripsi:
    "Pinjam alat dan ruang Departemen Teknik Elektro dan Informatika (DTEDI) Sekolah Vokasi UGM. Cek stok Arduino, jadwal ruang diskusi, sampai kamera departemen dari satu tempat.",
  organisasi: "Departemen Teknik Elektro dan Informatika, Sekolah Vokasi Universitas Gadjah Mada",
  alamat: "Jl. Yacaranda, Sekip Unit III, Yogyakarta 55281",
} as const;

/** Dasar Open Graph. Metadata `openGraph` di-merge dangkal, jadi halaman yang menimpa openGraph perlu spread ini. */
export const OG_DASAR = {
  type: "website",
  locale: "id_ID",
  siteName: SITUS.nama,
} as const;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
