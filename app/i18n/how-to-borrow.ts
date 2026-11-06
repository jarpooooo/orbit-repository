// app/i18n/how-to-borrow.ts
//
// Text for the "Cara Pinjam" page (components/how-to-borrow/how-to-borrow-content.tsx).
// Step names are LAYOUT_TEXT.stepper.steps; permission texts are FACILITY_TEXT.permissionNotes.

import type { PermissionLevel } from "@/app/data/facilities";
import type { Dictionary } from "./locale";

const id = {
  title: "Cara Pinjam",
  lead: "Setiap fasilitas punya tingkat izin. Itu menentukan seberapa cepat pengajuanmu disetujui.",
  permissionHeading: "Tingkat izin",
  stepsHeading: "Langkah meminjam",
  /** badge labels exactly as in Figma */
  permissionBadges: { direct: "Langsung", verification: "Menunggu verifikasi", letter: "Perlu surat" } as Record<PermissionLevel, string>,
  /** one text per step (Jelajah → Pilih → Jadwal → Ajukan → Ringkasan) */
  stepTexts: [
    "Temukan alat atau ruang lewat pencarian dan filter.",
    "Buka detail fasilitas, cek spesifikasi dan tingkat izinnya.",
    "Slot jam untuk ruang, tanggal ambil dan kembali untuk alat.",
    "Isi form sesuai level: centang titip KTM, dan lampirkan surat kalau fasilitasnya butuh surat.",
    "Tunjukkan kode QR dan KTM ke pengelola saat mengambil.",
  ],
};

const en: typeof id = {
  title: "How to Borrow",
  lead: "Every facility has a permission level. It decides how quickly your request is approved.",
  permissionHeading: "Permission levels",
  stepsHeading: "Borrowing steps",
  permissionBadges: { direct: "Direct", verification: "Awaiting verification", letter: "Letter required" },
  stepTexts: [
    "Find a tool or room with search and filters.",
    "Open the facility details, check its specs and permission level.",
    "Time slots for rooms, pickup and return dates for tools.",
    "Fill in the form for the level: tick the student ID deposit, and attach the letter if the facility needs one.",
    "Show your QR code and student ID to the staff when you collect it.",
  ],
};

export const HOW_TO_BORROW_TEXT: Dictionary<typeof id> = { id, en };
