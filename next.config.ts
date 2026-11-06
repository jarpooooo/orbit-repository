import type { NextConfig } from "next";

// Deployed as a STATIC site on Firebase Hosting (free Spark plan, no server): `next build` writes every page
// to out/ and `firebase deploy --only hosting` uploads it. Live data (facilities, requests, sign-in) comes from
// Firebase in the browser, so it works without a server.
// Static export does not support next.config redirects / headers, so they live in firebase.json:
//   - old Indonesian URLs (/katalog, /jadwal-ruang, ...) → English routes (301)
//   - /sw.js never cached (PWA service worker)
// cacheComponents / partialPrefetching are off: they need a Next server (PPR) and cannot be exported.
const nextConfig: NextConfig = {
  output: "export",
  // no image server on a static host: next/image serves the files as they are (all images are SVG anyway)
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
