// app/i18n/how-to-borrow.ts
//
// Text for the "Cara Pinjam" page (components/how-to-borrow/how-to-borrow-content.tsx).
// Step names are LAYOUT_TEXT.stepper.steps; permission texts are FACILITY_TEXT.permissionNotes.

import type { BookingMode, PermissionLevel } from "@/app/data/facilities";
import type { Dictionary } from "./locale";

const id = {
  title: "Cara Pinjam",
  lead: "Setiap fasilitas punya tingkat izin. Itu menentukan seberapa cepat pengajuanmu disetujui.",
  permissionHeading: "Tingkat izin",
  stepsHeading: "Langkah meminjam",
  /** level names, the same everywhere (catalog, detail, form) */
  permissionBadges: { direct: "Langsung", verification: "Verifikasi", letter: "Butuh surat" } as Record<PermissionLevel, string>,
  /** one text per step (Jelajah → Pilih → Jadwal → Ajukan → Ringkasan) */
  stepTexts: [
    "Temukan alat atau ruang lewat pencarian dan filter.",
    "Buka detail fasilitas, cek spesifikasi dan tingkat izinnya.",
    "Ruangan: pilih hari, lalu jam mulai dan selesai. Barang: tanggal ambil dan kembali.",
    "Isi form sesuai level (NIM format 24/541234/SV/25123), baca ketentuan, centang titip KTM, dan lampirkan surat kalau perlu.",
    "Datang dengan KTM. Cukup sebut nama atau NIM ke pengelola, tanpa kode.",
  ],
  rulesHeading: "Ketentuan peminjaman",
  rulesLead: "Berlaku untuk semua pengajuan. Kamu menyetujuinya saat mengirim form, dan isinya juga tercantum di surat peminjaman.",
  rulesGroups: { daily: "Barang (alat, multimedia, logistik)", session: "Ruangan" } as Record<BookingMode, string>,
};

const en: typeof id = {
  title: "How to Borrow",
  lead: "Every facility has a permission level. It decides how quickly your request is approved.",
  permissionHeading: "Permission levels",
  stepsHeading: "Borrowing steps",
  permissionBadges: { direct: "Direct", verification: "Verification", letter: "Letter required" },
  stepTexts: [
    "Find a tool or room with search and filters.",
    "Open the facility details, check its specs and permission level.",
    "Rooms: choose a day, then a start and end time. Items: pick-up and return dates.",
    "Fill in the form for the level (student ID format 24/541234/SV/25123), read the rules, tick the ID deposit, and attach the letter if needed.",
    "Come with your student ID. Just give your name or student number to the staff, no code needed.",
  ],
  rulesHeading: "Borrowing rules",
  rulesLead: "They apply to every request. You accept them when you send the form, and they are also in the borrowing letter.",
  rulesGroups: { daily: "Items (tools, multimedia, logistics)", session: "Rooms" },
};

export const HOW_TO_BORROW_TEXT: Dictionary<typeof id> = { id, en };
