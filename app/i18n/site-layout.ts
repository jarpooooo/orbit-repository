// app/i18n/site-layout.ts  (not "layout.ts": that name is a route layout file inside app/)
//
// Text for the site chrome on every page: navbar, settings menu, notification panel,
// keyboard shortcut dialog, footer, breadcrumb, and the 5-step stepper (components/layout/*).

import type { Dictionary } from "./locale";

/** Page names used by the navbar, footer, and keyboard shortcuts. */
export type PageKey =
  | "home"
  | "catalog"
  | "roomSchedule"
  | "howToBorrow"
  | "myRequests"
  | "admin"
  | "mostBorrowed"
  | "rules"
  | "notifications"
  | "guide"
  | "sampleLetter"
  | "helpDesk";
export type FooterColumnKey = "explore" | "borrowing" | "help";
export type SampleNotificationKey = "n1" | "n2" | "n3";

const id = {
  pages: {
    home: "Beranda",
    catalog: "Katalog",
    roomSchedule: "Cek Ketersediaan",
    howToBorrow: "Cara Pinjam",
    myRequests: "Pengajuan Saya",
    admin: "Panel Admin",
    mostBorrowed: "Paling Sering Dipinjam",
    rules: "Ketentuan Peminjaman",
    notifications: "Notifikasi",
    guide: "Panduan Peminjaman",
    sampleLetter: "Contoh Surat",
    helpDesk: "Hubungi Help Desk",
  } as Record<PageKey, string>,

  navbar: {
    mainNavLabel: "Navigasi utama",
    homeLinkLabel: "PinjamTEDI, beranda",
    subtitle: "DTEDI Sekolah Vokasi UGM",
    searchPlaceholder: "Cari",
    searchLabel: "Cari fasilitas",
    cta: "Pinjam sekarang",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
  },

  settings: {
    label: "Pengaturan",
    keyboard: { label: "Navigasi keyboard", hint: "Fokus lebih jelas dan pintasan huruf aktif.", showShortcuts: "Lihat pintasan (?)" },
    darkMode: { label: "Mode gelap", hint: "Tampilan gelap untuk mata yang lelah." },
    // shown in both languages so it can be found whatever language is active
    language: { label: "Bahasa · Language", hint: "Pilih bahasa tampilan." },
  },

  notifications: {
    title: "Notifikasi",
    markAllRead: "Tandai dibaca",
    unread: "Belum dibaca. ",
    bellLabel: (unread: number) => (unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"),
    // sample data (text exactly as in Figma); replace with API data later
    samples: {
      n1: { title: "Menunggu verifikasi: ESP32", info: "PJM-1026-0014 · baru saja" },
      n2: { title: "ESP32 siap diambil", info: "PJM-1024-0012 · Senin 09.00" },
      n3: { title: "Pengingat pengembalian", info: "Converter HDMI · besok 16.00" },
    } as Record<SampleNotificationKey, { title: string; info: string }>,
  },

  keyboard: {
    title: "Pintasan keyboard",
    close: "Tutup",
    then: "lalu",
    focusSearch: "Fokus ke kolom cari",
    toggleList: "Buka / tutup daftar pintasan",
    closeList: "Tutup daftar pintasan",
    goTo: (page: string) => `Ke ${page}`,
    footnote: "Pintasan tidak aktif saat kamu mengetik di kolom isian.",
  },

  breadcrumb: { label: "Breadcrumb" },
  stepper: { label: "Langkah peminjaman", steps: ["Jelajah", "Pilih", "Jadwal", "Ajukan", "Ringkasan"] },

  footer: {
    tagline: ["Peminjaman alat dan ruang", "Departemen Teknik Elektro dan Informatika", "Sekolah Vokasi Universitas Gadjah Mada"],
    hours: "Layanan peminjaman: Senin–Sabtu, 08.00–17.00 WIB",
    helpdesk: "Help desk: 0813-2981-4848",
    socialLabel: "Media sosial",
    linksLabel: "Tautan footer",
    columns: { explore: "Jelajahi", borrowing: "Peminjaman", help: "Bantuan" } as Record<FooterColumnKey, string>,
    copyright: "© 2026 PinjamTEDI. Prototipe untuk ORBIT Repository 2026, Branch Developer. Semua data bersifat simulasi.",
    backToTop: "Kembali ke atas",
  },
  /** app/not-found.tsx */
  notFound: {
    code: "404",
    title: "Halaman tidak ditemukan",
    lead: "Tautannya mungkin salah atau halamannya sudah dipindah. Coba cari di katalog, atau mulai lagi dari beranda.",
    catalog: "Buka katalog",
    home: "Ke beranda",
  },
};

const en: typeof id = {
  pages: {
    home: "Home",
    catalog: "Catalog",
    roomSchedule: "Check Availability",
    howToBorrow: "How to Borrow",
    myRequests: "My Requests",
    admin: "Admin Panel",
    mostBorrowed: "Most Borrowed",
    rules: "Borrowing Rules",
    notifications: "Notifications",
    guide: "Borrowing Guide",
    sampleLetter: "Sample Letter",
    helpDesk: "Contact Help Desk",
  },

  navbar: {
    mainNavLabel: "Main navigation",
    homeLinkLabel: "PinjamTEDI, home",
    subtitle: "DTEDI, Vocational College UGM",
    searchPlaceholder: "Search",
    searchLabel: "Search facilities",
    cta: "Borrow now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },

  settings: {
    label: "Settings",
    keyboard: { label: "Keyboard navigation", hint: "Clearer focus and single-letter shortcuts.", showShortcuts: "Show shortcuts (?)" },
    darkMode: { label: "Dark mode", hint: "A darker look for tired eyes." },
    language: { label: "Bahasa · Language", hint: "Choose the display language." },
  },

  notifications: {
    title: "Notifications",
    markAllRead: "Mark as read",
    unread: "Unread. ",
    bellLabel: (unread: number) => (unread ? `Notifications, ${unread} unread` : "Notifications"),
    samples: {
      n1: { title: "Awaiting verification: ESP32", info: "PJM-1026-0014 · just now" },
      n2: { title: "ESP32 ready for pickup", info: "PJM-1024-0012 · Monday 09:00" },
      n3: { title: "Return reminder", info: "HDMI Converter · tomorrow 16:00" },
    },
  },

  keyboard: {
    title: "Keyboard shortcuts",
    close: "Close",
    then: "then",
    focusSearch: "Focus the search field",
    toggleList: "Open / close this list",
    closeList: "Close this list",
    goTo: (page: string) => `Go to ${page}`,
    footnote: "Shortcuts are off while you type in a field.",
  },

  breadcrumb: { label: "Breadcrumb" },
  stepper: { label: "Borrowing steps", steps: ["Browse", "Choose", "Schedule", "Request", "Summary"] },

  footer: {
    tagline: ["Tool and room borrowing", "Department of Electrical Engineering and Informatics", "Vocational College, Universitas Gadjah Mada"],
    hours: "Borrowing service: Monday–Saturday, 08.00–17.00 WIB",
    helpdesk: "Help desk: 0813-2981-4848",
    socialLabel: "Social media",
    linksLabel: "Footer links",
    columns: { explore: "Explore", borrowing: "Borrowing", help: "Help" },
    copyright: "© 2026 PinjamTEDI. Prototype for ORBIT Repository 2026, Branch Developer. All data is simulated.",
    backToTop: "Back to top",
  },
  notFound: {
    code: "404",
    title: "Page not found",
    lead: "The link may be wrong, or the page has moved. Try the catalog, or start from the home page.",
    catalog: "Open the catalog",
    home: "Back to home",
  },
};

export const LAYOUT_TEXT: Dictionary<typeof id> = { id, en };
