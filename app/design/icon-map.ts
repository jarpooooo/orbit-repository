// src/lib/design/icon-map.ts
//
// Peta ikon untuk PinjamTEDI (sumber: Figma "Orbit repository").
// 1) UI_ICONS            → lucide-react (ikon antarmuka kecil)
// 2) BRAND_ICONS         → SVG sendiri (lucide v1 tidak punya ikon brand)
// 3) *_ILLUSTRATIONS     → SVG ilustrasi hasil export Figma
//
// Tandai: [Figma] = terlihat di desain, [+] = tambahan yang hampir pasti dibutuhkan.

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
  search: Search, // [Figma] kolom "Cari"
  notification: Bell, // [Figma] tombol notifikasi (biru)
  notificationUnread: BellRing, // [+] saat ada notifikasi baru
  menu: Menu, // [+] menu mobile
  close: X, // [+] tutup menu / panel notifikasi

  // Navigasi & aksi
  breadcrumbSeparator: ChevronRight, // [Figma] "Beranda › Katalog"
  dropdown: ChevronDown, // [Figma] "Semua kategori" di pencarian hero (ikon/panah bawah)
  goTo: ArrowUpRight, // [Figma] tombol ↗ di kartu kategori Beranda
  backToTop: ArrowUp, // [Figma] "Kembali ke atas"
  next: ArrowRight, // [+] / panah di tombol pencarian hero
  back: ArrowLeft, // [+] tombol "Kembali"

  // Form & status
  check: Check, // [Figma] stepper selesai, checkbox, timeline "Langkah berikutnya"
  increase: Plus, // [Figma] stepper "Jumlah unit"
  decrease: Minus, // [Figma] stepper "Jumlah unit"
  calendar: CalendarDays, // [+] pemilih hari / "Lihat jadwal"
  file: FileText, // [+] "Surat izin dosen" (file PDF)

  // Kontak footer
  location: MapPin, // [Figma] alamat
  hours: Clock, // [Figma] jam layanan
  phone: Phone, // [Figma] help desk
} as const satisfies Record<string, LucideIcon>;

export type UiIconName = keyof typeof UI_ICONS;

/** Props bawaan supaya garisnya serasi dengan outline tebal di desain. */
export const UI_ICON_DEFAULTS = {
  size: 18,
  strokeWidth: 2.25,
} as const;

/* -------------------------------------------------------------------------- */
/* 2) Brand icons (SVG sendiri, taruh di public/icons/brand/)                 */
/* -------------------------------------------------------------------------- */

export const BRAND_ICONS = {
  instagram: { src: "/icons/brand/instagram.svg", label: "Instagram" },
  youtube: { src: "/icons/brand/youtube.svg", label: "YouTube" },
  tiktok: { src: "/icons/brand/tiktok.svg", label: "TikTok" },
  x: { src: "/icons/brand/x.svg", label: "X" },
  linkedin: { src: "/icons/brand/linkedin.svg", label: "LinkedIn" },
} as const;

export type BrandIconName = keyof typeof BRAND_ICONS;

/** Urutan tampil di footer (sesuai Figma). */
export const FOOTER_SOCIALS: readonly BrandIconName[] = [
  "instagram",
  "youtube",
  "tiktok",
  "x",
  "linkedin",
];

/* -------------------------------------------------------------------------- */
/* 3) Ilustrasi (export dari Figma → public/illustrations/)                   */
/* -------------------------------------------------------------------------- */

const ILL = (name: string) => `/img/illustrations/${name}.svg`;

/** Kartu katalog, halaman detail, jadwal, ringkasan, "Pengajuan saya". */
export const FACILITY_ILLUSTRATIONS = {
  "kit-esp32": ILL("mikrokontroler"),
  "arduino-uno-r3": ILL("mikrokontroler"),
  "multimeter-digital": ILL("alat-ukur"),
  "ruang-diskusi-a": ILL("ruang-diskusi"),
  "ruang-sidang": ILL("ruang-diskusi"),
  "pc-lab-rpl": ILL("pc-lab"),
  "converter-hdmi": ILL("kabel-roll"), // belum ada ilustrasi HDMI khusus
  "kamera-mirrorless": ILL("kamera"),
  "proyektor-portabel": ILL("proyektor"),
} as const;

export type FacilityKey = keyof typeof FACILITY_ILLUSTRATIONS;

/** Kartu "Mau pinjam apa hari ini?" di Beranda. */
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
 * Rak ilustrasi di atas footer Beranda (urut kiri ke kanan, ukuran px persis Figma).
 * `mobile: true` = tetap tampil di layar kecil.
 * Node Figma: Stop kontak 1:2931 · TV display 1:2944 · Proyektor 1:2951 · Mikrokontroler 1:2671 ·
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

/** Ambil ilustrasi fasilitas dari nama yang tampil di UI ("Kit ESP32" → kit-esp32). */
export const toFacilityKey = (name: string): FacilityKey | undefined => {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug in FACILITY_ILLUSTRATIONS ? (slug as FacilityKey) : undefined;
};