import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/app/design/fonts";
import { BASE_OPEN_GRAPH, SITE, SITE_URL } from "@/app/data/site";
import Navbar from "./components/layout/navbar";
import SmoothScroll from "./components/layout/smooth-scroll";
import Footer from "./components/layout/footer";
import ServiceWorker from "./components/layout/service-worker";
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
  manifest: "/manifest.webmanifest", // written by scripts/static-files.mjs
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
  icons: {
    icon: [{ url: "/img/logo.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // PWA on iPhone / iPad (Safari ignores most of the manifest): full-screen app, name under the icon
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image", // image: app/opengraph-image.tsx
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
        <ServiceWorker />
        <SmoothScroll>
          <Navbar />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
