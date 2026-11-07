// scripts/deploy-firebase.mjs: `npm run deploy:firebase` (add `-- preview` for a 7-day preview URL).
//
// The app is written for a Next server (dynamic: cacheComponents, server searchParams, route-handler
// manifest / sitemap / robots / OG image). The free Firebase plan (Spark) can only host static files, so this
// script makes a STATIC build just for Firebase Hosting, without changing the code in the repo:
//   1. back up the files it touches
//   2. switch them to static-export versions (below)
//   3. `next build` against the REAL Firebase project → out/, then `firebase deploy --only hosting`
//   4. ALWAYS restore every file (also when the build or the deploy fails)
// What the static version changes for users: /catalog?q=… filters in the browser right after load instead of
// on the server. Data (stock, requests, sign-in) is unchanged: it always comes from Firebase in the browser.

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const preview = process.argv.includes("preview");
const SITE_URL = "https://pinjamtedi.web.app";

/* ------------------------------ backup / restore ------------------------------ */

const TOUCHED = [
  "next.config.ts",
  "firebase.json",
  "app/layout.tsx",
  "app/data/site.ts",
  "app/catalog/page.tsx",
  "app/components/catalog/catalog-from-url.tsx",
  "app/manifest.ts",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/opengraph-image.tsx",
  "public/manifest.webmanifest",
  "public/robots.txt",
  "public/sitemap.xml",
  "public/opengraph-image.png",
];
const backupDir = mkdtempSync(join(tmpdir(), "pinjamtedi-deploy-"));
const existed = new Set(TOUCHED.filter((f) => existsSync(f)));
for (const f of existed) {
  mkdirSync(dirname(join(backupDir, f)), { recursive: true });
  cpSync(f, join(backupDir, f));
}
function restore() {
  for (const f of TOUCHED) {
    if (existed.has(f)) cpSync(join(backupDir, f), f);
    else rmSync(f, { force: true });
  }
  rmSync(backupDir, { recursive: true, force: true });
  console.log("restored the dynamic source files");
}
process.on("SIGINT", () => {
  restore();
  process.exit(130);
});

const replace = (file, from, to) => {
  const s = readFileSync(file, "utf8");
  if (!s.includes(from)) throw new Error(`${file}: cannot find ${JSON.stringify(from.slice(0, 60))}`);
  writeFileSync(file, s.replace(from, to));
};

/* ------------------------------ static versions ------------------------------ */

async function makeStatic() {
  writeFileSync(
    "next.config.ts",
    `import type { NextConfig } from "next";
// TEMPORARY (scripts/deploy-firebase.mjs): static export for Firebase Hosting.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  experimental: { agentFeedback: true },
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
};
export default nextConfig;
`,
  );

  // catalog: filters from the URL are read in the browser; the static HTML holds the full catalog
  writeFileSync(
    "app/catalog/page.tsx",
    `import { Suspense } from "react";
import FacilityCatalog from "@/app/components/catalog/facility-catalog";
import CatalogFromUrl from "@/app/components/catalog/catalog-from-url";
// TEMPORARY (scripts/deploy-firebase.mjs): static export reads ?q= ?kategori= ... in the browser.
export default function CatalogPage() {
  return (
    <Suspense fallback={<FacilityCatalog />}>
      <CatalogFromUrl />
    </Suspense>
  );
}
`,
  );
  writeFileSync(
    "app/components/catalog/catalog-from-url.tsx",
    `"use client";
import { useSearchParams } from "next/navigation";
import FacilityCatalog from "./facility-catalog";
// TEMPORARY (scripts/deploy-firebase.mjs)
export default function CatalogFromUrl() {
  const params = useSearchParams();
  const get = (key: string) => params.get(key) ?? undefined;
  return (
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
`,
  );

  // metadata routes need a server under cacheComponents → plain files in public/
  const [{ FACILITIES }, { SITE }] = await Promise.all([import("../app/data/facilities.ts"), import("../app/data/site.ts")]);
  for (const f of ["app/manifest.ts", "app/robots.ts", "app/sitemap.ts", "app/opengraph-image.tsx"]) rmSync(f, { force: true });
  writeFileSync(
    "public/manifest.webmanifest",
    JSON.stringify(
      {
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
        background_color: "#d7eefb",
        theme_color: "#d7eefb",
        categories: ["education", "productivity"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Katalog", short_name: "Katalog", url: "/catalog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
          { name: "Pengajuan saya", short_name: "Pengajuan", url: "/my-requests", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
          { name: "Cek ketersediaan", short_name: "Ketersediaan", url: "/room-schedule", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
        ],
      },
      null,
      2,
    ),
  );
  writeFileSync(
    "public/robots.txt",
    ["User-Agent: *", "Allow: /", "Disallow: /my-requests", "Disallow: /catalog/*/request", "Disallow: /catalog/*/letter", "Disallow: /catalog/*/summary", "", `Host: ${SITE_URL}`, `Sitemap: ${SITE_URL}/sitemap.xml`, ""].join("\n"),
  );
  const pages = [
    ["/", "daily", 1],
    ["/catalog", "daily", 0.9],
    ["/room-schedule", "daily", 0.8],
    ["/room-schedule/most-borrowed", "weekly", 0.6],
    ["/how-to-borrow", "monthly", 0.7],
    ...FACILITIES.map((f) => [`/catalog/${f.id}`, "weekly", 0.7]),
  ];
  writeFileSync(
    "public/sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
      .map(([p, freq, prio]) => `  <url><loc>${SITE_URL}${p}</loc><changefreq>${freq}</changefreq><priority>${prio}</priority></url>`)
      .join("\n")}\n</urlset>\n`,
  );
  cpSync("scripts/firebase-static/opengraph-image.png", "public/opengraph-image.png");
  replace("app/data/site.ts", `url: "/opengraph-image",`, `url: "/opengraph-image.png",`);
  replace("app/layout.tsx", "  applicationName: SITE.name,", '  applicationName: SITE.name,\n  manifest: "/manifest.webmanifest",');

  // Firebase Hosting: the static files + what next.config did on the server (redirects, sw.js headers)
  const firebase = JSON.parse(readFileSync("firebase.json", "utf8"));
  const redirect = (source, destination) => ({ source, destination, type: 301 });
  firebase.hosting = {
    public: "out",
    cleanUrls: true,
    trailingSlash: false,
    ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
    redirects: [
      redirect("/katalog/:slug/jadwal", "/catalog/:slug/schedule"),
      redirect("/katalog/:slug/ajukan", "/catalog/:slug/request"),
      redirect("/katalog/:slug/surat", "/catalog/:slug/letter"),
      redirect("/katalog/:slug/ringkasan", "/catalog/:slug/summary"),
      redirect("/katalog/:path*", "/catalog/:path"),
      redirect("/katalog", "/catalog"),
      redirect("/jadwal-ruang/paling-sering-dipinjam", "/room-schedule/most-borrowed"),
      redirect("/jadwal-ruang", "/room-schedule"),
      redirect("/pengajuan-saya", "/my-requests"),
      redirect("/cara-pinjam", "/how-to-borrow"),
    ],
    headers: [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      { source: "/_next/static/**", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/manifest.webmanifest", headers: [{ key: "Content-Type", value: "application/manifest+json" }] },
    ],
  };
  writeFileSync("firebase.json", JSON.stringify(firebase, null, 2) + "\n");
}

/* ------------------------------------ run ------------------------------------ */

const env = {
  ...process.env,
  NEXT_PUBLIC_USE_EMULATORS: "false", // the real project, whatever .env.local says (process.env wins)
  NEXT_PUBLIC_SITE_URL: SITE_URL,
  NEXT_PUBLIC_DEMO_LOGIN: "true", // demo buttons for judges without a UGM account
};
const run = (command) => execSync(command, { stdio: "inherit", env });

let failed = false;
try {
  await makeStatic();
  rmSync("out", { recursive: true, force: true });
  run("npx next build");
  run(preview ? "firebase hosting:channel:deploy preview --expires 7d --project pinjamtedi" : "firebase deploy --only hosting --project pinjamtedi");
} catch (error) {
  failed = true;
  console.error("\ndeploy failed:", error.message ?? error);
} finally {
  restore();
}
process.exit(failed ? 1 : 0);
