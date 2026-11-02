// app/robots.ts → /robots.txt
// Halaman alur pengajuan (ajukan/ringkasan) dan data pribadi (pengajuan-saya) tidak perlu diindeks.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/data/situs";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/pengajuan-saya", "/katalog/*/ajukan", "/katalog/*/ringkasan"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
