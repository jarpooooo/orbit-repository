// app/robots.ts → /robots.txt
// Request-flow pages (request/letter/summary) and personal data (my-requests) do not need indexing.
// The schedule step is not blocked here on purpose: crawlers must read its noindex tag to drop it.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/my-requests", "/catalog/*/request", "/catalog/*/letter", "/catalog/*/summary"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
