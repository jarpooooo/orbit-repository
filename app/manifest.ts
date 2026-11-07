// app/manifest.ts → /manifest.webmanifest
//
// PWA: lets browsers install PinjamTEDI on the home screen (Android, desktop Chrome / Edge; iOS uses the
// apple-touch-icon + appleWebApp metadata in app/layout.tsx). Install is the browser's own prompt / menu item.
// Offline: public/sw.js serves public/offline.html when a page cannot be loaded (registered by
// components/layout/service-worker.tsx). Icons: public/icons/, rendered from public/img/logo.svg.
// Colors are PALETTE values from app/design/colors.css (the manifest cannot read CSS tokens).

import type { MetadataRoute } from "next";
import { SITE } from "@/app/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
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
    background_color: "#d7eefb", // --color-sky (page background, shown on the splash screen)
    theme_color: "#d7eefb", // same as viewport.themeColor in app/layout.tsx
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // long-press the app icon (Android) / right-click (desktop) → jump straight to these pages
    shortcuts: [
      { name: "Katalog", short_name: "Katalog", url: "/catalog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Pengajuan saya", short_name: "Pengajuan", url: "/my-requests", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Cek ketersediaan", short_name: "Ketersediaan", url: "/room-schedule", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
