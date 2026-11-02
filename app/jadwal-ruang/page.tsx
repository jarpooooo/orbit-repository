// app/jadwal-ruang/page.tsx
//
// "09 Lihat jadwal" (Figma node 8:1588), menu "Jadwal Ruang" di navbar.
// Tabel ketersediaan: baris = fasilitas, kolom = 4 sesi, untuk satu hari yang dipilih.
//  - Default hari = hari ini (Minggu libur, lewat 17.00 → hari kerja berikutnya). Diambil di browser setelah mount.
//  - ‹ › pindah pekan (sampai MAX_BULAN ke depan). Filter: Semua / Ruang / Hardware / Logistik.
//  - Sel hijau = link ke /katalog/[slug]/ajukan?hari=…&sesi=…&jumlah=1. Sel kuning/abu tidak bisa diklik.
// Data = SIMULASI. POLA di bawah diambil dari Figma (Sen, 26 Okt 2026); hari lain diputar dari pola itu.
// Belum disinkronkan dengan simulasi di halaman Pilih jadwal. Ganti keduanya dengan data API nanti.
// Satu file, tanpa asset baru (ilustrasi dari FACILITY_ILLUSTRATIONS).

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICONS } from "@/app/design/icon-map";
import { getFasilitas, type Fasilitas, type Group } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/** Seberapa jauh ke depan jadwal bisa dilihat (bulan). */
const MAX_BULAN = 6;

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const; // Minggu libur
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const SESI = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"] as const;
const SESI_MULAI = [8, 10, 13, 15];

/* ----------------------------- data simulasi ----------------------------- */

type Isi = number | "kosong" | "terisi" | "menunggu"; // angka = sisa unit (0 = habis)

/** Urutan baris + pola 4 sesi, persis Figma untuk Sen, 26 Okt 2026. */
const BARIS: readonly { slug: string; pola: readonly Isi[] }[] = [
  { slug: "kit-esp32", pola: [6, 4, 0, 3] },
  { slug: "ruang-diskusi-a", pola: ["kosong", "terisi", "kosong", "menunggu"] },
  { slug: "ruang-sidang", pola: ["kosong", "kosong", "terisi", "kosong"] },
  { slug: "pc-lab-rpl", pola: ["terisi", "terisi", "terisi", "terisi"] },
  { slug: "multimeter-digital", pola: [2, 1, 2, 0] },
  { slug: "converter-hdmi", pola: [12, 10, 11, 12] },
  { slug: "kamera-mirrorless", pola: [1, 0, 1, 1] },
];
const ACUAN = new Date(2026, 9, 26, 12); // 26 Okt 2026 = pola Figma apa adanya

type Sel = { tipe: "ok" | "habis" | "menunggu" | "lewat"; baris1: string; baris2: string };

/* --------------------------------- tanggal --------------------------------- */

const noon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return noon(x);
};
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7));
const sameDay = (a: Date, b: Date) => iso(a) === iso(b);
const selisih = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), 12);

function hitungSel(f: Fasilitas, pola: readonly Isi[], d: Date, i: number, now: Date): Sel {
  if (sameDay(d, now) && now.getHours() >= SESI_MULAI[i]) return { tipe: "lewat", baris1: "Lewat", baris2: "" };
  const geser = (((selisih(d, ACUAN) % 4) + 4) % 4);
  const v = pola[(i + geser) % 4];
  if (v === "menunggu") return { tipe: "menunggu", baris1: "Menunggu", baris2: "verifikasi" };
  if (v === "kosong") return { tipe: "ok", baris1: "Kosong", baris2: "" };
  if (v === "terisi") return { tipe: "habis", baris1: "Terisi", baris2: "" };
  if (v > 0) return { tipe: "ok", baris1: `${v} ${f.satuan}`, baris2: "tersedia" };
  return { tipe: "habis", baris1: f.satuan === "orang" ? "Terisi" : "Habis", baris2: "" };
}

const KELAS_SEL: Record<Sel["tipe"], string> = {
  ok: "border-[#0d2a4b] bg-[#c9f7e6] text-[#0b5c43] shadow-[0_3px_0_0_#0d2a4b]",
  menunggu: "border-[#0d2a4b] bg-[#fff4c2] text-[#6e4a00]",
  habis: "border-[#0d2a4b] bg-[#e3e8ee] text-[#3b4a5c]",
  lewat: "border-[#0d2a4b] bg-[#e3e8ee] text-[#3b4a5c] opacity-70",
};

const KOLOM = "md:grid-cols-[210px_repeat(4,minmax(0,1fr))] lg:grid-cols-[280px_repeat(4,minmax(0,1fr))]";

/* -------------------------------- komponen -------------------------------- */

export default function LihatJadwalPage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  // tunggu "hari ini" dari browser dulu (hindari beda render server vs client)
  if (!now) return <main className="min-h-screen bg-[#d7eefb]" />;
  return <Isi now={now} />;
}

function Isi({ now }: { now: Date }) {
  const Sep = UI_ICONS.breadcrumbSeparator;
  const Prev = UI_ICONS.back;
  const Next = UI_ICONS.next;

  const today = noon(now);
  const minDate = (() => {
    let d = today;
    if (now.getHours() >= 17) d = addDays(d, 1);
    if (d.getDay() === 0) d = addDays(d, 1);
    return d;
  })();
  const maxDate = addMonths(today, MAX_BULAN);

  const [sel, setSel] = useState(minDate);
  const [weekStart, setWeekStart] = useState(monday(minDate));
  const [filter, setFilter] = useState<"Semua" | Group>("Semua");

  const bolehHari = (d: Date) => iso(d) >= iso(minDate) && iso(d) <= iso(maxDate);
  const geserPekan = (dir: 1 | -1) => {
    const ws = addDays(weekStart, 7 * dir);
    setWeekStart(ws);
    setSel(iso(ws) < iso(minDate) ? minDate : ws);
  };
  const prevOff = iso(weekStart) <= iso(monday(minDate));
  const nextOff = iso(addDays(weekStart, 7)) > iso(maxDate);

  const strip = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const ujung = strip[5];
  const labelPekan =
    strip[0].getMonth() === ujung.getMonth()
      ? `${strip[0].getDate()} – ${ujung.getDate()} ${BULAN_PENDEK[ujung.getMonth()]} ${ujung.getFullYear()}`
      : `${strip[0].getDate()} ${BULAN_PENDEK[strip[0].getMonth()]} – ${ujung.getDate()} ${BULAN_PENDEK[ujung.getMonth()]} ${ujung.getFullYear()}`;
  const labelSel = `${HARI[(sel.getDay() + 6) % 7] ?? "Min"}, ${sel.getDate()} ${BULAN_PENDEK[sel.getMonth()]} ${sel.getFullYear()}`;

  const daftar = BARIS.map((b) => ({ ...b, f: getFasilitas(b.slug) }))
    .filter((x): x is typeof x & { f: Fasilitas } => !!x.f)
    .filter((x) => filter === "Semua" || x.f.group === filter);

  const ctrl =
    "inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-white text-[#0d2a4b] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[128px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-[18px]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Lihat jadwal</span>
        </nav>

        {/* Judul */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className={`${display} text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[56px]`}>Lihat jadwal</h1>
            <p className="text-[15px] text-[#2b3f57] sm:text-[17px]">Cek sesi yang masih kosong sebelum mengajukan. Klik sesi hijau untuk lanjut.</p>
          </div>
          <Link
            href="/jadwal-ruang/paling-sering-dipinjam"
            className={`${display} flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#ffd43b] px-[18px] py-[9px] text-[15px] leading-[normal] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`}
          >
            Paling sering dipinjam
          </Link>
        </div>

        {/* Pilih hari */}
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Pekan sebelumnya" disabled={prevOff} onClick={() => geserPekan(-1)} className={ctrl}>
              <Prev size={18} strokeWidth={2.5} aria-hidden />
            </button>
            <div role="group" aria-label="Pilih hari" className="flex min-w-0 flex-1 gap-[10px] overflow-x-auto px-1 pb-[5px] pt-[1px]">
              {strip.map((d, i) => {
                const on = sameDay(d, sel);
                const ok = bolehHari(d);
                return (
                  <button
                    key={iso(d)}
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    aria-label={`${HARI[i]} ${d.getDate()} ${BULAN_PENDEK[d.getMonth()]}`}
                    onClick={() => setSel(d)}
                    className={`flex shrink-0 items-center gap-2 rounded-[14px] border-2 px-4 py-2 leading-[normal] transition-transform ${
                      on
                        ? "border-[#0d2a4b] bg-[#ffd43b] shadow-[0_3px_0_0_#0d2a4b]"
                        : ok
                          ? "border-[#0d2a4b] bg-white hover:-translate-y-0.5"
                          : "cursor-not-allowed border-[#b9cfe2] bg-white/50 opacity-60"
                    }`}
                  >
                    <span className="text-[13px] font-extrabold text-[#5b6f87]">{HARI[i]}</span>
                    <span className={`${display} text-[22px] text-[#0d2a4b]`}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" aria-label="Pekan berikutnya" disabled={nextOff} onClick={() => geserPekan(1)} className={ctrl}>
              <Next size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <p aria-live="polite" className="text-[13px] font-bold text-[#5b6f87]">{labelPekan}</p>
        </div>

        {/* Filter kategori */}
        <div role="group" aria-label="Filter kategori" className="flex flex-wrap gap-[10px]">
          {(["Semua", "Ruang", "Hardware", "Logistik"] as const).map((k) => {
            const on = filter === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(k)}
                className={`rounded-full border-2 border-[#0d2a4b] px-[18px] py-2 text-[15px] font-extrabold leading-[normal] text-[#0d2a4b] transition-transform ${
                  on ? "bg-[#ffd43b] shadow-[0_3px_0_0_#0d2a4b]" : "bg-white hover:-translate-y-0.5"
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* Tabel jadwal */}
        <section aria-label={`Jadwal ${labelSel}`} className="flex w-full flex-col gap-2 rounded-[20px] border-2 border-[#0d2a4b] bg-white p-3 shadow-[4px_4px_0_0_#0d2a4b] sm:p-[18px] sm:shadow-[6px_6px_0_0_#0d2a4b]">
          <p className="px-1 text-[13px] font-extrabold text-[#0d2a4b] md:hidden">{labelSel}</p>

          <div aria-hidden className={`hidden gap-2 md:grid ${KOLOM}`}>
            <span className="p-[6px] text-[13px] font-extrabold text-[#5b6f87]">Fasilitas</span>
            {SESI.map((s) => (
              <span key={s} className="py-[6px] text-center text-[13px] font-extrabold text-[#0d2a4b]">{s}</span>
            ))}
          </div>

          {daftar.length === 0 && <p className="p-4 text-[14px] text-[#5b6f87]">Tidak ada fasilitas di kategori ini.</p>}

          {daftar.map(({ f, pola }) => (
            <div key={f.slug} className={`grid grid-cols-2 items-center gap-2 border-t-2 border-[#e6d6a0]/60 pt-3 first:border-t-0 first:pt-0 md:border-t-0 md:pt-0 ${KOLOM}`}>
              <div className="col-span-2 flex items-center gap-3 p-[6px] md:col-span-1 md:h-[60px]">
                <span className="shrink-0 rounded-[12px] border-2 border-[#0d2a4b] bg-[#ffd43b] p-[5px]">
                  <Image src={FACILITY_ILLUSTRATIONS[f.img]} alt="" width={38} height={38} className="size-[38px]" />
                </span>
                <div className="flex min-w-0 flex-col leading-[normal]">
                  <span className="text-[15px] font-extrabold text-[#0d2a4b]">{f.name}</span>
                  <span className="text-[12px] font-bold text-[#5b6f87]">{f.group}</span>
                </div>
              </div>

              {SESI.map((s, i) => {
                const c = hitungSel(f, pola, sel, i, now);
                const teks = `${c.baris1}${c.baris2 ? " " + c.baris2 : ""}`;
                const isi = (
                  <>
                    <span className="text-[11px] font-bold opacity-75 md:hidden">{s}</span>
                    <span className="text-[15px] font-extrabold">{c.baris1}</span>
                    <span className="min-h-[14px] text-[11px] font-medium">{c.baris2 || " "}</span>
                  </>
                );
                const kelas = `flex min-w-0 flex-col items-center rounded-[12px] border-2 py-[10px] text-center leading-[normal] ${KELAS_SEL[c.tipe]}`;
                return c.tipe === "ok" ? (
                  <Link
                    key={s}
                    href={`/katalog/${f.slug}/ajukan?hari=${iso(sel)}&sesi=${i}&jumlah=1`}
                    aria-label={`${f.name}, ${s}, ${teks}. Ajukan sesi ini`}
                    className={`${kelas} transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_#0d2a4b]`}
                  >
                    {isi}
                  </Link>
                ) : (
                  <div key={s} role="img" aria-label={`${f.name}, ${s}, ${teks}`} className={kelas}>
                    {isi}
                  </div>
                );
              })}
            </div>
          ))}
        </section>

        {/* Keterangan */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[13px] font-extrabold text-[#0d2a4b]">Keterangan:</span>
          {(
            [
              ["Tersedia", "bg-[#c9f7e6] text-[#0b5c43]", "bg-[#0b5c43]"],
              ["Menunggu verifikasi", "bg-[#fff4c2] text-[#6e4a00]", "bg-[#6e4a00]"],
              ["Terisi / habis", "bg-[#e3e8ee] text-[#3b4a5c]", "bg-[#3b4a5c]"],
            ] as const
          ).map(([t, box, dot]) => (
            <span key={t} className={`inline-flex items-center gap-[6px] rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold ${box}`}>
              <span aria-hidden className={`size-2 rounded-full ${dot}`} />
              {t}
            </span>
          ))}
          <span className="text-[13px] text-[#5b6f87]">Data simulasi untuk prototipe.</span>
        </div>
      </div>
    </main>
  );
}