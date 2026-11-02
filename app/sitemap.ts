// app/sitemap.ts → /sitemap.xml
// Halaman publik + detail & jadwal tiap fasilitas (dari fasilitas.ts).

import type { MetadataRoute } from "next";
import { FASILITAS } from "@/app/data/fasilitas";
import { SITE_URL } from "@/app/data/situs";

export default function sitemap(): MetadataRoute.Sitemap {
  const halaman: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/katalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/jadwal-ruang`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/jadwal-ruang/paling-sering-dipinjam`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/cara-pinjam`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const fasilitas: MetadataRoute.Sitemap = FASILITAS.flatMap((f) => [
    { url: `${SITE_URL}/katalog/${f.slug}`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/katalog/${f.slug}/jadwal`, changeFrequency: "daily", priority: 0.5 },
  ]);

  return [...halaman, ...fasilitas];
}
