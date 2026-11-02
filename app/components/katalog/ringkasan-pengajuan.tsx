// app/components/katalog/ringkasan-pengajuan.tsx
//
// Isi halaman "Ringkasan" (Figma node 1:1633 / 1:1856 / 1:2075): tiket pengajuan + "Langkah berikutnya".
// Status & timeline ikut tingkat izin barang:
//   verifikasi → "Menunggu verifikasi" (kuning)   surat → "Surat diperiksa" (oranye)   langsung → "Disetujui" (hijau)
// Data dari query: ?kode=PJM-1102-4821&hari=2026-11-02&sesi=0&jumlah=1  (dari halaman Ajukan)
// Nama & NIM dibaca dari sessionStorage "pinjamtedi:pengajuan" (ditulis form Ajukan). Kalau kosong → "-".
// Kode QR di sini DEKORASI (pola dari kode, seperti "Kode QR contoh" di Figma). Ganti ke QR asli saat ada API.
// Satu file, tanpa asset baru (ilustrasi pakai FACILITY_ILLUSTRATIONS).

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FACILITY_ILLUSTRATIONS } from "@/app/design/icon-map";
import Stepper from "@/app/components/layout/stepper";
import { STATUS, type Fasilitas, type Izin } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const SESI = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"];
const SESI_MULAI = ["08.00", "10.00", "13.00", "15.00"];

/** Badge status di kepala tiket (label teks persis Figma). Warna dari STATUS di fasilitas.ts. */
const BADGE: Record<Izin, { label: string; warna: Izin }> = {
  verifikasi: { label: "Menunggu verifikasi", warna: "verifikasi" },
  surat: { label: "Surat diperiksa", warna: "surat" },
  langsung: { label: "Disetujui", warna: "langsung" },
};

type Langkah = { s: "done" | "aktif" | "nanti"; t: string; d?: string };

function bacaQuery(sp: URLSearchParams, maks: number) {
  const kode = sp.get("kode") ?? "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(sp.get("hari") ?? "");
  const sesi = Number(sp.get("sesi"));
  const jumlah = Number(sp.get("jumlah"));
  if (!/^PJM-\d{4}-\d{4}$/.test(kode) || !m) return null;
  if (!Number.isInteger(sesi) || sesi < 0 || sesi > 3 || !Number.isInteger(jumlah) || jumlah < 1 || jumlah > maks) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], 12);
  if (Number.isNaN(d.getTime()) || d.getDate() !== +m[3]) return null;
  return { kode, sesi, jumlah, tanggal: `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}` };
}

function buatLangkah(f: Fasilitas, waktu: string): Langkah[] {
  const ruang = f.satuan === "orang";
  const pakai = ruang ? "Gunakan ruangan" : "Ambil di loket";
  const akhir: Langkah = ruang ? { s: "nanti", t: "Selesai", d: "Setelah sesi selesai" } : { s: "nanti", t: "Kembalikan", d: "Setelah sesi selesai" };
  const terkirim: Langkah = { s: "done", t: "Pengajuan terkirim", d: "Baru saja" };
  const estimasi = "Estimasi kurang dari 1 jam kerja";
  if (f.izin === "langsung") {
    return [terkirim, { s: "done", t: "Disetujui otomatis", d: "Baru saja" }, { s: "aktif", t: pakai, d: waktu }, akhir];
  }
  return [
    terkirim,
    { s: "aktif", t: f.izin === "surat" ? "Surat sedang diperiksa" : "Menunggu verifikasi petugas", d: estimasi },
    { s: "nanti", t: "Keputusan dikirim ke notifikasi" },
    { s: "nanti", t: pakai, d: waktu },
  ];
}

/** Pola kotak-kotak deterministik dari kode (hanya dekorasi, bukan QR yang bisa dipindai). */
function polaQr(seed: string) {
  let a = 2166136261;
  for (const c of seed) a = Math.imul(a ^ c.charCodeAt(0), 16777619);
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const N = 13;
  const sudut = (x: number, y: number) => {
    const inA = (cx: number, cy: number) => x >= cx && x < cx + 3 && y >= cy && y < cy + 3;
    const sekitar = (cx: number, cy: number) => x >= cx - 1 && x < cx + 4 && y >= cy - 1 && y < cy + 4;
    for (const [cx, cy] of [[0, 0], [N - 3, 0], [0, N - 3]] as const) {
      if (inA(cx, cy)) return x === cx + 1 && y === cy + 1 ? 0 : 1; // cincin 3x3
      if (sekitar(cx, cy)) return 0; // celah
    }
    return -1;
  };
  const sel: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const s = sudut(x, y);
      if (s === 1 || (s === -1 && rng() > 0.5)) sel.push([x, y]);
    }
  return { N, sel };
}

function Penanda({ s }: { s: Langkah["s"] }) {
  if (s === "done")
    return (
      <span aria-hidden className="mt-[1px] flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0d2a4b] bg-[#2ee6b0]">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-7" stroke="#0d2a4b" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  return (
    <span
      aria-hidden
      className={`mt-[1px] size-6 shrink-0 rounded-full border-2 border-[#0d2a4b] ${s === "aktif" ? "bg-[#ffd43b]" : "bg-[#e3e8ee]"}`}
    />
  );
}

export default function RingkasanPengajuan({ f }: { f: Fasilitas }) {
  const sp = useSearchParams();
  const q = bacaQuery(sp, f.maks);

  // nama & NIM dari sessionStorage (hanya ada di browser → dibaca setelah mount)
  const [peminjam, setPeminjam] = useState("-");
  useEffect(() => {
    if (!q) return;
    try {
      const raw = sessionStorage.getItem("pinjamtedi:pengajuan");
      if (!raw) return;
      const p = JSON.parse(raw) as { kode?: string; nama?: string; nim?: string };
      if (p.kode === q.kode && p.nama && p.nim) setPeminjam(`${p.nama} · ${p.nim}`);
    } catch {
      /* abaikan: tampil "-" */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.kode]);

  const qr = useMemo(() => (q ? polaQr(q.kode) : null), [q?.kode]); // eslint-disable-line react-hooks/exhaustive-deps

  const aksi = `${display} flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] px-[22px] py-[11px] text-[17px] leading-[1.2] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`;

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-[22px]">
        <Stepper active={5} />

        {!q ? (
          <div className="flex max-w-[560px] flex-col items-start gap-4 rounded-[20px] border-2 border-[#0d2a4b] bg-white p-6 shadow-[5px_5px_0_0_#0d2a4b]">
            <h1 className={`${display} text-[28px] leading-none text-[#0d2a4b]`}>Belum ada pengajuan</h1>
            <p className="text-[15px] text-[#2b3f57]">Halaman ini muncul setelah kamu mengirim pengajuan. Mulai dari katalog ya.</p>
            <Link href="/katalog" className={`${aksi} bg-[#f2862e]`}>Buka katalog</Link>
          </div>
        ) : (
          (() => {
            const badge = BADGE[f.izin];
            const st = STATUS[badge.warna];
            const waktu = `${q.tanggal}, ${SESI_MULAI[q.sesi]}`;
            const langkah = buatLangkah(f, waktu);
            const baris: [string, string][] = [
              ["Tanggal", q.tanggal],
              ["Sesi", SESI[q.sesi]],
              ["Jumlah", `${q.jumlah} ${f.satuan}`],
              ["Peminjam", peminjam],
            ];
            return (
              <>
                {/* Judul sukses */}
                <div className="flex items-center gap-4 sm:gap-[18px]">
                  <span className={`${display} flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-[#0d2a4b] bg-[#2ee6b0] text-[20px] text-[#0d2a4b] shadow-[3px_3px_0_0_#0d2a4b] sm:size-[72px] sm:text-[26px] sm:shadow-[4px_4px_0_0_#0d2a4b]`}>
                    OK
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <h1 className={`${display} text-[32px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[44px] xl:text-[52px]`}>Pengajuan terkirim!</h1>
                    <p className="text-[15px] text-[#2b3f57] sm:text-[17px]">Simpan kode di bawah untuk diambil di loket.</p>
                  </div>
                </div>

                {/* Tiket */}
                <section aria-label="Tiket pengajuan" className="w-full overflow-hidden rounded-[22px] border-2 border-[#0d2a4b] bg-white shadow-[5px_5px_0_0_#5b3bb5] sm:shadow-[7px_7px_0_0_#5b3bb5]">
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ffd43b] px-5 py-[18px] sm:px-7">
                    <div className="flex flex-col gap-[2px] text-[#0d2a4b]">
                      <span className="text-[12px] font-extrabold">KODE PENGAJUAN</span>
                      <span className={`${display} text-[28px] leading-[normal] sm:text-[32px]`}>{q.kode}</span>
                    </div>
                    <span className={`inline-flex items-center gap-[6px] rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold ${st.box} ${st.text}`}>
                      <span aria-hidden className={`size-2 rounded-full ${st.dot}`} />
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-start md:gap-[30px]">
                    <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
                      <div className="flex items-center gap-4">
                        <span className="shrink-0 rounded-[14px] border-2 border-[#0d2a4b] bg-[#ffd43b] p-2">
                          <Image src={FACILITY_ILLUSTRATIONS[f.img]} alt="" width={64} height={64} className="size-14 sm:size-16" />
                        </span>
                        <div className="flex min-w-0 flex-col gap-[2px]">
                          <span className={`${display} text-[26px] leading-[normal] text-[#0d2a4b] sm:text-[30px]`}>{f.name}</span>
                          <span className="text-[14px] font-bold text-[#5b6f87]">{f.lokasi}</span>
                        </div>
                      </div>
                      <dl className="flex flex-col">
                        {baris.map(([k, v]) => (
                          <div key={k} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                            <dt className="text-[#5b6f87]">{k}</dt>
                            <dd className="text-right font-bold text-[#0d2a4b]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* QR dekorasi */}
                    {qr && (
                      <div role="img" aria-label={`Kode QR contoh untuk ${q.kode}`} className="shrink-0 self-center rounded-[12px] border-2 border-[#0d2a4b] bg-white p-2 md:self-start">
                        <svg width="130" height="130" viewBox={`0 0 ${qr.N} ${qr.N}`} shapeRendering="crispEdges" aria-hidden>
                          {qr.sel.map(([x, y]) => (
                            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0d2a4b" />
                          ))}
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Langkah berikutnya */}
                  <div className="flex flex-col gap-[14px] px-5 py-[22px] sm:px-7">
                    <h2 className={`${display} text-[24px] font-normal leading-[normal] text-[#0d2a4b]`}>Langkah berikutnya</h2>
                    <ol className="flex flex-col gap-[14px]">
                      {langkah.map((l) => (
                        <li key={l.t} aria-current={l.s === "aktif" ? "step" : undefined} className="flex items-start gap-[14px]">
                          <Penanda s={l.s} />
                          <div className="flex min-w-0 flex-col leading-[normal]">
                            <span className="text-[15px] font-extrabold text-[#0d2a4b]">{l.t}</span>
                            {l.d && <span className="text-[13px] text-[#5b6f87]">{l.d}</span>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>

                <div className="flex flex-wrap gap-[14px]">
                  <Link href="/pengajuan-saya" className={`${aksi} bg-[#f2862e]`}>Lihat pengajuan saya</Link>
                  <Link href="/katalog" className={`${aksi} bg-white`}>Pinjam lagi</Link>
                </div>
              </>
            );
          })()
        )}
      </div>
    </main>
  );
}