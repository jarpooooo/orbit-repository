import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  // Old Indonesian URLs → English routes, so previously shared or indexed links keep working.
  async redirects() {
    return [
      { source: "/katalog/:slug/jadwal", destination: "/catalog/:slug/schedule", permanent: true },
      { source: "/katalog/:slug/ajukan", destination: "/catalog/:slug/request", permanent: true },
      { source: "/katalog/:slug/surat", destination: "/catalog/:slug/letter", permanent: true },
      { source: "/katalog/:slug/ringkasan", destination: "/catalog/:slug/summary", permanent: true },
      { source: "/katalog/:path*", destination: "/catalog/:path*", permanent: true },
      { source: "/jadwal-ruang/paling-sering-dipinjam", destination: "/room-schedule/most-borrowed", permanent: true },
      { source: "/jadwal-ruang", destination: "/room-schedule", permanent: true },
      { source: "/pengajuan-saya", destination: "/my-requests", permanent: true },
      { source: "/cara-pinjam", destination: "/how-to-borrow", permanent: true },
    ];
  },
  partialPrefetching: true,
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
