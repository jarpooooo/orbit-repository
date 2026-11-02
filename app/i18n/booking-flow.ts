// app/i18n/booking-flow.ts
//
// Text for the request flow: Jadwal (schedule-picker), Ajukan (request-form), Ringkasan (request-summary),
// and Pratinjau surat (letter-preview). The generated letter itself stays Indonesian (official document).

import type { PermissionLevel } from "@/app/data/facilities";
import type { Dictionary } from "./locale";

/** Validation / action errors in the request form (stored as keys so they follow a language switch). */
export type RequestErrorKey =
  | "nameRequired"
  | "studentIdFormat"
  | "studyProgramRequired"
  | "purposeRequired"
  | "letterNotPdf"
  | "letterTooLarge"
  | "letterRequired"
  | "agreementRequired"
  | "completeFirst"
  | "storageBlocked";

const id = {
  /** breadcrumb labels for the flow pages */
  crumbs: { schedule: "Jadwal", request: "Ajukan", letter: "Pratinjau surat" },
  summaryRows: { facility: "Fasilitas", day: "Hari", date: "Tanggal", session: "Sesi", people: "Peserta", quantity: "Jumlah", permission: "Izin", location: "Lokasi", borrower: "Peminjam" },

  schedule: {
    title: "Pilih jadwal",
    thisWeek: "Pekan ini, ",
    prevWeek: "Pekan sebelumnya",
    nextWeek: "Pekan berikutnya",
    today: "Hari ini",
    calendar: "Kalender",
    prevMonth: "Bulan sebelumnya",
    nextMonth: "Bulan berikutnya",
    calendarNote: (months: number) => `Minggu libur. Bisa memesan sampai ${months} bulan ke depan.`,
    chooseDay: "Pilih hari",
    sessionsTitle: "Sesi tersedia",
    chooseSession: "Pilih sesi",
    sessionState: { full: "Penuh", past: "Sudah lewat", selected: "Dipilih", free: "Kosong", available: "Tersedia" },
    peopleTitle: "Jumlah peserta",
    unitsTitle: "Jumlah unit",
    decrease: "Kurangi",
    increase: "Tambah",
    max: (n: number) => `Maksimal ${n}`,
    draftTitle: "Ringkasan sementara",
    continue: "Lanjut ajukan",
    noSessionLeft: "Tidak ada sesi tersisa di hari ini. Pilih hari lain.",
  },

  request: {
    noScheduleTitle: "Jadwal belum dipilih",
    noScheduleText: "Pilih hari, sesi, dan jumlah dulu sebelum mengisi data peminjam.",
    chooseSchedule: "Pilih jadwal",
    title: "Data peminjam",
    lead: "Isi singkat saja, hanya yang dibutuhkan petugas.",
    fields: { name: "Nama lengkap", studentId: "NIM", studyProgram: "Program studi", purpose: "Keperluan", letter: "Surat izin dosen" },
    placeholders: { name: "Rani Putri", studentId: "123456789", studyProgram: "Teknik Elektro", purpose: "Seminar proposal kelompok" },
    replaceFile: "Ganti file",
    chooseFile: "Pilih file",
    noFile: "Belum ada file. PDF, maksimal 2 MB.",
    letterHelp: "Belum punya surat? Isi data di atas, lihat pratinjaunya, unduh, cetak, minta tanda tangan, lalu unggah sebagai PDF.",
    previewLetter: "Pratinjau surat",
    agreement: "Saya bertanggung jawab atas fasilitas ini dan akan mengembalikannya tepat waktu.",
    submit: "Kirim pengajuan",
    submitting: "Mengirim…",
    back: "Kembali",
    summaryTitle: "Pengajuanmu",
    errors: {
      nameRequired: "Isi nama lengkap.",
      studentIdFormat: "NIM berupa angka, 6–15 digit.",
      studyProgramRequired: "Isi program studi.",
      purposeRequired: "Tulis keperluan singkat.",
      letterNotPdf: "File harus PDF.",
      letterTooLarge: "Ukuran PDF maksimal 2 MB.",
      letterRequired: "Surat izin dosen (PDF) wajib dilampirkan.",
      agreementRequired: "Centang pernyataan ini dulu.",
      completeFirst: "Lengkapi data di atas dulu, baru surat bisa dilihat.",
      storageBlocked: "Browser menolak menyimpan data sementara. Coba tab biasa (bukan mode privat).",
    } as Record<RequestErrorKey, string>,
  },

  summary: {
    emptyTitle: "Belum ada pengajuan",
    emptyText: "Halaman ini muncul setelah kamu mengirim pengajuan. Mulai dari katalog ya.",
    openCatalog: "Buka katalog",
    successBadge: "OK",
    title: "Pengajuan terkirim!",
    lead: "Simpan kode di bawah untuk diambil di loket.",
    ticketLabel: "Tiket pengajuan",
    codeLabel: "KODE PENGAJUAN",
    /** ticket header badge (text exactly as in Figma) */
    statusLabels: { verification: "Menunggu verifikasi", letter: "Surat diperiksa", direct: "Disetujui" } as Record<PermissionLevel, string>,
    qrLabel: (code: string) => `Kode QR contoh untuk ${code}`,
    nextStepsTitle: "Langkah berikutnya",
    steps: {
      sent: "Pengajuan terkirim",
      justNow: "Baru saja",
      autoApproved: "Disetujui otomatis",
      useRoom: "Gunakan ruangan",
      pickUp: "Ambil di loket",
      done: "Selesai",
      returnItem: "Kembalikan",
      afterSession: "Setelah sesi selesai",
      letterCheck: "Surat sedang diperiksa",
      staffCheck: "Menunggu verifikasi petugas",
      estimate: "Estimasi kurang dari 1 jam kerja",
      decision: "Keputusan dikirim ke notifikasi",
    },
    myRequests: "Lihat pengajuan saya",
    borrowAgain: "Pinjam lagi",
  },

  letter: {
    noDataTitle: "Data surat belum ada",
    noDataText: "Isi data peminjam di form dulu, lalu klik “Pratinjau surat”.",
    toForm: "Ke form Ajukan",
    title: "Pratinjau surat",
    lead: "Cek isinya. Kalau sudah benar, unduh, cetak, lalu minta tanda tangan.",
    officialNote: "",
    downloadWord: "Unduh Word",
    downloadPdf: "Unduh PDF",
    editData: "Kembali ubah data",
    preparing: "Menyiapkan surat…",
    renderFailed: "Surat gagal ditampilkan.",
  },
};

const en: typeof id = {
  crumbs: { schedule: "Schedule", request: "Request", letter: "Letter preview" },
  summaryRows: { facility: "Facility", day: "Day", date: "Date", session: "Session", people: "People", quantity: "Quantity", permission: "Permission", location: "Location", borrower: "Borrower" },

  schedule: {
    title: "Choose a time",
    thisWeek: "This week, ",
    prevWeek: "Previous week",
    nextWeek: "Next week",
    today: "Today",
    calendar: "Calendar",
    prevMonth: "Previous month",
    nextMonth: "Next month",
    calendarNote: (months) => `Closed on Sundays. You can book up to ${months} months ahead.`,
    chooseDay: "Choose a day",
    sessionsTitle: "Available sessions",
    chooseSession: "Choose a session",
    sessionState: { full: "Full", past: "Already passed", selected: "Selected", free: "Free", available: "Available" },
    peopleTitle: "Number of people",
    unitsTitle: "Number of units",
    decrease: "Decrease",
    increase: "Increase",
    max: (n) => `Up to ${n}`,
    draftTitle: "Draft summary",
    continue: "Continue to request",
    noSessionLeft: "No sessions left on this day. Pick another day.",
  },

  request: {
    noScheduleTitle: "No time chosen yet",
    noScheduleText: "Pick a day, session, and quantity before filling in the borrower details.",
    chooseSchedule: "Choose a time",
    title: "Borrower details",
    lead: "Keep it short, only what the staff need.",
    fields: { name: "Full name", studentId: "Student ID (NIM)", studyProgram: "Study program", purpose: "Purpose", letter: "Lecturer's permission letter" },
    placeholders: { name: "Rani Putri", studentId: "123456789", studyProgram: "Electrical Engineering", purpose: "Group proposal seminar" },
    replaceFile: "Replace file",
    chooseFile: "Choose file",
    noFile: "No file yet. PDF, up to 2 MB.",
    letterHelp: "No letter yet? Fill in the details above, preview it, download, print, get it signed, then upload it as a PDF.",
    previewLetter: "Preview letter",
    agreement: "I am responsible for this facility and will return it on time.",
    submit: "Send request",
    submitting: "Sending…",
    back: "Back",
    summaryTitle: "Your request",
    errors: {
      nameRequired: "Enter your full name.",
      studentIdFormat: "Student ID is numbers only, 6–15 digits.",
      studyProgramRequired: "Enter your study program.",
      purposeRequired: "Write a short purpose.",
      letterNotPdf: "The file must be a PDF.",
      letterTooLarge: "The PDF can be at most 2 MB.",
      letterRequired: "The lecturer's permission letter (PDF) is required.",
      agreementRequired: "Tick this statement first.",
      completeFirst: "Complete the details above first to see the letter.",
      storageBlocked: "The browser refused to save temporary data. Try a normal tab (not private mode).",
    },
  },

  summary: {
    emptyTitle: "No request yet",
    emptyText: "This page appears after you send a request. Start from the catalog.",
    openCatalog: "Open catalog",
    successBadge: "OK",
    title: "Request sent!",
    lead: "Keep the code below to collect it at the counter.",
    ticketLabel: "Request ticket",
    codeLabel: "REQUEST CODE",
    statusLabels: { verification: "Awaiting verification", letter: "Letter under review", direct: "Approved" },
    qrLabel: (code) => `Sample QR code for ${code}`,
    nextStepsTitle: "Next steps",
    steps: {
      sent: "Request sent",
      justNow: "Just now",
      autoApproved: "Approved automatically",
      useRoom: "Use the room",
      pickUp: "Pick up at the counter",
      done: "Done",
      returnItem: "Return it",
      afterSession: "After the session ends",
      letterCheck: "Letter under review",
      staffCheck: "Awaiting staff verification",
      estimate: "Usually less than 1 working hour",
      decision: "Decision sent as a notification",
    },
    myRequests: "View my requests",
    borrowAgain: "Borrow again",
  },

  letter: {
    noDataTitle: "No letter data yet",
    noDataText: "Fill in the borrower details in the form first, then click “Preview letter”.",
    toForm: "Go to the request form",
    title: "Letter preview",
    lead: "Check the content. If it is correct, download, print, and get it signed.",
    officialNote: "The letter itself is in Indonesian because it is an official department document.",
    downloadWord: "Download Word",
    downloadPdf: "Download PDF",
    editData: "Back to edit details",
    preparing: "Preparing the letter…",
    renderFailed: "The letter could not be displayed.",
  },
};

export const BOOKING_TEXT: Dictionary<typeof id> = { id, en };
