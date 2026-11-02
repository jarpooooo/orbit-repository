// app/jadwal-ruang/paling-sering-dipinjam/page.tsx
// Rute: /jadwal-ruang/paling-sering-dipinjam
//
// "10 Paling sering dipinjam" (Figma node 8:1840): podium peringkat 1–3 + daftar peringkat 4–9.
//  - Filter periode: Minggu ini / Bulan ini / Semester. Angka "Minggu ini" persis Figma;
//    Bulan & Semester = SIMULASI (angka minggu ini dikali 4 dan 13).
//  - Lebar bar = jumlah / jumlah peringkat 1 (di Figma 9× = 50% dari 18×).
//  - Baris 4–9: tombol "Pinjam" muncul saat hover/fokus (di layar kecil selalu tampil).
//  - Badge izin diambil dari field `izin` di fasilitas.ts.
// Satu file, tanpa asset baru (ilustrasi dari FACILITY_ILLUSTRATIONS). Data statis, belum ada penyimpanan.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICONS } from "@/app/design/icon-map";
import { STATUS, getFasilitas, type Fasilitas } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

const PERIODE = [
  { key: "minggu", label: "Minggu ini", faktor: 1 },
  { key: "bulan", label: "Bulan ini", faktor: 4 },
  { key: "semester", label: "Semester", faktor: 13 },
] as const;
type PeriodeKey = (typeof PERIODE)[number]["key"];

/** Jumlah dipinjam "Minggu ini" (Figma). Sudah terurut dari terbanyak. */
const DATA: readonly { slug: string; n: number }[] = [
  { slug: "kit-esp32", n: 18 },
  { slug: "converter-hdmi", n: 15 },
  { slug: "ruang-diskusi-a", n: 12 },
  { slug: "multimeter-digital", n: 9 },
  { slug: "ruang-sidang", n: 8 },
  { slug: "kamera-mirrorless", n: 6 },
  { slug: "pc-lab-rpl", n: 5 },
  { slug: "arduino-uno-r3", n: 4 },
  { slug: "proyektor-portabel", n: 3 },
];

type Item = { f: Fasilitas; n: number };

function Badge({ f }: { f: Fasilitas }) {
  const st = STATUS[f.izin];
  return (
    <span className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold leading-[normal] ${st.box} ${st.text}`}>
      <span aria-hidden className={`size-2 rounded-full ${st.dot}`} />
      {st.label}
    </span>
  );
}

const tombol =
  "flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] leading-[normal] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]";

/** Kartu podium (peringkat 1–3). */
function Podium({ item, peringkat, faktor }: { item: Item; peringkat: 1 | 2 | 3; faktor: number }) {
  const { f, n } = item;
  const juara = peringkat === 1;
  const gaya = {
    1: { lencana: "bg-[#ffd43b]", bayang: "shadow-[5px_5px_0_0_#ffd43b] sm:shadow-[7px_7px_0_0_#ffd43b]", urut: "order-1 md:order-2" },
    2: { lencana: "bg-[#6c98ff]", bayang: "shadow-[5px_5px_0_0_#6c98ff] sm:shadow-[7px_7px_0_0_#6c98ff]", urut: "order-2 md:order-1" },
    3: { lencana: "bg-[#f2862e]", bayang: "shadow-[5px_5px_0_0_#f2862e] sm:shadow-[7px_7px_0_0_#f2862e]", urut: "order-3" },
  }[peringkat];
  const ukuran = juara ? 140 : 100;

  return (
    <li className={`flex min-w-0 flex-1 flex-col items-center gap-[10px] rounded-[22px] border-2 border-[#0d2a4b] bg-white p-[22px] ${gaya.bayang} ${gaya.urut}`}>
      <span
        aria-label={`Peringkat ${peringkat}`}
        className={`${display} flex size-11 items-center justify-center rounded-full border-2 border-[#0d2a4b] text-[24px] leading-[normal] text-[#0d2a4b] ${gaya.lencana}`}
      >
        {peringkat}
      </span>
      <div className={`flex w-full items-center justify-center rounded-[18px] border-2 border-[#0d2a4b] bg-[#ffd43b] ${juara ? "p-[26px]" : "p-[18px]"}`}>
        <Image src={FACILITY_ILLUSTRATIONS[f.img]} alt="" width={ukuran} height={ukuran} style={{ width: ukuran, height: ukuran }} />
      </div>
      <h3 className={`${display} text-center font-normal leading-[normal] text-[#0d2a4b] ${juara ? "text-[30px]" : "text-[26px]"}`}>
        {peringkat === 3 ? (
          <Link href={`/katalog/${f.slug}`} className="hover:underline">{f.name}</Link>
        ) : (
          f.name
        )}
      </h3>
      <span className="text-[12px] font-extrabold uppercase leading-[normal] text-[#5b3bb5]">{f.group}</span>
      <p className="flex items-end gap-2 leading-[normal]">
        <span className={`${display} text-[#0d2a4b] ${juara ? "text-[48px]" : "text-[40px]"}`}>{n * faktor}×</span>
        <span className="pb-1 text-[14px] font-bold text-[#5b6f87]">dipinjam</span>
      </p>
      <Badge f={f} />
      {peringkat !== 3 && (
        <Link href={`/katalog/${f.slug}`} className={`${display} ${tombol} bg-[#f2862e] px-[18px] py-2 text-[15px]`}>
          Lihat detail
        </Link>
      )}
    </li>
  );
}

export default function PalingSeringDipinjamPage() {
  const Sep = UI_ICONS.breadcrumbSeparator;
  const [periode, setPeriode] = useState<PeriodeKey>("minggu");
  const faktor = PERIODE.find((p) => p.key === periode)!.faktor;

  const daftar: Item[] = DATA.map((d) => ({ f: getFasilitas(d.slug), n: d.n })).filter((x): x is Item => !!x.f);
  const podium = daftar.slice(0, 3);
  const sisa = daftar.slice(3);
  const maks = daftar[0]?.n ?? 1;

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[128px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-[22px]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href="/jadwal-ruang" className="hover:text-[#0d2a4b] hover:underline">Lihat jadwal</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Paling sering dipinjam</span>
        </nav>

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className={`${display} text-[36px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[56px]`}>Paling sering dipinjam</h1>
            <p className="text-[15px] text-[#2b3f57] sm:text-[17px]">Peringkat fasilitas yang paling banyak diajukan mahasiswa.</p>
          </div>
          <Link href="/jadwal-ruang" className={`${display} ${tombol} bg-[#ffd43b] px-[18px] py-[9px] text-[15px]`}>
            Lihat jadwal
          </Link>
        </div>

        {/* Periode */}
        <div role="group" aria-label="Periode" className="flex flex-wrap gap-[10px]">
          {PERIODE.map((p) => {
            const on = periode === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={on}
                onClick={() => setPeriode(p.key)}
                className={`rounded-full border-2 border-[#0d2a4b] px-[18px] py-2 text-[15px] font-extrabold leading-[normal] text-[#0d2a4b] transition-transform ${
                  on ? "bg-[#ffd43b] shadow-[0_3px_0_0_#0d2a4b]" : "bg-white hover:-translate-y-0.5"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Podium: urutan visual 2-1-3 di layar lebar, 1-2-3 ke bawah di layar kecil */}
        <ol aria-label="Peringkat 1 sampai 3" className="flex w-full flex-col gap-6 md:flex-row md:items-end md:gap-[26px]">
          {podium.map((it, i) => (
            <Podium key={it.f.slug} item={it} peringkat={(i + 1) as 1 | 2 | 3} faktor={faktor} />
          ))}
        </ol>

        {/* Peringkat 4–9 */}
        <section aria-label="Peringkat 4 sampai 9" className="flex w-full flex-col gap-[10px] rounded-[20px] border-2 border-[#0d2a4b] bg-white p-3 shadow-[4px_4px_0_0_#0d2a4b] sm:p-[18px] sm:shadow-[6px_6px_0_0_#0d2a4b]">
          <h2 className={`${display} text-[24px] font-normal leading-[normal] text-[#0d2a4b] sm:text-[28px]`}>Peringkat 4 – 9</h2>
          <ol className="flex flex-col gap-[10px]">
            {sisa.map((it, i) => {
              const { f, n } = it;
              const urut = i + 4;
              return (
                <li
                  key={f.slug}
                  className={`group grid grid-cols-[34px_54px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-[14px] px-3 py-[10px] focus-within:bg-[#fff4c2] md:grid-cols-[34px_54px_minmax(140px,230px)_minmax(0,1fr)_56px_auto_88px] ${
                    i % 2 === 0 ? "bg-[#fff4c2]" : "bg-white"
                  }`}
                >
                  <span aria-label={`Peringkat ${urut}`} className={`${display} flex size-[34px] items-center justify-center rounded-full border-2 border-[#0d2a4b] bg-white text-[17px] leading-[normal] text-[#0d2a4b]`}>
                    {urut}
                  </span>
                  <span className="rounded-[12px] border-2 border-[#0d2a4b] bg-[#ffd43b] p-[5px]">
                    <Image src={FACILITY_ILLUSTRATIONS[f.img]} alt="" width={40} height={40} className="size-10" />
                  </span>
                  <div className="flex min-w-0 flex-col leading-[normal]">
                    <span className="truncate text-[16px] font-extrabold text-[#0d2a4b]">{f.name}</span>
                    <span className="text-[12px] font-bold text-[#5b6f87]">{f.group}</span>
                  </div>

                  <div className="col-span-3 flex items-center gap-3 md:contents">
                    <div
                      role="meter"
                      aria-label={`${f.name}: ${n * faktor} kali dipinjam`}
                      aria-valuemin={0}
                      aria-valuemax={maks * faktor}
                      aria-valuenow={n * faktor}
                      className="h-4 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-[#0d2a4b] bg-[#e3e8ee]"
                    >
                      <div className="h-full bg-[#1f4fd8] transition-[width] duration-300" style={{ width: `${(n / maks) * 100}%` }} />
                    </div>
                    <span className={`${display} w-14 shrink-0 text-[24px] leading-[normal] text-[#0d2a4b]`}>{n * faktor}×</span>
                  </div>

                  <div className="col-span-3 flex items-center justify-between gap-3 md:contents">
                    <Badge f={f} />
                    <Link
                      href={`/katalog/${f.slug}`}
                      className={`${display} ${tombol} px-4 py-[6px] text-[14px] bg-[#f2862e] md:justify-self-end md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100 md:focus-visible:opacity-100`}
                    >
                      Pinjam
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="text-[13px] text-[#5b6f87]">Data simulasi untuk prototipe.</p>
      </div>
    </main>
  );
}