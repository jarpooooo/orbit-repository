// app/i18n/catalog.ts
//
// Text for the catalog list (components/catalog/facility-catalog.tsx) and the facility detail page
// (components/catalog/facility-detail.tsx). Facility content itself lives in app/i18n/facilities.ts.

import type { Dictionary } from "./locale";

/** "6–12" or "30" when every room has the same capacity */
const range = (min: number, max: number) => (min === max ? `${min}` : `${min}–${max}`);

const id = {
  list: {
    title: "Katalog",
    lead: (n: number) => `${n} alat dan ruang yang bisa kamu pinjam.`,
    searchPlaceholder: "Cari ESP32, ruang diskusi, proyektor…",
    searchLabel: "Cari fasilitas",
    filterLabel: "Kategori",
    filters: {
      label: "Filter",
      location: "Lokasi",
      capacity: "Kapasitas",
      date: "Tanggal",
      anyLocation: "Semua lokasi",
      anyCapacity: "Semua kapasitas",
      minPeople: (n: number) => `Minimal ${n} orang`,
      capacityNote: "Hanya menampilkan ruangan.",
      dateNote: "Tampilkan yang tersedia pada tanggal ini.",
      clearDate: "Hapus tanggal",
    },
    seeAll: (n: number) => `Lihat semua ${n}`,
    groupMeta: (rooms: number, min: number, max: number) => `${rooms} ruang · ${range(min, max)} orang`,
    group: "Jenis ruangan:",
    subcategory: "Kategori:",
    clearSubcategory: "Hapus",
    emptyTitle: "Belum ada yang cocok",
    emptyText: "Coba kata kunci lain, hapus filter, atau pilih kategori Semua.",
  },
  detail: {
    chooseSchedule: "Pilih jadwal",
    back: "Kembali",
  },
};

const en: typeof id = {
  list: {
    title: "Catalog",
    lead: (n) => `${n} tools and rooms you can borrow.`,
    searchPlaceholder: "Search ESP32, discussion rooms, projectors…",
    searchLabel: "Search facilities",
    filterLabel: "Category",
    filters: {
      label: "Filters",
      location: "Location",
      capacity: "Capacity",
      date: "Date",
      anyLocation: "All locations",
      anyCapacity: "Any capacity",
      minPeople: (n) => `At least ${n} people`,
      capacityNote: "Shows rooms only.",
      dateNote: "Show what is available on this date.",
      clearDate: "Clear date",
    },
    seeAll: (n) => `See all ${n}`,
    groupMeta: (rooms, min, max) => `${rooms} ${rooms === 1 ? "room" : "rooms"} · ${range(min, max)} people`,
    group: "Room type:",
    subcategory: "Category:",
    clearSubcategory: "Clear",
    emptyTitle: "No matches yet",
    emptyText: "Try another keyword, clear a filter, or pick the All category.",
  },
  detail: {
    chooseSchedule: "Choose a time",
    back: "Back",
  },
};

export const CATALOG_TEXT: Dictionary<typeof id> = { id, en };
