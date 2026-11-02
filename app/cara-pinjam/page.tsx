// app/cara-pinjam/page.tsx
//
// Halaman "Cara Pinjam" (Figma node 5:847, di Figma salah diberi nama "08 Notifikasi (panel terbuka)").
// Server component, satu file, tanpa asset baru. Isi:
//   1) 3 kartu tingkat izin (Langsung / Menunggu verifikasi / Perlu surat), teks dari IZIN_NOTE di fasilitas.ts
//   2) 5 kartu langkah: Jelajah → Pilih → Jadwal → Ajukan → Ringkasan
// Catatan penyesuaian dari Figma: teks langkah di Figma bergeser satu langkah dan langkah 4 & 5 kembar,
// jadi teksnya kurapikan supaya cocok dengan nama langkah dan alur aplikasi yang sebenarnya.

import Link from "next/link";
import type { Metadata } from "next";
import { UI_ICONS } from "@/app/design/icon-map";
import { IZIN_NOTE, STATUS, type Izin } from "@/app/data/fasilitas";

export const metadata: Metadata = { title: "Cara Pinjam | PinjamTEDI" };

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/** Urutan kartu izin + label badge persis Figma. */
const IZIN: readonly { key: Izin; label: string }[] = [
  { key: "langsung", label: "Langsung" },
  { key: "verifikasi", label: "Menunggu verifikasi" },
  { key: "surat", label: "Perlu surat" },
];

const LANGKAH: readonly { no: number; judul: string; teks: string; warna: string }[] = [
  { no: 1, judul: "Jelajah", teks: "Temukan alat atau ruang lewat pencarian dan filter.", warna: "bg-[#ffd43b]" },
  { no: 2, judul: "Pilih", teks: "Buka detail fasilitas, cek spesifikasi dan tingkat izinnya.", warna: "bg-[#2ee6b0]" },
  { no: 3, judul: "Jadwal", teks: "Slot jam untuk ruang, tanggal ambil dan kembali untuk alat.", warna: "bg-[#6c98ff]" },
  { no: 4, judul: "Ajukan", teks: "Isi keperluanmu. Kalau butuh surat, lampirkan PDF-nya.", warna: "bg-[#f2862e]" },
  { no: 5, judul: "Ringkasan", teks: "Tunjukkan kode QR dan KTM ke pengelola saat mengambil.", warna: "bg-[#f2862e]" },
];

export default function CaraPinjamPage() {
  const Sep = UI_ICONS.breadcrumbSeparator;

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px] xl:pb-[90px] ${sans}`}>
      <div className="mx-auto flex max-w-[1258px] flex-col items-start gap-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Cara Pinjam</span>
        </nav>

        <h1 className={`${display} text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[56px]`}>Cara Pinjam</h1>
        <p className="max-w-[622px] text-[16px] leading-normal text-[#2b3f57] sm:text-[18px]">
          Setiap fasilitas punya tingkat izin. Itu menentukan seberapa cepat pengajuanmu disetujui.
        </p>

        {/* Tingkat izin */}
        <section aria-labelledby="judul-izin" className="mt-6 w-full sm:mt-10">
          <h2 id="judul-izin" className="sr-only">Tingkat izin</h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-[35px]">
            {IZIN.map(({ key, label }) => {
              const st = STATUS[key];
              return (
                <li
                  key={key}
                  className="flex flex-col items-start gap-2 rounded-[22px] border-2 border-[#0d2a4b] bg-white p-[22px] shadow-[5px_5px_0_0_#1f4fd8] sm:shadow-[6px_6px_0_0_#1f4fd8]"
                >
                  <span className={`inline-flex items-center gap-[6px] rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold leading-[normal] ${st.box} ${st.text}`}>
                    <span aria-hidden className={`size-2 rounded-full ${st.dot}`} />
                    {label}
                  </span>
                  <p className="text-[15px] leading-[1.5] text-[#0d2a4b]">{IZIN_NOTE[key].text}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Langkah */}
        <section aria-labelledby="judul-langkah" className="mt-6 w-full sm:mt-10">
          <h2 id="judul-langkah" className="sr-only">Langkah meminjam</h2>
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {LANGKAH.map((l) => (
              <li key={l.no} className="flex flex-col items-start gap-[10px] rounded-[20px] border-2 border-[#2b5182] bg-[#163a63] p-6">
                <span className={`${display} flex size-12 items-center justify-center rounded-[14px] text-[24px] leading-[1.05] text-[#0d2a4b] ${l.warna}`}>
                  {l.no}
                </span>
                <h3 className="text-[20px] font-bold leading-[1.3] text-white">{l.judul}</h3>
                <p className="text-[16px] leading-[1.55] text-[#d3e3f2]">{l.teks}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}