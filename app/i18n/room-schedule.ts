// app/i18n/room-schedule.ts
//
// Text for "Cek ketersediaan" (app/room-schedule/page.tsx) and "Paling sering dipinjam"
// (app/room-schedule/most-borrowed/page.tsx).

import type { Dictionary } from "./locale";

export type PeriodKey = "week" | "month" | "semester";

const id = {
  schedule: {
    title: "Cek ketersediaan",
    lead: "Lihat jam ruangan dan stok barang yang masih kosong, lalu klik yang hijau untuk lanjut.",
    mostBorrowed: "Paling sering dipinjam",
    prevWeek: "Pekan sebelumnya",
    nextWeek: "Pekan berikutnya",
    chooseDay: "Pilih hari",
    filterLabel: "Filter kategori",
    roomsTitle: (day: string) => `Ruangan · ${day}`,
    roomsLead: "Per jam, 08.00–17.00. Klik blok hijau untuk memilih jam di ruangan itu.",
    itemsTitle: "Barang · pekan ini",
    itemsLead: "Stok per hari. Klik hari yang hijau untuk mulai meminjam.",
    facilityColumn: "Fasilitas",
    empty: "Tidak ada fasilitas di kategori ini.",
    cell: {
      free: "Kosong",
      taken: "Terisi",
      pending: "Menunggu verifikasi",
      past: "Lewat",
      soldOut: "Habis",
      closed: "Tutup",
    },
    openRoom: (facility: string, range: string) => `${facility}, ${range} kosong. Pilih jam`,
    openItem: (facility: string, day: string, state: string) => `${facility}, ${day}, ${state}. Pinjam`,
    legendLabel: "Keterangan:",
    legend: { available: "Kosong / tersedia", few: "Stok sedikit", pending: "Menunggu verifikasi", full: "Terisi / habis" },
  },

  mostBorrowed: {
    title: "Paling sering dipinjam",
    lead: "Peringkat fasilitas yang paling banyak diajukan mahasiswa.",
    viewSchedule: "Cek ketersediaan",
    periodLabel: "Periode",
    periods: { week: "Minggu ini", month: "Bulan ini", semester: "Semester" } as Record<PeriodKey, string>,
    podiumLabel: "Peringkat 1 sampai 3",
    restLabel: "Peringkat 4 sampai 9",
    restTitle: "Peringkat 4 – 9",
    rank: (n: number) => `Peringkat ${n}`,
    borrowed: "dipinjam",
    timesBorrowed: (facility: string, n: number) => `${facility}: ${n} kali dipinjam`,
    viewDetail: "Lihat detail",
    borrow: "Pinjam",
  },
};

const en: typeof id = {
  schedule: {
    title: "Check availability",
    lead: "See which room hours and items are still free, then click a green one to continue.",
    mostBorrowed: "Most borrowed",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    chooseDay: "Choose a day",
    filterLabel: "Category filter",
    roomsTitle: (day) => `Rooms · ${day}`,
    roomsLead: "By the hour, 08:00–17:00. Click a green block to choose hours in that room.",
    itemsTitle: "Items · this week",
    itemsLead: "Stock per day. Click a green day to start borrowing.",
    facilityColumn: "Facility",
    empty: "No facilities in this category.",
    cell: {
      free: "Free",
      taken: "Booked",
      pending: "Awaiting verification",
      past: "Passed",
      soldOut: "Sold out",
      closed: "Closed",
    },
    openRoom: (facility, range) => `${facility}, ${range} free. Choose hours`,
    openItem: (facility, day, state) => `${facility}, ${day}, ${state}. Borrow`,
    legendLabel: "Legend:",
    legend: { available: "Free / in stock", few: "Low stock", pending: "Awaiting verification", full: "Booked / sold out" },
  },

  mostBorrowed: {
    title: "Most borrowed",
    lead: "Facilities that students request the most.",
    viewSchedule: "Check availability",
    periodLabel: "Period",
    periods: { week: "This week", month: "This month", semester: "Semester" },
    podiumLabel: "Ranks 1 to 3",
    restLabel: "Ranks 4 to 9",
    restTitle: "Ranks 4 – 9",
    rank: (n) => `Rank ${n}`,
    borrowed: "loans",
    timesBorrowed: (facility, n) => `${facility}: borrowed ${n} times`,
    viewDetail: "View details",
    borrow: "Borrow",
  },
};

export const ROOM_SCHEDULE_TEXT: Dictionary<typeof id> = { id, en };
