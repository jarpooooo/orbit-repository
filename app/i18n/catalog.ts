// app/i18n/catalog.ts
//
// Text for the catalog list (components/catalog/facility-catalog.tsx) and the facility detail page
// (components/catalog/facility-detail.tsx). Facility content itself lives in app/i18n/facilities.ts.

import type { Dictionary } from "./locale";

const id = {
  list: {
    title: "Katalog fasilitas",
    lead: "Pilih ruang atau alat yang kamu butuhkan.",
    searchPlaceholder: "Cari nama atau lokasi",
    searchLabel: "Cari fasilitas",
    filterLabel: "Filter kategori",
    subcategory: "Kategori:",
    clearSubcategory: "Hapus",
    emptyTitle: "Belum ada yang cocok",
    emptyText: "Coba kata kunci lain atau pilih kategori Semua.",
  },
  detail: {
    chooseSchedule: "Pilih jadwal",
    back: "Kembali",
  },
};

const en: typeof id = {
  list: {
    title: "Facility catalog",
    lead: "Choose the room or tool you need.",
    searchPlaceholder: "Search by name or location",
    searchLabel: "Search facilities",
    filterLabel: "Category filter",
    subcategory: "Category:",
    clearSubcategory: "Clear",
    emptyTitle: "No matches yet",
    emptyText: "Try another keyword or pick the All category.",
  },
  detail: {
    chooseSchedule: "Choose a time",
    back: "Back",
  },
};

export const CATALOG_TEXT: Dictionary<typeof id> = { id, en };
