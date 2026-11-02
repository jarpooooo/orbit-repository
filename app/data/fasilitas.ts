// app/data/fasilitas.ts
//
// Data fasilitas BERSAMA: dipakai halaman Katalog, Detail, Jadwal, Pengajuan, Ringkasan.
// Isi = data simulasi dari Figma. Tanda [placeholder] = tidak ada frame Figma, saya isi sendiri, silakan ganti.
// Nanti tinggal ganti FASILITAS dengan hasil fetch API, bentuk datanya tetap.

import type { FacilityKey } from "@/app/design/icon-map";

export type Group = "Hardware" | "Ruang" | "Logistik";
/** tingkat izin (aturan bisnis) */
export type Izin = "langsung" | "verifikasi" | "surat";
/** status tampil di kartu: tingkat izin, atau "dipinjam" kalau sedang tidak tersedia */
export type StatusKey = Izin | "dipinjam";

export const STATUS: Record<StatusKey, { label: string; box: string; text: string; dot: string }> = {
  verifikasi: { label: "Verifikasi", box: "bg-[#fff4c2]", text: "text-[#6e4a00]", dot: "bg-[#6e4a00]" },
  surat: { label: "Perlu surat", box: "bg-[#ffe0c7]", text: "text-[#8e360a]", dot: "bg-[#8e360a]" },
  dipinjam: { label: "Sedang dipinjam", box: "bg-[#e3e8ee]", text: "text-[#3b4a5c]", dot: "bg-[#3b4a5c]" },
  langsung: { label: "Langsung", box: "bg-[#c9f7e6]", text: "text-[#0b5c43]", dot: "bg-[#0b5c43]" },
};

/** Kotak "Catatan izin" di halaman Detail (teks persis Figma). */
export const IZIN_NOTE: Record<Izin, { title: string; text: string }> = {
  verifikasi: { title: "Verifikasi.", text: "Perlu dicek petugas laboratorium, biasanya kurang dari 1 jam kerja." },
  surat: { title: "Perlu surat.", text: "Wajib melampirkan surat izin bertanda tangan dosen pembimbing." },
  langsung: { title: "Langsung.", text: "Langsung disetujui sistem. Tinggal ambil di loket." },
};

export type Fasilitas = {
  slug: string;
  img: FacilityKey;
  name: string;
  group: Group;
  /** sub-kategori (sama dengan key kartu di Beranda) */
  sub: string;
  /** deskripsi singkat di kartu katalog */
  desc: string;
  /** deskripsi panjang di halaman Detail (kalau beda dari desc) */
  long?: string;
  izin: Izin;
  status: StatusKey;
  /** teks kecil di kartu, mis. "6 unit" */
  meta?: string;
  /** teks di samping badge pada Detail, mis. "6 unit tersedia" */
  tersedia: string;
  /** satuan jumlah: "unit" (alat) atau "orang" (ruang). Dipakai Jadwal/Pengajuan. */
  satuan: "unit" | "orang";
  /** jumlah maksimal yang boleh dipilih (stok atau kapasitas) */
  maks: number;
  /** lokasi ambil/pakai. Tampil di kartu "Pengajuanmu" dan Ringkasan. */
  lokasi: string;
  /** baris tabel spesifikasi */
  rows: readonly (readonly [label: string, value: string])[];
};

export const FASILITAS: readonly Fasilitas[] = [
  {
    slug: "kit-esp32", img: "kit-esp32", name: "Kit ESP32", group: "Hardware", sub: "mikrokontroler",
    desc: "Paket pengembangan IoT lengkap dengan breadboard, kabel jumper, dan sensor dasar.",
    izin: "verifikasi", status: "verifikasi", meta: "6 unit", tersedia: "6 unit tersedia", satuan: "unit", maks: 6,
    lokasi: "Lab Mikrokontroler, Lt. 2",
    rows: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Isi paket", "ESP32 DevKit, breadboard, 20 jumper, 3 sensor"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "multimeter-digital", img: "multimeter-digital", name: "Multimeter Digital", group: "Hardware", sub: "alat-ukur",
    desc: "Alat ukur tegangan, arus, dan hambatan untuk praktikum dan proyek akhir.",
    izin: "surat", status: "surat", meta: "2 unit", tersedia: "2 unit tersedia", satuan: "unit", maks: 2,
    lokasi: "Lab Mikrokontroler, Lt. 2",
    rows: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Fungsi", "Tegangan, arus, hambatan"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "arduino-uno-r3", img: "arduino-uno-r3", name: "Arduino Uno R3", group: "Hardware", sub: "mikrokontroler",
    desc: "Kembali Sen 26 Okt",
    long: "Papan mikrokontroler Arduino Uno R3 untuk praktikum dasar dan prototipe.",
    izin: "langsung", status: "dipinjam", tersedia: "Kembali Sen 26 Okt", satuan: "unit", maks: 1,
    lokasi: "Lab Mikrokontroler, Lt. 2",
    rows: [["Lokasi", "Lab Mikrokontroler, Lt. 2"], ["Isi paket", "Board Arduino Uno R3, kabel USB"], ["Durasi maks.", "3 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "ruang-diskusi-a", img: "ruang-diskusi-a", name: "Ruang Diskusi A", group: "Ruang", sub: "ruang-diskusi",
    desc: "Ruang kecil ber-AC dengan papan tulis untuk kerja kelompok dan bimbingan.",
    izin: "verifikasi", status: "verifikasi", meta: "10 orang", tersedia: "Kapasitas 10 orang", satuan: "orang", maks: 10,
    lokasi: "Gedung TEDI, Lt. 2",
    rows: [["Lokasi", "Gedung TEDI, Lt. 2"], ["Kapasitas", "10 orang"], ["Fasilitas", "AC, papan tulis"], ["Durasi maks.", "2 jam per sesi"]],
  },
  {
    slug: "ruang-sidang", img: "ruang-sidang", name: "Ruang Sidang", group: "Ruang", sub: "ruang-diskusi",
    desc: "Ruang formal untuk sidang, seminar proposal, dan rapat himpunan.",
    izin: "surat", status: "surat", meta: "20 orang", tersedia: "Kapasitas 20 orang", satuan: "orang", maks: 20,
    lokasi: "Gedung TEDI, Lt. 3",
    rows: [["Lokasi", "Gedung TEDI, Lt. 3"], ["Kapasitas", "20 orang"], ["Fasilitas", "AC, proyektor, mikrofon"], ["Durasi maks.", "4 jam per sesi"]],
  },
  {
    // [placeholder] detail
    slug: "pc-lab-rpl", img: "pc-lab-rpl", name: "PC Lab RPL", group: "Ruang", sub: "kursi-pc-lab",
    desc: "Dipakai kelas sampai Kam 29 Okt",
    long: "PC spek tinggi di luar jam praktikum.",
    izin: "langsung", status: "dipinjam", meta: "30 orang", tersedia: "Dipakai kelas sampai Kam 29 Okt", satuan: "orang", maks: 30,
    lokasi: "Lab RPL, Lt. 2",
    rows: [["Lokasi", "Lab RPL, Lt. 2"], ["Kapasitas", "30 orang"], ["Fasilitas", "PC spek tinggi"], ["Durasi maks.", "2 jam per sesi"]],
  },
  {
    slug: "converter-hdmi", img: "converter-hdmi", name: "Converter HDMI", group: "Logistik", sub: "kamera-acara",
    desc: "Adaptor HDMI ke VGA dan USB-C untuk presentasi di ruang mana pun.",
    izin: "langsung", status: "langsung", meta: "12 unit", tersedia: "12 unit tersedia", satuan: "unit", maks: 12,
    lokasi: "Loket Logistik, Lt. 1",
    rows: [["Lokasi", "Loket Logistik, Lt. 1"], ["Tipe", "HDMI ke VGA, USB-C ke HDMI"], ["Durasi maks.", "1 hari"], ["Jaminan", "Tanpa jaminan"]],
  },
  {
    // [placeholder] detail
    slug: "kamera-mirrorless", img: "kamera-mirrorless", name: "Kamera Mirrorless", group: "Logistik", sub: "kamera-acara",
    desc: "Kamera untuk dokumentasi kegiatan himpunan dan proyek video.",
    izin: "surat", status: "surat", meta: "1 unit", tersedia: "1 unit tersedia", satuan: "unit", maks: 1,
    lokasi: "Loket Logistik, Lt. 1",
    rows: [["Lokasi", "Loket Logistik, Lt. 1"], ["Isi paket", "Body, lensa kit, baterai cadangan"], ["Durasi maks.", "2 hari"], ["Jaminan", "KTM ditahan"]],
  },
  {
    // [placeholder] detail
    slug: "proyektor-portabel", img: "proyektor-portabel", name: "Proyektor Portabel", group: "Logistik", sub: "kamera-acara",
    desc: "Kembali Rab 28 Okt",
    long: "Proyektor portabel untuk presentasi dan acara himpunan.",
    izin: "verifikasi", status: "dipinjam", tersedia: "Kembali Rab 28 Okt", satuan: "unit", maks: 1,
    lokasi: "Loket Logistik, Lt. 1",
    rows: [["Lokasi", "Loket Logistik, Lt. 1"], ["Isi paket", "Proyektor, kabel HDMI, kabel power"], ["Durasi maks.", "1 hari"], ["Jaminan", "KTM ditahan"]],
  },
];

export const getFasilitas = (slug: string) => FASILITAS.find((f) => f.slug === slug);