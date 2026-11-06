// app/not-found.tsx: 404 for unknown URLs and notFound() calls, inside the root layout (navbar + footer).
// Next adds <meta name="robots" content="noindex"> itself. Text: LAYOUT_TEXT.notFound (follows the language).

import type { Metadata } from "next";
import NotFoundContent from "@/app/components/layout/not-found-content";

export const metadata: Metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return <NotFoundContent />;
}
