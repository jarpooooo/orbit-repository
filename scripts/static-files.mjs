// scripts/static-files.mjs: runs before `next build` (npm run build).
//
// The site is a static export on Firebase Hosting, and Next's metadata route files (manifest.ts, robots.ts,
// sitemap.ts) cannot be exported while cacheComponents is on. So this script writes them as plain files
// into public/ (git-ignored, regenerated on every build):
//   public/manifest.webmanifest  PWA manifest (install, icons, shortcuts)
//   public/robots.txt            crawl rules + sitemap link
//   public/sitemap.xml           public pages + every facility detail page (from FACILITIES)
// The site URL comes from NEXT_PUBLIC_SITE_URL (app/data/site.ts), set in the GitHub deploy workflow.

import { writeFileSync } from "node:fs";
import { FACILITIES } from "../app/data/facilities.ts";
import { SITE, SITE_URL } from "../app/data/site.ts";

/* ------------------------------- manifest ------------------------------- */
// Colors are PALETTE values from app/design/colors.css (a manifest cannot read CSS tokens).
const manifest = {
  id: "/",
  name: `${SITE.name}: Peminjaman Alat dan Ruang DTEDI`,
  short_name: SITE.name,
  description: SITE.description,
  lang: "id",
  dir: "ltr",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
  background_color: "#d7eefb", // --color-sky (splash screen)
  theme_color: "#d7eefb", // same as viewport.themeColor in app/layout.tsx
  categories: ["education", "productivity"],
  icons: [
    { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
    { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
  // long-press the app icon (Android) / right-click (desktop)
  shortcuts: [
    { name: "Katalog", short_name: "Katalog", url: "/catalog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    { name: "Pengajuan saya", short_name: "Pengajuan", url: "/my-requests", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    { name: "Jadwal ruang", short_name: "Jadwal", url: "/room-schedule", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
  ],
};
writeFileSync("public/manifest.webmanifest", JSON.stringify(manifest, null, 2) + "\n");

/* -------------------------------- robots -------------------------------- */
// Request-flow pages and personal data are not indexed. The schedule step is not blocked on purpose:
// crawlers must read its noindex tag to drop it.
writeFileSync(
  "public/robots.txt",
  [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /my-requests",
    "Disallow: /catalog/*/request",
    "Disallow: /catalog/*/letter",
    "Disallow: /catalog/*/summary",
    "",
    `Host: ${SITE_URL}`,
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n"),
);

/* -------------------------------- sitemap ------------------------------- */
// Public pages + facility details. Booking steps need an account, so they are not listed.
const pages = [
  ["/", "daily", 1],
  ["/catalog", "daily", 0.9],
  ["/room-schedule", "daily", 0.8],
  ["/room-schedule/most-borrowed", "weekly", 0.6],
  ["/how-to-borrow", "monthly", 0.7],
  ...FACILITIES.map((f) => [`/catalog/${f.id}`, "weekly", 0.7]),
];
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages
      .map(([path, freq, priority]) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${priority}</priority></url>`)
      .join("\n") +
    "\n</urlset>\n",
);

console.log(`static files: manifest.webmanifest, robots.txt, sitemap.xml (${pages.length} URLs) for ${SITE_URL}`);
