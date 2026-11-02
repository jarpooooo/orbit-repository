// app/i18n/room-schedule.ts
//
// Text for "Lihat jadwal" (app/room-schedule/page.tsx) and "Paling sering dipinjam"
// (app/room-schedule/most-borrowed/page.tsx).

import type { Dictionary } from "./locale";

export type PeriodKey = "week" | "month" | "semester";

const id = {
  schedule: {
    title: "Lihat jadwal",
    lead: "Cek sesi yang masih kosong sebelum mengajukan. Klik sesi hijau untuk lanjut.",
    mostBorrowed: "Paling sering dipinjam",
    prevWeek: "Pekan sebelumnya",
    nextWeek: "Pekan berikutnya",
    chooseDay: "Pilih hari",
    filterLabel: "Filter kategori",
    tableLabel: (day: string) => `Jadwal ${day}`,
    facilityColumn: "Fasilitas",
    empty: "Tidak ada fasilitas di kategori ini.",
    cell: {
      past: "Lewat",
      pending: ["Menunggu", "verifikasi"] as [string, string],
      free: "Kosong",
      taken: "Terisi",
      soldOut: "Habis",
      available: "tersedia",
    },
    requestCell: (facility: string, session: string, state: string) => `${facility}, ${session}, ${state}. Ajukan sesi ini`,
    legendLabel: "Keterangan:",
    legend: { available: "Tersedia", pending: "Menunggu verifikasi", full: "Terisi / habis" },
  },

  mostBorrowed: {
    title: "Paling sering dipinjam",
    lead: "Peringkat fasilitas yang paling banyak diajukan mahasiswa.",
    viewSchedule: "Lihat jadwal",
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
    title: "View schedule",
    lead: "Check which sessions are still free before you request. Click a green session to continue.",
    mostBorrowed: "Most borrowed",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    chooseDay: "Choose a day",
    filterLabel: "Category filter",
    tableLabel: (day) => `Schedule for ${day}`,
    facilityColumn: "Facility",
    empty: "No facilities in this category.",
    cell: {
      past: "Passed",
      pending: ["Awaiting", "verification"],
      free: "Free",
      taken: "Booked",
      soldOut: "Sold out",
      available: "available",
    },
    requestCell: (facility, session, state) => `${facility}, ${session}, ${state}. Request this session`,
    legendLabel: "Legend:",
    legend: { available: "Available", pending: "Awaiting verification", full: "Booked / sold out" },
  },

  mostBorrowed: {
    title: "Most borrowed",
    lead: "Facilities that students request the most.",
    viewSchedule: "View schedule",
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
