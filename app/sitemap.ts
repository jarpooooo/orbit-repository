// app/sitemap.ts → /sitemap.xml
// Public pages + the detail page of every facility (from facilities.ts).
// The booking steps (schedule, request, letter, summary) need an account, so they are not listed.

import type { MetadataRoute } from "next";
import { FACILITIES } from "@/app/data/facilities";
import { SITE_URL } from "@/app/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/room-schedule`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/room-schedule/most-borrowed`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/how-to-borrow`, changeFrequency: "monthly", priority: 0.7 },
  ];

  const facilityPages: MetadataRoute.Sitemap = FACILITIES.map((f) => ({
    url: `${SITE_URL}/catalog/${f.id}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pages, ...facilityPages];
}
