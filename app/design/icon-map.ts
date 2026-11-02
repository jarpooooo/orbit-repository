// app/design/icon-map.ts
//
// Icon map for PinjamTEDI (source: Figma "Orbit repository").
// 1) UI_ICONS            → lucide-react (small UI icons)
// 2) BRAND_ICONS         → custom SVGs (lucide v1 has no brand icons)
// 3) *_ILLUSTRATIONS     → illustration SVGs exported from Figma
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
  size: 18,
  strokeWidth: 2.25,
} as const;

/* -------------------------------------------------------------------------- */
/* 2) Brand icons (custom SVGs in public/icons/brand/)                      */
/* -------------------------------------------------------------------------- */

export const BRAND_ICONS = {
  instagram: { src: "/icons/brand/instagram.svg", label: "Instagram" },
  youtube: { src: "/icons/brand/youtube.svg", label: "YouTube" },
  tiktok: { src: "/icons/brand/tiktok.svg", label: "TikTok" },
  x: { src: "/icons/brand/x.svg", label: "X" },
  linkedin: { src: "/icons/brand/linkedin.svg", label: "LinkedIn" },
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

const ILL = (name: string) => `/img/illustrations/${name}.svg`;

/** Catalog cards, detail, schedule, summary, and "Pengajuan saya" pages. Keys = facility slugs. */
export const FACILITY_ILLUSTRATIONS = {
  "kit-esp32": ILL("mikrokontroler"),
  "arduino-uno-r3": ILL("mikrokontroler"),
  "multimeter-digital": ILL("alat-ukur"),
  "ruang-diskusi-a": ILL("ruang-diskusi"),
  "ruang-sidang": ILL("ruang-diskusi"),
  "pc-lab-rpl": ILL("pc-lab"),
  "converter-hdmi": ILL("kabel-roll"), // no dedicated HDMI illustration yet
  "kamera-mirrorless": ILL("kamera"),
  "proyektor-portabel": ILL("proyektor"),
} as const;

export type FacilityKey = keyof typeof FACILITY_ILLUSTRATIONS;

/** "Mau pinjam apa hari ini?" cards on the home page. */
export const CATEGORY_ILLUSTRATIONS = {
  mikrokontroler: ILL("mikrokontroler"),
  "perangkat-jaringan": ILL("perangkat-jaringan"),
  "alat-ukur": ILL("alat-ukur"),
  "ruang-diskusi": ILL("ruang-diskusi"),
  "kursi": ILL("kursi"),
  "kamera": ILL("kamera"),
} as const;

export type CategoryIllustrationKey = keyof typeof CATEGORY_ILLUSTRATIONS;

/**
 * Illustration shelf above the home page footer (left to right, px sizes exactly as in Figma).
 * `mobile: true` = still shown on small screens.
 * Figma nodes: Stop kontak 1:2931 · TV display 1:2944 · Proyektor 1:2951 · Mikrokontroler 1:2671 ·
 * Kursi 1:2960 · Mic wireless 1:2964 · Kamera 1:2719 · Kabel roll 1:2970 · Laptop 1:2697 · Surat 1:2976.
 */
export const FOOTER_STRIP_ILLUSTRATIONS = [
  { key: "stop-kontak", label: "Stop kontak", size: 76, mobile: true, src: ILL("stop-kontak") },
  { key: "tv-display", label: "TV display", size: 92, mobile: true, src: ILL("tv-display") },
  { key: "proyektor", label: "Proyektor", size: 84, mobile: true, src: ILL("proyektor") },
  { key: "mikrokontroler", label: "Mikrokontroler", size: 80, mobile: false, src: ILL("mikrokontroler") },
  { key: "kursi", label: "Kursi", size: 96, mobile: true, src: ILL("kursi") },
  { key: "mic-wireless", label: "Mic wireless", size: 88, mobile: true, src: ILL("mic-wireless") },
  { key: "kamera", label: "Kamera", size: 84, mobile: false, src: ILL("kamera") },
  { key: "kabel-roll", label: "Kabel roll", size: 86, mobile: false, src: ILL("kabel-roll") },
  { key: "laptop", label: "Laptop", size: 92, mobile: true, src: ILL("laptop") },
  { key: "surat", label: "Surat bertanda tangan", size: 80, mobile: false, src: ILL("surat-bertanda-tangan") },
] as const;

/** Resolve a facility illustration from its display name ("Kit ESP32" → kit-esp32). */
export const toFacilityKey = (name: string): FacilityKey | undefined => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug in FACILITY_ILLUSTRATIONS ? (slug as FacilityKey) : undefined;
};