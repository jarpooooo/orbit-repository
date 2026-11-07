// app/room-schedule/layout.tsx
// "Cek ketersediaan" metadata (page.tsx is a client component, so the metadata lives in this layout).

import type { Metadata } from "next";
import { SITE } from "@/app/data/site";

export const metadata: Metadata = {
  // the template is repeated here: a plain string title in a layout would cut child pages off from the root template
  title: { absolute: `Cek ketersediaan | ${SITE.name}`, template: `%s | ${SITE.name}` },
  description: "Cek jam ruangan dan stok alat DTEDI yang masih kosong untuk tiap hari kerja, lalu langsung ajukan peminjaman.",
  alternates: { canonical: "/room-schedule" },
};

export default function RoomScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
