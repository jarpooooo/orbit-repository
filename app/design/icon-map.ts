// app/design/icon-map.ts
//
// Icon map for PinjamTEDI (source: Figma "Orbit repository").
// 1) UI_ICONS            → lucide-react (small UI icons)
// 2) BRAND_ICONS         → custom SVGs (lucide v1 has no brand icons)
// 3) ILLUSTRATIONS      → illustration SVGs exported from Figma (facility pictures: components/ui/facility-illustration.tsx)
//
// Markers: [Figma] = seen in the design, [+] = extra icon that will almost certainly be needed.

import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bell,
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* 1) UI icons (lucide-react)                                                 */
/* -------------------------------------------------------------------------- */

export const UI_ICONS = {
  // Navbar
  search: Search, // [Figma] "Cari" search field
  notification: Bell, // [Figma] notification button (blue)
  notificationUnread: BellRing, // [+] when there are new notifications
  menu: Menu, // [+] mobile menu
  close: X, // [+] close menu / notification panel

  // Navigation & actions
  breadcrumbSeparator: ChevronRight, // [Figma] "Beranda › Katalog"
  dropdown: ChevronDown, // [Figma] "Semua kategori" in the hero search (down arrow icon)
  goTo: ArrowUpRight, // [Figma] ↗ button on the home category cards
  backToTop: ArrowUp, // [Figma] "Kembali ke atas"
  next: ArrowRight, // [+] / arrow on the hero search button
  back: ArrowLeft, // [+] "Kembali" button

  // Form & status
  check: Check, // [Figma] completed stepper, checkbox, "Langkah berikutnya" timeline
  increase: Plus, // [Figma] stepper "Jumlah unit"
  decrease: Minus, // [Figma] stepper "Jumlah unit"
  calendar: CalendarDays, // [+] day picker / "Lihat jadwal"
  file: FileText, // [+] "Surat izin dosen" (PDF file)

  // Footer contact
  location: MapPin, // [Figma] address
  hours: Clock, // [Figma] service hours
  phone: Phone, // [Figma] help desk
} as const satisfies Record<string, LucideIcon>;

export type UiIconName = keyof typeof UI_ICONS;

/** Default props so strokes match the thick outlines in the design. */
export const UI_ICON_DEFAULTS = {
  size: 24,
  strokeWidth: 2,
} as const;

/* -------------------------------------------------------------------------- */
/* 2) Brand icons (custom SVGs in public/icons/brand/)                      */
/* -------------------------------------------------------------------------- */

export const BRAND_ICONS = {
  instagram: { src: "img/company-logo/instagram.svg", label: "Instagram" },
  youtube: { src: "img/company-logo/youtube.svg", label: "YouTube" },
  tiktok: { src: "img/company-logo/tiktok.svg", label: "TikTok" },
  x: { src: "img/company-logo/x.svg", label: "X" },
  linkedin: { src: "img/company-logo/linkedin.svg", label: "LinkedIn" },
} as const;

export type BrandIconName = keyof typeof BRAND_ICONS;

/** Display order in the footer (as in Figma). */
export const FOOTER_SOCIALS: readonly BrandIconName[] = [
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "linkedin",
];

/* -------------------------------------------------------------------------- */
/* 3) Illustrations (exported from Figma → public/img/illustrations/)         */
/* -------------------------------------------------------------------------- */

/** All 14 illustration SVGs, by file name: the ONE illustration → path map. */
export const ILLUSTRATION_IDS = [
  "alat-ukur",
  "kabel-roll",
  "kamera",
  "kursi",
  "laptop",
  "mic-wireless",
  "mikrokontroler",
  "pc-lab",
  "perangkat-jaringan", // no facility yet; kept for upcoming network devices
  "proyektor",
  "ruang-diskusi",
  "stop-kontak",
  "surat-bertanda-tangan", // not a facility: marks the "letter" level and the letter flow
  "tv-display",
] as const;

/**
 * Catalog card set (Figma "1.4 Katalog", node 148:1201) in public/img/illustrations/catalog/.
 * Redrawn for the catalog; the original set above stays for the home cards, footer shelf, and letter mark.
 * Value = the SVG's frame size in Figma (px).
 */
export const CATALOG_ILLUSTRATION_FRAMES = {
  "catalog/chip": 100,
  "catalog/laptop": 96,
  "catalog/raspberry-pi": 96,
  "catalog/komputer": 100,
  "catalog/ruang-diskusi": 100,
  "catalog/ruang-kelas": 96,
  "catalog/auditorium": 96,
  "catalog/kamera": 100,
  "catalog/proyektor": 100,
  "catalog/mikrofon": 96,
  "catalog/speaker": 96,
  "catalog/stop-kontak": 96,
  "catalog/kabel-roll": 96,
  "catalog/kursi": 96,
  "catalog/whiteboard": 96,
} as const;

export type IllustrationId = (typeof ILLUSTRATION_IDS)[number] | keyof typeof CATALOG_ILLUSTRATION_FRAMES;

/** id → path (the id is the path below /img/illustrations/). */
export const ILLUSTRATIONS = Object.fromEntries(
  [...ILLUSTRATION_IDS, ...Object.keys(CATALOG_ILLUSTRATION_FRAMES)].map((id) => [id, `/img/illustrations/${id}.svg`]),
) as Record<IllustrationId, string>;

/** Figma frame size of an illustration: 96 or 100 for the catalog set, 100 for the original set. */
export const illustrationFrame = (id: IllustrationId): number =>
  (CATALOG_ILLUSTRATION_FRAMES as Record<string, number>)[id] ?? 100;

/**
 * Illustration shelf above the home page footer (left to right, px sizes exactly as in Figma).
 * `mobile: true` = still shown on small screens.
 * Figma nodes: Stop kontak 1:2931 · TV display 1:2944 · Proyektor 1:2951 · Mikrokontroler 1:2671 ·
 * Kursi 1:2960 · Mic wireless 1:2964 · Kamera 1:2719 · Kabel roll 1:2970 · Laptop 1:2697 · Surat 1:2976.
 */
export const FOOTER_STRIP_ILLUSTRATIONS = [
  { key: "stop-kontak", label: "Stop kontak", size: 76, mobile: true, src: ILLUSTRATIONS["stop-kontak"] },
  { key: "tv-display", label: "TV display", size: 92, mobile: true, src: ILLUSTRATIONS["tv-display"] },
  { key: "proyektor", label: "Proyektor", size: 84, mobile: true, src: ILLUSTRATIONS["proyektor"] },
  { key: "mikrokontroler", label: "Mikrokontroler", size: 80, mobile: false, src: ILLUSTRATIONS["mikrokontroler"] },
  { key: "kursi", label: "Kursi", size: 96, mobile: true, src: ILLUSTRATIONS["kursi"] },
  { key: "mic-wireless", label: "Mic wireless", size: 88, mobile: true, src: ILLUSTRATIONS["mic-wireless"] },
  { key: "kamera", label: "Kamera", size: 84, mobile: false, src: ILLUSTRATIONS["kamera"] },
  { key: "kabel-roll", label: "Kabel roll", size: 86, mobile: false, src: ILLUSTRATIONS["kabel-roll"] },
  { key: "laptop", label: "Laptop", size: 92, mobile: true, src: ILLUSTRATIONS["laptop"] },
  { key: "surat", label: "Surat bertanda tangan", size: 80, mobile: false, src: ILLUSTRATIONS["surat-bertanda-tangan"] },
] as const;
