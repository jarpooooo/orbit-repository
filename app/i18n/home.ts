// app/i18n/home.ts
//
// Text for the home page sections (components/home/*). Keys are English; values are the UI text.

import type { SubcategoryKey } from "@/app/data/facilities";
import type { Dictionary } from "./locale";

/** Simulated rooms / items in "Ringkasan hari ini" (keys used by components/home/today-summary.tsx). */
export type SummaryItemKey = "esp32" | "hdmi" | "discussionA" | "sensorKit";
/** today's state of a room on the home card: many free hours / a few / none */
export type SlotStatus = "free" | "few" | "full";
/** Steps in the "Empat langkah" card (components/home/how-to-borrow.tsx). */
export type HomeStepKey = "search" | "schedule" | "request" | "pickup";
export type NotificationCtaState = "idle" | "on" | "blocked";

const id = {
  hero: {
    department: "Departemen Teknik Elektro dan Informatika",
    title: "Pinjam alat dan ruang DTEDI tanpa bolak-balik ke lab",
    lead: "Cek stok Arduino, jadwal ruang diskusi, sampai kamera departemen dari satu tempat. Ajukan peminjaman, dan kalau perlu surat, kami buatkan otomatis.",
    startBorrowing: "Mulai pinjam",
    howToBorrow: "Lihat cara pinjam",
    searchPlaceholder: "Cari Arduino, ruang diskusi, kamera…",
    searchLabel: "Cari fasilitas",
    categoryLabel: "Kategori",
    allCategories: "Semua kategori",
    categories: {
      mikrokontroler: "Mikrokontroler",
      "perangkat-jaringan": "Perangkat jaringan",
      "alat-ukur": "Alat ukur",
      "ruang-diskusi": "Ruang diskusi",
      "kursi-pc-lab": "Kursi & PC Lab",
      "kamera-acara": "Kamera & acara",
    } as Record<SubcategoryKey, string>,
    searchButton: "Cari",
    marqueeLabel: "Fasilitas yang bisa dipinjam",
    marquee: [
      "Arduino Uno",
      "Ruang Diskusi",
      "ESP32",
      "Proyektor",
      "Lab Komputer",
      "Raspberry Pi",
      "Kamera",
      "Auditorium",
      "Sound System",
    ],
    illustrationAlt: "Ilustrasi gedung DTEDI dengan kartu peminjaman disetujui",
  },

  todaySummary: {
    freeRoomsTitle: "Ruang kosong hari ini",
    viewSchedule: "Cek ketersediaan",
    popularTitle: "Paling sering dipinjam",
    viewCatalog: "Lihat katalog",
    columns: { time: "Jam kosong", room: "Ruang", status: "Status", rank: "#", item: "Barang / ruang", category: "Kategori", countShort: "Pinjam", countLong: "Minggu ini" },
    slotStatus: { free: () => "Tersedia", few: (n: number) => `Sisa ${n} jam`, full: () => "Penuh" } as Record<SlotStatus, (n: number) => string>,
    noFreeHours: "Tidak ada",
    loading: "Memuat…",
    items: {
      esp32: "ESP32",
      hdmi: "HDMI/VGA Adapter",
      discussionA: "Ruang Diskusi 1",
      sensorKit: "Sensor Kit",
    } as Record<SummaryItemKey, string>,
  },

  categoryPicker: {
    title: "Mau pinjam apa hari ini?",
    lead: "Pilih jenisnya dulu, nanti kamu lihat stok dan jadwalnya.",
    filterLabel: "Filter kategori",
    cards: {
      mikrokontroler: { title: "Mikro-kontroler", description: "Arduino, ESP32, Raspberry Pi." },
      "perangkat-jaringan": { title: "Perangkat jaringan", description: "Router, switch, access point, LAN tester" },
      "alat-ukur": { title: "Alat ukur", description: "Multimeter, oscilloscope, solder station" },
      "ruang-diskusi": { title: "Ruang diskusi", description: "Ruang diskusi, ruang sidang, kelas kosong" },
      "kursi-pc-lab": { title: "Kursi PC lab", description: "PC spek tinggi di luar jam praktikum" },
      "kamera-acara": { title: "Kamera dan acara", description: "Kamera, tripod, proyektor, HT, mic" },
    } as Record<SubcategoryKey, { title: string; description: string }>,
  },

  howToBorrow: {
    title: "Empat langkah, dari cari sampai ambil",
    lead: "Status pengajuanmu selalu kelihatan, jadi kamu tahu harus menunggu apa.",
    steps: {
      search: { title: "Cari", description: "Temukan alat atau ruang lewat pencarian dan filter." },
      schedule: { title: "Pilih jadwal", description: "Slot jam untuk ruang, tanggal ambil dan kembali untuk alat." },
      request: { title: "Ajukan", description: "Isi keperluanmu. Kalau butuh surat, PDF-nya dibuat otomatis." },
      pickup: { title: "Ambil", description: "Datang dengan KTM, cukup sebut nama atau NIM ke pengelola." },
    } as Record<HomeStepKey, { title: string; description: string }>,
    levels: {
      direct: "Barang kecil seperti converter dan clicker. Isi form singkat, ambil pakai KTM.",
      verification: "Kit praktikum dan ruang diskusi. Isi form, titip KTM, dicek laboran/TU.",
      letter: "Kamera, alat mahal, ruang acara. Isi form, titip KTM, lampirkan surat, di-acc penanggung jawab.",
    },
  },

  notificationCta: {
    title: "Jangan sampai ketinggalan status pengajuan",
    lead: "Dapat kabar saat pengajuanmu disetujui, perlu surat, atau sudah waktunya mengembalikan barang.",
    buttons: {
      idle: "Aktifkan notifikasi",
      on: "Notifikasi aktif",
      blocked: "Izin ditolak, cek pengaturan browser",
    } as Record<NotificationCtaState, string>,
  },
};

const en: typeof id = {
  hero: {
    department: "Department of Electrical Engineering and Informatics",
    title: "Borrow DTEDI tools and rooms without running back to the lab",
    lead: "Check Arduino stock, discussion room schedules, even the department cameras in one place. Send a request, and if you need a letter, we generate it for you.",
    startBorrowing: "Start borrowing",
    howToBorrow: "How to borrow",
    searchPlaceholder: "Search Arduino, discussion rooms, cameras…",
    searchLabel: "Search facilities",
    categoryLabel: "Category",
    allCategories: "All categories",
    categories: {
      mikrokontroler: "Microcontrollers",
      "perangkat-jaringan": "Network devices",
      "alat-ukur": "Measuring tools",
      "ruang-diskusi": "Discussion rooms",
      "kursi-pc-lab": "PC lab seats",
      "kamera-acara": "Cameras & events",
    },
    searchButton: "Search",
    marqueeLabel: "Facilities you can borrow",
    marquee: [
      "Arduino Uno",
      "Discussion Room",
      "ESP32",
      "Projector",
      "Computer Lab",
      "Raspberry Pi",
      "Camera",
      "Auditorium",
      "Sound System",
    ],
    illustrationAlt: "Illustration of the DTEDI building with an approved borrowing card",
  },

  todaySummary: {
    freeRoomsTitle: "Free rooms today",
    viewSchedule: "Check availability",
    popularTitle: "Most borrowed",
    viewCatalog: "View catalog",
    columns: { time: "Free hours", room: "Room", status: "Status", rank: "#", item: "Item / room", category: "Category", countShort: "Loans", countLong: "This week" },
    slotStatus: { free: () => "Available", few: (n) => `${n} h left`, full: () => "Full" },
    noFreeHours: "None",
    loading: "Loading…",
    items: {
      esp32: "ESP32",
      hdmi: "HDMI/VGA Adapter",
      discussionA: "Discussion Room 1",
      sensorKit: "Sensor Kit",
    },
  },

  categoryPicker: {
    title: "What do you need today?",
    lead: "Pick a type first, then check its stock and schedule.",
    filterLabel: "Category filter",
    cards: {
      mikrokontroler: { title: "Micro-controllers", description: "Arduino, ESP32, Raspberry Pi." },
      "perangkat-jaringan": { title: "Network devices", description: "Routers, switches, access points, LAN testers" },
      "alat-ukur": { title: "Measuring tools", description: "Multimeters, oscilloscopes, soldering stations" },
      "ruang-diskusi": { title: "Discussion rooms", description: "Discussion rooms, seminar rooms, empty classrooms" },
      "kursi-pc-lab": { title: "PC lab seats", description: "High-spec PCs outside lab hours" },
      "kamera-acara": { title: "Cameras and events", description: "Cameras, tripods, projectors, radios, mics" },
    },
  },

  howToBorrow: {
    title: "Four steps, from search to pickup",
    lead: "Your request status is always visible, so you know what you are waiting for.",
    steps: {
      search: { title: "Search", description: "Find a tool or room with search and filters." },
      schedule: { title: "Pick a time", description: "Time slots for rooms, pickup and return dates for tools." },
      request: { title: "Request", description: "Tell us what it is for. If you need a letter, the PDF is made for you." },
      pickup: { title: "Pick up", description: "Come with your student ID and just give your name or student number." },
    },
    levels: {
      direct: "Small items like converters and clickers. Short form, pick up with your student ID.",
      verification: "Lab kits and discussion rooms. Form, leave your student ID, checked by lab staff.",
      letter: "Cameras, costly tools, event rooms. Form, student ID, signed letter, approval by the person in charge.",
    },
  },

  notificationCta: {
    title: "Never miss a request update",
    lead: "Get notified when your request is approved, needs a letter, or when it is time to return an item.",
    buttons: {
      idle: "Turn on notifications",
      on: "Notifications on",
      blocked: "Permission denied, check your browser settings",
    },
  },
};

export const HOME_TEXT: Dictionary<typeof id> = { id, en };
