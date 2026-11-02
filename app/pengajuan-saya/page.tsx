// app/pengajuan-saya/page.tsx
//
// "07 Pengajuan saya" (Figma node 1:2300): riwayat dan status pinjaman.
// Satu file. Data = CONTOH dari Figma (array PENGAJUAN di bawah), belum ada penyimpanan.
// "Batalkan" hanya mengubah tampilan di halaman ini (state lokal, hilang saat refresh).
// Nanti ganti PENGAJUAN dengan data API; bentuk barisnya tetap.
// Tanpa asset baru: ilustrasi dari FACILITY_ILLUSTRATIONS.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICONS } from "@/app/design/icon-map";
import { STATUS, getFasilitas, type StatusKey } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/** Label status + warna (pinjam warna dari STATUS: verifikasi=kuning, surat=oranye, langsung=hijau, dipinjam=abu). */
const BADGE = {
  verifikasi: { label: "Menunggu verifikasi", warna: "verifikasi" },
  surat: { label: "Surat diperiksa", warna: "surat" },
  disetujui: { label: "Disetujui", warna: "langsung" },
  batal: { label: "Dibatalkan", warna: "dipinjam" },
} as const satisfies Record<string, { label: string; warna: StatusKey }>;
type BadgeKey = keyof typeof BADGE;

type Pengajuan = {
  kode: string;
  slug: string;
  /** teks ringkas, persis Figma */
  waktu: string;
  status: Exclude<BadgeKey, "batal">;
  /** pengajuan yang belum lewat boleh dibatalkan */
  bisaBatal: boolean;
};

// Data contoh (dari Figma). Urutan: terbaru di atas.
const PENGAJUAN: readonly Pengajuan[] = [
  { kode: "PJM-1026-0016", slug: "converter-hdmi", waktu: "Sen, 26 Okt 2026 · 08.00 – 10.00 · 1 unit", status: "disetujui", bisaBatal: true },
  { kode: "PJM-1026-0015", slug: "ruang-sidang", waktu: "Sen, 26 Okt 2026 · 08.00 – 10.00 · 1 orang", status: "surat", bisaBatal: true },
  { kode: "PJM-1026-0014", slug: "kit-esp32", waktu: "Sen, 26 Okt 2026 · 08.00 – 10.00 · 1 unit", status: "verifikasi", bisaBatal: true },
  { kode: "PJM-1024-0012", slug: "kit-esp32", waktu: "Sen, 19 Okt 2026 · 08.00 – 10.00 · 1 unit", status: "disetujui", bisaBatal: false },
];

export default function PengajuanSayaPage() {
  const Sep = UI_ICONS.breadcrumbSeparator;
  const [batal, setBatal] = useState<ReadonlySet<string>>(new Set());

  const daftar = PENGAJUAN.map((p) => ({ p, f: getFasilitas(p.slug) })).filter(
    (x): x is { p: Pengajuan; f: NonNullable<ReturnType<typeof getFasilitas>> } => !!x.f,
  );

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px] xl:pb-[90px] ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Pengajuan saya</span>
        </nav>

        <h1 className={`${display} text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[56px]`}>Pengajuan saya</h1>
        <p className="text-[16px] text-[#2b3f57] sm:text-[18px]">Riwayat dan status pinjamanmu.</p>

        <ul aria-live="polite" className="flex w-full flex-col gap-5">
          {daftar.map(({ p, f }) => {
            const dibatalkan = batal.has(p.kode);
            const b = BADGE[dibatalkan ? "batal" : p.status];
            const st = STATUS[b.warna];
            return (
              <li
                key={p.kode}
                className="flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-[18px] border-2 border-[#0d2a4b] bg-white px-4 py-4 shadow-[3px_3px_0_0_#0d2a4b] sm:px-5 sm:shadow-[4px_4px_0_0_#0d2a4b]"
              >
                <span className="shrink-0 rounded-[14px] border-2 border-[#0d2a4b] bg-[#ffd43b] p-2">
                  <Image src={FACILITY_ILLUSTRATIONS[f.img]} alt="" width={60} height={60} className="size-[52px] sm:size-[60px]" />
                </span>

                <div className="flex min-w-[180px] flex-1 flex-col gap-[2px] leading-[normal]">
                  <span className="text-[13px] font-bold text-[#5b6f87]">{p.kode}</span>
                  <span className={`${display} text-[22px] text-[#0d2a4b] sm:text-[24px]`}>{f.name}</span>
                  <span className="text-[13px] font-medium text-[#5b6f87]">{p.waktu}</span>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-[18px]">
                  <span className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold ${st.box} ${st.text}`}>
                    <span aria-hidden className={`size-2 rounded-full ${st.dot}`} />
                    {b.label}
                  </span>
                  {p.bisaBatal && !dibatalkan && (
                    <button
                      type="button"
                      aria-label={`Batalkan pengajuan ${p.kode}`}
                      onClick={() => setBatal((s) => new Set(s).add(p.kode))}
                      className={`${display} rounded-[14px] border-2 border-[#0d2a4b] bg-white px-[14px] py-[7px] text-[14px] leading-[normal] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`}
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <Link
          href="/katalog"
          className={`${display} flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#ffd43b] px-[22px] py-[11px] text-[17px] leading-[normal] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`}
        >
          Ajukan pinjaman baru
        </Link>
      </div>
    </main>
  );
}