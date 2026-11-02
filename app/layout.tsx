import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/app/design/fonts";
import { BASE_OPEN_GRAPH, SITE, SITE_URL } from "@/app/data/site";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { ThemeScript } from "./components/layout/theme";
import { LanguageReady, LanguageScript } from "./components/layout/language";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} | Peminjaman alat dan ruang DTEDI SV UGM`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
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
    ...BASE_OPEN_GRAPH,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary",
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

// Default theme is light; dark mode is opt-in through the settings menu (data-theme on <html>).
export const viewport: Viewport = {
  themeColor: "#d7eefb",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: <ThemeScript /> and <LanguageScript /> set data-theme / lang before React hydrates
    <html lang="id" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        <ThemeScript />
        <LanguageScript />
      </head>
      <body className="flex min-h-full flex-col">
        <LanguageReady />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
