import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/app/design/fonts";
import { OG_DASAR, SITE_URL, SITUS } from "@/app/data/situs";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITUS.nama} | Peminjaman alat dan ruang DTEDI SV UGM`,
    template: `%s | ${SITUS.nama}`,
  },
  description: SITUS.deskripsi,
  applicationName: SITUS.nama,
  keywords: [
    "PinjamTEDI",
    "DTEDI",
    "Sekolah Vokasi UGM",
    "peminjaman alat",
    "peminjaman ruang",
    "pinjam Arduino",
    "ruang diskusi",
    "Teknik Elektro dan Informatika",
  ],
  icons: "/img/logo.svg",
  openGraph: {
    ...OG_DASAR,
    title: SITUS.nama,
    description: SITUS.deskripsi,
  },
  twitter: {
    card: "summary",
    title: SITUS.nama,
    description: SITUS.deskripsi,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#d7eefb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
