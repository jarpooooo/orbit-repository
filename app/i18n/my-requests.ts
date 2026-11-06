// app/i18n/my-requests.ts
//
// Text for "Pengajuan saya" (app/my-requests/page.tsx). Status labels are also used by the Summary.

import type { Dictionary } from "./locale";

export type RequestStatusKey = "readyPickup" | "verifying" | "approved" | "cancelled";

const id = {
  title: "Pengajuan saya",
  lead: "Riwayat dan status pinjamanmu.",
  statuses: {
    readyPickup: "Siap diambil",
    verifying: "Menunggu verifikasi",
    approved: "Disetujui",
    cancelled: "Dibatalkan",
  } as Record<RequestStatusKey, string>,
  cancel: "Batalkan",
  cancelLabel: (code: string) => `Batalkan pengajuan ${code}`,
  newRequest: "Ajukan pinjaman baru",
  loading: "Memuat pengajuanmu…",
  emptyTitle: "Belum ada pengajuan",
  emptyText: "Pengajuan yang kamu kirim dari katalog akan muncul di sini beserta statusnya.",
  loadFailed: "Pengajuan gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.",
  cancelling: "Membatalkan…",
  cancelFailed: (code: string) => `Pengajuan ${code} gagal dibatalkan. Coba lagi.`,
  confirmCancel: (code: string) => `Batalkan pengajuan ${code}? Tindakan ini tidak bisa diurungkan.`,
};

const en: typeof id = {
  title: "My requests",
  lead: "Your borrowing history and status.",
  statuses: {
    readyPickup: "Ready for pickup",
    verifying: "Awaiting verification",
    approved: "Approved",
    cancelled: "Cancelled",
  },
  cancel: "Cancel",
  cancelLabel: (code) => `Cancel request ${code}`,
  newRequest: "New borrowing request",
  loading: "Loading your requests…",
  emptyTitle: "No requests yet",
  emptyText: "Requests you send from the catalog show up here with their status.",
  loadFailed: "Your requests could not be loaded. Check your internet connection, then reload the page.",
  cancelling: "Cancelling…",
  cancelFailed: (code) => `Request ${code} could not be cancelled. Try again.`,
  confirmCancel: (code) => `Cancel request ${code}? This cannot be undone.`,
};

export const MY_REQUESTS_TEXT: Dictionary<typeof id> = { id, en };
