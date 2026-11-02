// app/room-schedule/most-borrowed/layout.tsx
// "Paling sering dipinjam" metadata (page.tsx is a client component).

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Paling sering dipinjam",
  description: "Peringkat alat dan ruang DTEDI yang paling sering dipinjam minggu ini, bulan ini, dan semester ini.",
  alternates: { canonical: "/room-schedule/most-borrowed" },
};

export default function MostBorrowedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
