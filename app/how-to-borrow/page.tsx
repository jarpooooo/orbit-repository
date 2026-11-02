// app/how-to-borrow/page.tsx
//
// "Cara Pinjam" page (Figma node 5:847). Server component for the metadata (Indonesian);
// the content is <HowToBorrowContent /> (client, follows the language preference).

import type { Metadata } from "next";
import HowToBorrowContent from "@/app/components/how-to-borrow/how-to-borrow-content";

export const metadata: Metadata = {
  title: "Cara Pinjam",
  description: "Tiga tingkat izin dan lima langkah meminjam alat atau ruang DTEDI lewat PinjamTEDI.",
  alternates: { canonical: "/how-to-borrow" },
};

export default function HowToBorrowPage() {
  return <HowToBorrowContent />;
}
