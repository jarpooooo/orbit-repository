// app/i18n/my-requests.ts
//
// Text for "Pengajuan saya" (app/my-requests/page.tsx).

import type { Dictionary } from "./locale";

export type RequestStatusKey = "verifying" | "letterReview" | "approved" | "cancelled";

const id = {
  title: "Pengajuan saya",
  lead: "Riwayat dan status pinjamanmu.",
  statuses: {
    verifying: "Menunggu verifikasi",
    letterReview: "Surat diperiksa",
    approved: "Disetujui",
    cancelled: "Dibatalkan",
  } as Record<RequestStatusKey, string>,
  cancel: "Batalkan",
  cancelLabel: (code: string) => `Batalkan pengajuan ${code}`,
  newRequest: "Ajukan pinjaman baru",
};

const en: typeof id = {
  title: "My requests",
  lead: "Your borrowing history and status.",
  statuses: {
    verifying: "Awaiting verification",
    letterReview: "Letter under review",
    approved: "Approved",
    cancelled: "Cancelled",
  },
  cancel: "Cancel",
  cancelLabel: (code) => `Cancel request ${code}`,
  newRequest: "New borrowing request",
};

export const MY_REQUESTS_TEXT: Dictionary<typeof id> = { id, en };
