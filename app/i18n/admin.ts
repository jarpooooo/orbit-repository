// app/i18n/admin.ts
//
// Text for the admin page (app/admin/page.tsx).

import type { Dictionary } from "./locale";
import type { RequestStatusKey } from "./my-requests";

const id = {
  title: "Data peminjaman",
  lead: "Semua pengajuan peminjaman barang dan ruang. Ubah statusnya di sini; peminjam melihatnya langsung di Pengajuan saya.",
  search: "Cari nama, NIM, atau kode",
  searchLabel: "Cari pengajuan",
  total: "Total pengajuan",
  columns: { borrower: "Peminjam", item: "Barang / ruang", requirements: "Persyaratan", when: "Waktu", status: "Status", action: "Aksi" },
  req: { ktm: "KTM", letter: "Surat", none: "Tidak ada" },
  showing: (n: number, all: number) => `Menampilkan ${n} dari ${all} pengajuan.`,
  all: "Semua",
  loading: "Memuat pengajuan…",
  loadFailed: "Pengajuan gagal dimuat. Periksa koneksi, atau pastikan aturan Firestore terbaru sudah dipublikasikan.",
  empty: "Belum ada pengajuan.",
  borrower: "Peminjam",
  purpose: "Keperluan",
  letter: (name: string) => `Surat: ${name} (di Supabase Storage, bucket letters)`,
  actions: {
    approve: "Setujui",
    reject: "Tolak",
    ready: "Siap diambil",
  },
  confirm: (action: string, code: string) => `${action} pengajuan ${code}?`,
  failed: (code: string) => `Status pengajuan ${code} gagal diubah. Coba lagi.`,
  statuses: {
    readyPickup: "Siap diambil",
    verifying: "Menunggu verifikasi",
    approved: "Disetujui",
    rejected: "Ditolak",
    cancelled: "Dibatalkan",
  } as Record<RequestStatusKey, string>,
};

const en: typeof id = {
  title: "Borrowing data",
  lead: "Every request for equipment and rooms. Change the status here; borrowers see it right away in My requests.",
  search: "Search name, student ID, or code",
  searchLabel: "Search requests",
  total: "All requests",
  columns: { borrower: "Borrower", item: "Item / room", requirements: "Requirements", when: "When", status: "Status", action: "Action" },
  req: { ktm: "ID card", letter: "Letter", none: "None" },
  showing: (n, all) => `Showing ${n} of ${all} requests.`,
  all: "All",
  loading: "Loading requests…",
  loadFailed: "Requests could not be loaded. Check your connection, or make sure the latest Firestore rules are published.",
  empty: "No requests yet.",
  borrower: "Borrower",
  purpose: "Purpose",
  letter: (name) => `Letter: ${name} (in Supabase Storage, bucket letters)`,
  actions: { approve: "Approve", reject: "Reject", ready: "Ready for pickup" },
  confirm: (action, code) => `${action} request ${code}?`,
  failed: (code) => `The status of ${code} could not be changed. Try again.`,
  statuses: {
    readyPickup: "Ready for pickup",
    verifying: "Awaiting verification",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  },
};

export const ADMIN_TEXT: Dictionary<typeof id> = { id, en };
