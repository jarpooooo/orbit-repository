// app/data/facilities.ts
//
// SHARED facility data: used by the Catalog, Detail, Schedule, Request, and Summary pages.
// Content = simulated data from Figma. [placeholder] = no Figma frame exists, filled in by hand; replace freely.
// Later, swap FACILITIES for an API response; the shape stays the same.
// Keys are English; every user-facing label is Indonesian and lives in the *_LABELS / STATUS_STYLES maps.

import type { FacilityKey } from "@/app/design/icon-map";

/* --------------------------------- groups --------------------------------- */

export const FACILITY_GROUPS = ["hardware", "room", "logistics"] as const;
export type FacilityGroup = (typeof FACILITY_GROUPS)[number];

export const GROUP_LABELS: Record<FacilityGroup, string> = {
  hardware: "Hardware",
  room: "Ruang",
  logistics: "Logistik",
};

/**
 * Subcategories (same keys as the home page category cards).
 * The keys are also the ?kategori= values in catalog URLs, so they stay Indonesian.
 */
export const SUBCATEGORIES = {
  mikrokontroler: { label: "Mikro-kontroler", group: "hardware" },
  "perangkat-jaringan": { label: "Perangkat jaringan", group: "hardware" },
  "alat-ukur": { label: "Alat ukur", group: "hardware" },
  "ruang-diskusi": { label: "Ruang diskusi", group: "room" },
  "kursi-pc-lab": { label: "Kursi PC lab", group: "room" },
  "kamera-acara": { label: "Kamera dan acara", group: "logistics" },
} as const satisfies Record<string, { label: string; group: FacilityGroup }>;
export type SubcategoryKey = keyof typeof SUBCATEGORIES;

export const isSubcategory = (key: string): key is SubcategoryKey => key in SUBCATEGORIES;

/* ------------------------------ permission & status ------------------------------ */

/** Permission level (business rule). */
export type PermissionLevel = "direct" | "verification" | "letter";
/** Status shown on cards: the permission level, or "borrowed" while the facility is unavailable. */
export type AvailabilityStatus = PermissionLevel | "borrowed";

/** Theme-aware classes (colors.css level-* / status-* tokens), so badges follow light/dark mode. */
export type StatusStyle = { label: string; box: string; text: string; dot: string };

export const STATUS_STYLES: Record<AvailabilityStatus, StatusStyle> = {
  verification: { label: "Verifikasi", box: "bg-level-verification-bg", text: "text-level-verification-fg", dot: "bg-level-verification-fg" },
  letter: { label: "Perlu surat", box: "bg-level-letter-bg", text: "text-level-letter-fg", dot: "bg-level-letter-fg" },
  borrowed: { label: "Sedang dipinjam", box: "bg-status-unavailable-bg", text: "text-status-unavailable-fg", dot: "bg-status-unavailable-fg" },
  direct: { label: "Langsung", box: "bg-level-direct-bg", text: "text-level-direct-fg", dot: "bg-level-direct-fg" },
};

/** "Catatan izin" box on the Detail page (text exactly as in Figma). */
export const PERMISSION_NOTES: Record<PermissionLevel, { title: string; text: string }> = {
  verification: { title: "Verifikasi.", text: "Perlu dicek petugas laboratorium, biasanya kurang dari 1 jam kerja." },
  letter: { title: "Perlu surat.", text: "Wajib melampirkan surat izin bertanda tangan dosen pembimbing." },
  direct: { title: "Langsung.", text: "Langsung disetujui sistem. Tinggal ambil di loket." },
};

/* ---------------------------------- units ---------------------------------- */

/** "unit" for equipment, "person" for rooms (capacity). */
export type FacilityUnit = "unit" | "person";

export const UNIT_LABELS: Record<FacilityUnit, string> = { unit: "unit", person: "orang" };

/** "3 unit" / "10 orang" */
export const formatQuantity = (f: Facility, n: number) => `${n} ${UNIT_LABELS[f.unit]}`;

/* -------------------------------- facilities -------------------------------- */

export type Facility = {
  slug: string;
  illustration: FacilityKey;
  name: string;
  group: FacilityGroup;
  subcategory: SubcategoryKey;
  /** short description on the catalog card */
  description: string;
  /** long description on the Detail page (when it differs from `description`) */
  longDescription?: string;
  permission: PermissionLevel;
  status: AvailabilityStatus;
  /** small text on the card, e.g. "6 unit" */
  meta?: string;
  /** text next to the badge on the Detail page, e.g. "6 unit tersedia" */
  availability: string;
  unit: FacilityUnit;
  /** maximum quantity that can be requested (stock or capacity) */
  maxQuantity: number;
  /** pickup / usage location, shown on the "Pengajuanmu" card and the Summary */
  location: string;
  /** spec table rows */
  specs: readonly (readonly [label: string, value: string])[];
};

export const FACILITIES: readonly Facility[] = [
  {
    slug: "kit-esp32", illustration: "kit-esp32", name: "Kit ESP32", group: "hardware", subcategory: "mikrokontroler",
    description: "Paket pengembangan IoT lengkap dengan breadboard, kabel jumper, dan sensor dasar.",
    permission: "verification", status: "verification", meta: "6 unit", availability: "6 unit tersedia", unit: "unit", maxQuantity: 6,
    location: "Lab Mikrokontroler, Lt. 2",
    specs: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Isi paket", "ESP32 DevKit, breadboard, 20 jumper, 3 sensor"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "multimeter-digital", illustration: "multimeter-digital", name: "Multimeter Digital", group: "hardware", subcategory: "alat-ukur",
    description: "Alat ukur tegangan, arus, dan hambatan untuk praktikum dan proyek akhir.",
    permission: "letter", status: "letter", meta: "2 unit", availability: "2 unit tersedia", unit: "unit", maxQuantity: 2,
    location: "Lab Mikrokontroler, Lt. 2",
    specs: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Fungsi", "Tegangan, arus, hambatan"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "arduino-uno-r3", illustration: "arduino-uno-r3", name: "Arduino Uno R3", group: "hardware", subcategory: "mikrokontroler",
    description: "Kembali Sen 26 Okt",
    longDescription: "Papan mikrokontroler Arduino Uno R3 untuk praktikum dasar dan prototipe.",
    permission: "direct", status: "borrowed", availability: "Kembali Sen 26 Okt", unit: "unit", maxQuantity: 1,
    location: "Lab Mikrokontroler, Lt. 2",
    specs: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Isi paket", "Board Arduino Uno R3, kabel USB"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "ruang-diskusi-a", illustration: "ruang-diskusi-a", name: "Ruang Diskusi A", group: "room", subcategory: "ruang-diskusi",
    description: "Ruang kecil ber-AC dengan papan tulis untuk kerja kelompok dan bimbingan.",
    permission: "verification", status: "verification", meta: "10 orang", availability: "Kapasitas 10 orang", unit: "person", maxQuantity: 10,
    location: "Gedung TEDI, Lt. 2",
    specs: [["Lokasi", "Gedung TEDI, Lt. 2"], ["Kapasitas", "10 orang"], ["Fasilitas", "AC, papan tulis"], ["Durasi maks.", "2 jam per sesi"]],
  },
  {
    slug: "ruang-sidang", illustration: "ruang-sidang", name: "Ruang Sidang", group: "room", subcategory: "ruang-diskusi",
    description: "Ruang formal untuk sidang, seminar proposal, dan rapat himpunan.",
    permission: "letter", status: "letter", meta: "20 orang", availability: "Kapasitas 20 orang", unit: "person", maxQuantity: 20,
    location: "Gedung TEDI, Lt. 3",
    specs: [["Lokasi", "Gedung TEDI, Lt. 3"], ["Kapasitas", "20 orang"], ["Fasilitas", "AC, proyektor, mikrofon"], ["Durasi maks.", "4 jam per sesi"]],
  },
  {
    // [placeholder] detail
    slug: "pc-lab-rpl", illustration: "pc-lab-rpl", name: "PC Lab RPL", group: "room", subcategory: "kursi-pc-lab",
    description: "Dipakai kelas sampai Kam 29 Okt",
    longDescription: "PC spek tinggi di luar jam praktikum.",
    permission: "direct", status: "borrowed", meta: "30 orang", availability: "Dipakai kelas sampai Kam 29 Okt", unit: "person", maxQuantity: 30,
    location: "Lab RPL, Lt. 2",
    specs: [["Lokasi", "Lab RPL, Lt. 2"], ["Kapasitas", "30 orang"], ["Fasilitas", "PC spek tinggi"], ["Durasi maks.", "2 jam per sesi"]],
  },
  {
    slug: "converter-hdmi", illustration: "converter-hdmi", name: "Converter HDMI", group: "logistics", subcategory: "kamera-acara",
    description: "Adaptor HDMI ke VGA dan USB-C untuk presentasi di ruang mana pun.",
    permission: "direct", status: "direct", meta: "12 unit", availability: "12 unit tersedia", unit: "unit", maxQuantity: 12,
    location: "Loket Logistik, Lt. 1",
    specs: [["Lokasi", "Loket Logistik, Lt. 1"], ["Tipe", "HDMI ke VGA, USB-C ke HDMI"], ["Durasi maks.", "1 hari"], ["Jaminan", "Tanpa jaminan"]],
  },
  {
    // [placeholder] detail
    slug: "kamera-mirrorless", illustration: "kamera-mirrorless", name: "Kamera Mirrorless", group: "logistics", subcategory: "kamera-acara",
    description: "Kamera untuk dokumentasi kegiatan himpunan dan proyek video.",
    permission: "letter", status: "letter", meta: "1 unit", availability: "1 unit tersedia", unit: "unit", maxQuantity: 1,
    location: "Loket Logistik, Lt. 1",
    specs: [["Lokasi", "Loket Logistik, Lt. 1"], ["Isi paket", "Body, lensa kit, baterai cadangan"], ["Durasi maks.", "2 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "proyektor-portabel", illustration: "proyektor-portabel", name: "Proyektor Portabel", group: "logistics", subcategory: "kamera-acara",
    description: "Kembali Rab 28 Okt",
    longDescription: "Proyektor portabel untuk presentasi dan acara himpunan.",
    permission: "verification", status: "borrowed", availability: "Kembali Rab 28 Okt", unit: "unit", maxQuantity: 1,
    location: "Loket Logistik, Lt. 1",
    specs: [["Lokasi", "Loket Logistik, Lt. 1"], ["Isi paket", "Proyektor, kabel HDMI, kabel power"], ["Durasi maks.", "1 hari"], ["Jaminan", "KTM ditahan"]],
  },
];

export const getFacility = (slug: string) => FACILITIES.find((f) => f.slug === slug);

/** Looks up several slugs at once, skipping unknown ones (for simulated lists keyed by slug). */
export function withFacilities<T extends { slug: string }>(rows: readonly T[]) {
  return rows.flatMap((row) => {
    const facility = getFacility(row.slug);
    return facility ? [{ ...row, facility }] : [];
  });
}
