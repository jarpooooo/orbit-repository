// app/components/katalog/pilih-jadwal.tsx
//
// Isi halaman "Pilih jadwal" (Figma node 1:979), sekarang bisa dijelajah sampai beberapa bulan:
//  - default = hari ini (Minggu libur → mulai Senin)
//  - strip Sen–Sab per pekan, tombol ‹ › pindah pekan, "Hari ini" kembali ke awal
//  - tombol "Kalender" membuka kalender bulanan untuk lompat jauh
//  - batas: hari ini sampai MAX_BULAN bulan ke depan (ubah konstanta di bawah)
// Pilihan dibawa ke langkah berikutnya lewat query: /katalog/[slug]/ajukan?hari=2026-11-02&sesi=0&jumlah=1
// Ketersediaan sesi masih simulasi (fungsi penuh()). Ganti dari API nanti.
// "Hari ini" diambil di browser setelah mount, supaya tidak beda dengan hasil prerender server.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UI_ICONS } from "@/app/design/icon-map";
import Stepper from "@/app/components/layout/stepper";
import { STATUS, type Fasilitas } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/** Seberapa jauh ke depan boleh memesan (bulan). */
const MAX_BULAN = 6;

/* --------------------------------- tanggal --------------------------------- */

const HARI = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const; // Minggu libur
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const SESI = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"] as const;
const SESI_MULAI = [8, 10, 13, 15];

const noon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return noon(x);
};
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const monday = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)); // getDay: Min=0 → mundur 6 hari
const idxHari = (d: Date) => (d.getDay() + 6) % 7; // Sen=0 … Sab=5, Min=6
const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / 86400000);
const firstOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 12);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
const sameDay = (a: Date, b: Date) => iso(a) === iso(b);

function labelPekan(ws: Date, today: Date) {
  const a = ws;
  const b = addDays(ws, 5);
  const tahun = b.getFullYear();
  const teks =
    a.getMonth() === b.getMonth()
      ? `${a.getDate()} – ${b.getDate()} ${BULAN[b.getMonth()]} ${tahun}`
      : `${a.getDate()} ${BULAN_PENDEK[a.getMonth()]} – ${b.getDate()} ${BULAN_PENDEK[b.getMonth()]} ${tahun}`;
  const iniPekan = sameDay(ws, monday(today));
  return `${iniPekan ? "Pekan ini, " : ""}${teks}.`;
}

/* ------------------------------ data simulasi ------------------------------ */

type Slot = "ok" | "penuh" | "lewat";

/** Simulasi ketersediaan. Ganti dengan data API. */
function slot(f: Fasilitas, d: Date, i: number, now: Date): Slot {
  if (sameDay(d, now) && now.getHours() >= SESI_MULAI[i]) return "lewat";
  if (f.status === "dipinjam" && diffDays(d, noon(now)) < 3) return "penuh";
  if (i === 2) return d.getDate() % 2 === 0 ? "penuh" : "ok";
  return (d.getDate() * 3 + d.getMonth() * 5 + f.slug.length + i) % 7 === 0 ? "penuh" : "ok";
}

const firstFree = (f: Fasilitas, d: Date, now: Date) => SESI.findIndex((_, i) => slot(f, d, i, now) === "ok");

/* -------------------------------- komponen -------------------------------- */

export default function PilihJadwal({ f }: { f: Fasilitas }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  // tunggu "hari ini" dari browser dulu (hindari beda render server vs client)
  if (!now) return <main className="min-h-screen bg-[#d7eefb]" />;
  return <Jadwal f={f} now={now} />;
}

function Jadwal({ f, now }: { f: Fasilitas; now: Date }) {
  const Sep = UI_ICONS.breadcrumbSeparator;
  const Prev = UI_ICONS.back;
  const Next = UI_ICONS.next;
  const Cal = UI_ICONS.calendar;

  const today = noon(now);
  // Minggu libur → mulai Senin. Kalau hari ini sudah lewat jam terakhir (17.00) → mulai hari kerja berikutnya.
  const minDate = (() => {
    let d = today;
    if (now.getHours() >= 17) d = addDays(d, 1);
    if (d.getDay() === 0) d = addDays(d, 1);
    return d;
  })();
  const maxDate = addMonths(today, MAX_BULAN);

  const [sel, setSel] = useState(minDate);
  const [weekStart, setWeekStart] = useState(monday(minDate));
  const [sesi, setSesi] = useState(() => firstFree(f, minDate, now));
  const [jumlah, setJumlah] = useState(1);
  const [kalOpen, setKalOpen] = useState(false);
  const [kalBulan, setKalBulan] = useState(firstOfMonth(minDate));

  const labelJumlah = f.satuan === "orang" ? "Jumlah peserta" : "Jumlah unit";
  const labelSedia = f.satuan === "orang" ? "Kosong" : "Tersedia";
  const ready = sesi >= 0;

  const bolehTanggal = (d: Date) => iso(d) >= iso(minDate) && iso(d) <= iso(maxDate) && d.getDay() !== 0;

  const pilihTanggal = (d: Date) => {
    setSel(d);
    setWeekStart(monday(d));
    setSesi(firstFree(f, d, now));
    setKalBulan(firstOfMonth(d));
  };

  const geserPekan = (dir: 1 | -1) => {
    const ws = addDays(weekStart, 7 * dir);
    pilihTanggal(iso(ws) < iso(minDate) ? minDate : ws);
  };

  const prevDisabled = iso(weekStart) <= iso(monday(minDate));
  const nextDisabled = iso(addDays(weekStart, 7)) > iso(maxDate);

  const hariStrip = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const query = new URLSearchParams({ hari: iso(sel), sesi: String(sesi), jumlah: String(jumlah) }).toString();

  const ringkasan: [string, string][] = [
    ["Fasilitas", f.name],
    ["Hari", `${HARI[idxHari(sel)] ?? "Min"}, ${sel.getDate()} ${BULAN_PENDEK[sel.getMonth()]} ${sel.getFullYear()}`],
    ["Sesi", ready ? SESI[sesi] : "-"],
    [f.satuan === "orang" ? "Peserta" : "Jumlah", String(jumlah)],
    ["Izin", STATUS[f.izin].label],
  ];

  /* ------- kalender bulanan ------- */
  const hariDalamBulan = new Date(kalBulan.getFullYear(), kalBulan.getMonth() + 1, 0).getDate();
  const selBulan: Date[] = [];
  for (let n = 1; n <= hariDalamBulan; n++) {
    const d = new Date(kalBulan.getFullYear(), kalBulan.getMonth(), n, 12);
    if (d.getDay() !== 0) selBulan.push(d);
  }
  const offset = selBulan.length ? idxHari(selBulan[0]) : 0;
  const kalPrevDisabled = iso(kalBulan) <= iso(firstOfMonth(minDate));
  const kalNextDisabled = iso(addMonths(kalBulan, 1)) > iso(maxDate);

  const ctrl =
    "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border-2 border-[#0d2a4b] bg-white px-3 text-[14px] font-extrabold text-[#0d2a4b] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href="/katalog" className="hover:text-[#0d2a4b] hover:underline">Katalog</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href={`/katalog/${f.slug}`} className="hover:text-[#0d2a4b] hover:underline">{f.name}</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Jadwal</span>
        </nav>

        <Stepper active={3} />

        <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Kiri: pilihan */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[18px]">
            <h1 className={`${display} text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[52px]`}>
              Pilih jadwal
            </h1>
            <p aria-live="polite" className="text-[16px] text-[#2b3f57] sm:text-[17px]">{labelPekan(weekStart, today)}</p>

            {/* Navigasi pekan / kalender */}
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-label="Pekan sebelumnya" disabled={prevDisabled} onClick={() => geserPekan(-1)} className={ctrl}>
                <Prev size={18} strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" aria-label="Pekan berikutnya" disabled={nextDisabled} onClick={() => geserPekan(1)} className={ctrl}>
                <Next size={18} strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" onClick={() => pilihTanggal(minDate)} className={ctrl}>
                Hari ini
              </button>
              <button
                type="button"
                aria-expanded={kalOpen}
                onClick={() => setKalOpen((v) => !v)}
                className={`${ctrl} ${kalOpen ? "bg-[#ffd43b]" : ""}`}
              >
                <Cal size={18} strokeWidth={2.25} aria-hidden />
                Kalender
              </button>
            </div>

            {/* Kalender bulanan */}
            {kalOpen && (
              <div className="w-full max-w-[420px] rounded-2xl border-2 border-[#0d2a4b] bg-white p-4 shadow-[4px_4px_0_0_#0d2a4b]">
                <div className="mb-3 flex items-center justify-between">
                  <button type="button" aria-label="Bulan sebelumnya" disabled={kalPrevDisabled} onClick={() => setKalBulan(addMonths(kalBulan, -1))} className={`${ctrl} !h-9 !px-2`}>
                    <Prev size={16} strokeWidth={2.5} aria-hidden />
                  </button>
                  <span className={`${display} text-[20px] text-[#0d2a4b]`}>
                    {BULAN[kalBulan.getMonth()]} {kalBulan.getFullYear()}
                  </span>
                  <button type="button" aria-label="Bulan berikutnya" disabled={kalNextDisabled} onClick={() => setKalBulan(addMonths(kalBulan, 1))} className={`${ctrl} !h-9 !px-2`}>
                    <Next size={16} strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {HARI.map((h) => (
                    <span key={h} className="pb-1 text-[12px] font-extrabold text-[#5b6f87]">{h}</span>
                  ))}
                  {Array.from({ length: offset }, (_, i) => (
                    <span key={`kosong-${i}`} />
                  ))}
                  {selBulan.map((d) => {
                    const ok = bolehTanggal(d);
                    const on = sameDay(d, sel);
                    const hariIni = sameDay(d, today);
                    return (
                      <button
                        key={iso(d)}
                        type="button"
                        disabled={!ok}
                        aria-pressed={on}
                        onClick={() => {
                          pilihTanggal(d);
                          setKalOpen(false);
                        }}
                        className={[
                          "h-10 rounded-[10px] border-2 text-[14px] font-extrabold transition-colors",
                          on
                            ? "border-[#0d2a4b] bg-[#ffd43b] text-[#0d2a4b]"
                            : hariIni
                              ? "border-[#2ee6b0] bg-white text-[#0d2a4b] hover:bg-[#fff7da]"
                              : "border-transparent bg-white text-[#0d2a4b] hover:bg-[#fff7da]",
                          !ok ? "cursor-not-allowed !bg-transparent text-[#b9cfe2] hover:!bg-transparent" : "",
                        ].join(" ")}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-[#5b6f87]">Minggu libur. Bisa memesan sampai {MAX_BULAN} bulan ke depan.</p>
              </div>
            )}

            {/* Hari (Sen–Sab pekan terpilih) */}
            <div role="group" aria-label="Pilih hari" className="grid w-full grid-cols-3 gap-[10px] sm:grid-cols-6">
              {hariStrip.map((d, i) => {
                const on = sameDay(d, sel);
                const ok = bolehTanggal(d);
                return (
                  <button
                    key={iso(d)}
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    onClick={() => pilihTanggal(d)}
                    className={`flex flex-col items-center rounded-[14px] border-2 border-[#0d2a4b] py-[10px] leading-[normal] transition-transform ${
                      on
                        ? "bg-[#ffd43b] shadow-[0_4px_0_0_#0d2a4b]"
                        : ok
                          ? "bg-white hover:-translate-y-0.5"
                          : "cursor-not-allowed border-[#b9cfe2] bg-white/50 opacity-60"
                    }`}
                  >
                    <span className="text-[12px] font-extrabold text-[#5b6f87]">{HARI[i]}</span>
                    <span className={`${display} text-[26px] text-[#0d2a4b]`}>{d.getDate()}</span>
                    <span className="text-[12px] font-extrabold text-[#5b6f87]">{BULAN_PENDEK[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>

            {/* Sesi */}
            <h2 className={`${display} text-[24px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[26px]`}>Sesi tersedia</h2>
            <div role="group" aria-label="Pilih sesi" className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {SESI.map((s, i) => {
                const st = slot(f, sel, i, now);
                const blocked = st !== "ok";
                const on = i === sesi && !blocked;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={blocked}
                    aria-pressed={on}
                    onClick={() => setSesi(i)}
                    className={`flex flex-col items-start gap-[2px] rounded-[14px] border-2 border-[#0d2a4b] px-4 py-[13px] text-left leading-[normal] transition-transform ${
                      blocked
                        ? "cursor-not-allowed bg-[#e3e8ee] text-[#3b4a5c]"
                        : on
                          ? "bg-[#2ee6b0] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b]"
                          : "bg-white text-[#0d2a4b] hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-[15px] font-extrabold">{s}</span>
                    <span className={`text-[12px] font-bold ${blocked ? "" : "text-[#5b6f87]"}`}>
                      {st === "penuh" ? "Penuh" : st === "lewat" ? "Sudah lewat" : on ? "Dipilih" : labelSedia}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Jumlah */}
            <h2 className={`${display} text-[24px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[26px]`}>{labelJumlah}</h2>
            <div className="flex items-center overflow-hidden rounded-[14px] border-2 border-[#0d2a4b] bg-white">
              <button
                type="button"
                aria-label="Kurangi"
                disabled={jumlah <= 1}
                onClick={() => setJumlah((n) => Math.max(1, n - 1))}
                className={`${display} size-11 bg-[#ffd43b] text-[22px] text-[#0d2a4b] disabled:opacity-50`}
              >
                -
              </button>
              <output aria-live="polite" className={`${display} flex h-11 w-16 items-center justify-center text-[20px] text-[#0d2a4b]`}>
                {jumlah}
              </output>
              <button
                type="button"
                aria-label="Tambah"
                disabled={jumlah >= f.maks}
                onClick={() => setJumlah((n) => Math.min(f.maks, n + 1))}
                className={`${display} size-11 bg-[#ffd43b] text-[22px] text-[#0d2a4b] disabled:opacity-50`}
              >
                +
              </button>
            </div>
            <p className="text-[13px] font-bold text-[#5b6f87]">Maksimal {f.maks}</p>
          </div>

          {/* Kanan: ringkasan sementara */}
          <aside className="flex w-full flex-col gap-[2px] rounded-[20px] border-2 border-[#0d2a4b] bg-white p-[22px] shadow-[4px_4px_0_0_#0d2a4b] sm:shadow-[5px_5px_0_0_#0d2a4b] lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0">
            <h2 className={`${display} text-[24px] font-normal leading-[normal] text-[#0d2a4b]`}>Ringkasan sementara</h2>
            {ringkasan.map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                <span className="text-[#5b6f87]">{k}</span>
                <span className="text-right font-bold text-[#0d2a4b]">{v}</span>
              </div>
            ))}
            {ready ? (
              <Link
                href={`/katalog/${f.slug}/ajukan?${query}`}
                className={`${display} mt-1 flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#f2862e] px-[22px] py-[11px] text-[17px] leading-[1.2] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`}
              >
                Lanjut ajukan
              </Link>
            ) : (
              <>
                <span
                  aria-disabled
                  className={`${display} mt-1 flex cursor-not-allowed items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#e3e8ee] px-[22px] py-[11px] text-[17px] leading-[1.2] text-[#5b6f87]`}
                >
                  Lanjut ajukan
                </span>
                <p className="pt-2 text-[13px] text-[#8e360a]">Tidak ada sesi tersisa di hari ini. Pilih hari lain.</p>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}