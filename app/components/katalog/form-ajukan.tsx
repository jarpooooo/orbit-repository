// app/components/katalog/form-ajukan.tsx
//
// Isi halaman "Ajukan" (Figma node 1:1342 / 1:1437 / 1:1538).
//  - Query dari langkah Jadwal: ?hari=2026-11-02&sesi=0&jumlah=1  (dicek, kalau rusak → minta pilih jadwal ulang)
//  - Upload "Surat izin dosen" (PDF) hanya muncul kalau izin = "surat"
//  - Kirim masih simulasi (tanpa API). Setelah valid → /katalog/[slug]/ringkasan?kode=PJM-…&hari=…&sesi=…&jumlah=…
//    Halaman Ringkasan dibuat di langkah berikutnya.
// Satu file, tanpa asset baru.

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { UI_ICONS } from "@/app/design/icon-map";
import Stepper from "@/app/components/layout/stepper";
import type { Fasilitas } from "@/app/data/fasilitas";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const SESI = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"];
const MAKS_PDF = 2 * 1024 * 1024; // 2 MB
const WAJIB_SURAT = false; // ganti true kalau PDF harus dilampirkan

type Errors = Partial<Record<"nama" | "nim" | "prodi" | "keperluan" | "surat" | "setuju", string>>;

function bacaQuery(sp: URLSearchParams, maks: number) {
  const hari = sp.get("hari") ?? "";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(hari);
  const sesi = Number(sp.get("sesi"));
  const jumlah = Number(sp.get("jumlah"));
  if (!m || !Number.isInteger(sesi) || sesi < 0 || sesi > 3 || !Number.isInteger(jumlah) || jumlah < 1 || jumlah > maks) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], 12);
  if (Number.isNaN(d.getTime()) || d.getDate() !== +m[3]) return null;
  return { hari, sesi, jumlah, label: `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}` };
}

const ukuran = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function Isian({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13px] font-extrabold leading-[18px] text-[#0d2a4b]">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="text-[12px] font-bold text-[#8e360a]">{error}</p>}
    </div>
  );
}

export default function FormAjukan({ f }: { f: Fasilitas }) {
  const router = useRouter();
  const sp = useSearchParams();
  const q = bacaQuery(sp, f.maks);

  const Sep = UI_ICONS.breadcrumbSeparator;

  const [nama, setNama] = useState("");
  const [nim, setNim] = useState("");
  const [prodi, setProdi] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [surat, setSurat] = useState<File | null>(null);
  const [setuju, setSetuju] = useState(false);
  const [err, setErr] = useState<Errors>({});
  const [kirim, setKirim] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const butuhSurat = f.izin === "surat";
  const linkJadwal = `/katalog/${f.slug}/jadwal`;

  function pilihFile(file: File | undefined) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSurat(null);
      setErr((e) => ({ ...e, surat: "File harus PDF." }));
    } else if (file.size > MAKS_PDF) {
      setSurat(null);
      setErr((e) => ({ ...e, surat: "Ukuran PDF maksimal 2 MB." }));
    } else {
      setSurat(file);
      setErr((e) => ({ ...e, surat: undefined }));
    }
    if (fileRef.current) fileRef.current.value = ""; // supaya file yang sama bisa dipilih lagi
  }

  function validasi(): Errors {
    const e: Errors = {};
    if (nama.trim().length < 3) e.nama = "Isi nama lengkap.";
    if (!/^\d{6,15}$/.test(nim.trim())) e.nim = "NIM berupa angka, 6–15 digit.";
    if (prodi.trim().length < 3) e.prodi = "Isi program studi.";
    if (keperluan.trim().length < 5) e.keperluan = "Tulis keperluan singkat.";
    if (WAJIB_SURAT && butuhSurat && !surat) e.surat = "Surat izin dosen (PDF) wajib dilampirkan.";
    if (!setuju) e.setuju = "Centang pernyataan ini dulu.";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!q || kirim) return;
    const e = validasi();
    setErr(e);
    if (Object.keys(e).length) {
      // fokus ke isian bermasalah pertama
      const urut = ["nama", "nim", "prodi", "keperluan", "surat", "setuju"] as const;
      const pertama = urut.find((k) => e[k]);
      if (pertama) document.getElementById(`ajukan-${pertama}`)?.focus();
      return;
    }
    setKirim(true);
    // SIMULASI. Ganti dengan POST ke API; kode asli dari server.
    const now = new Date();
    const kode = `PJM-${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    // simpan nama & NIM untuk halaman Ringkasan (hanya di tab ini; ganti dengan data dari API)
    try {
      sessionStorage.setItem("pinjamtedi:pengajuan", JSON.stringify({ kode, nama: nama.trim(), nim: nim.trim() }));
    } catch {
      /* abaikan: Ringkasan menampilkan "-" */
    }
    const next = new URLSearchParams({ kode, hari: q.hari, sesi: String(q.sesi), jumlah: String(q.jumlah) });
    router.push(`/katalog/${f.slug}/ringkasan?${next.toString()}`);
  }

  const ringkasan: [string, string][] = q
    ? [
        ["Fasilitas", f.name],
        ["Hari", q.label],
        ["Sesi", SESI[q.sesi]],
        ["Jumlah", `${q.jumlah} ${f.satuan}`],
        ["Lokasi", f.lokasi],
      ]
    : [];

  const input =
    "h-[45px] w-full rounded-[12px] border-2 bg-white px-4 text-[15px] text-[#0d2a4b] outline-none placeholder:text-[#5b6f87]/70 focus:border-[#1f4fd8] focus:shadow-[0_0_0_3px_#6c98ff55]";
  const border = (bad?: string) => (bad ? "border-[#8e360a]" : "border-[#0d2a4b]");

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">Beranda</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href="/katalog" className="hover:text-[#0d2a4b] hover:underline">Katalog</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href={`/katalog/${f.slug}`} className="hover:text-[#0d2a4b] hover:underline">{f.name}</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href={linkJadwal} className="hover:text-[#0d2a4b] hover:underline">Jadwal</Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Ajukan</span>
        </nav>

        <Stepper active={4} />

        {!q ? (
          /* query hilang / rusak (mis. buka link langsung) */
          <div className="mt-1 flex max-w-[560px] flex-col items-start gap-4 rounded-[20px] border-2 border-[#0d2a4b] bg-white p-6 shadow-[5px_5px_0_0_#0d2a4b]">
            <h1 className={`${display} text-[28px] leading-none text-[#0d2a4b]`}>Jadwal belum dipilih</h1>
            <p className="text-[15px] text-[#2b3f57]">Pilih hari, sesi, dan jumlah dulu sebelum mengisi data peminjam.</p>
            <Link
              href={linkJadwal}
              className={`${display} flex items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#f2862e] px-[22px] py-[11px] text-[17px] leading-[1.2] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b]`}
            >
              Pilih jadwal
            </Link>
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {/* Formulir */}
            <form
              onSubmit={onSubmit}
              noValidate
              className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] border-2 border-[#0d2a4b] bg-white p-5 shadow-[5px_5px_0_0_#0d2a4b] sm:p-8 lg:max-w-[740px]"
            >
              <div className="flex flex-col gap-2">
                <h1 className={`${display} text-[34px] font-normal leading-none text-[#0d2a4b] sm:text-[40px]`}>Data peminjam</h1>
                <p className="text-[15px] text-[#5b6f87]">Isi singkat saja, hanya yang dibutuhkan petugas.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Isian id="ajukan-nama" label="Nama lengkap" error={err.nama}>
                  <input id="ajukan-nama" value={nama} onChange={(e) => setNama(e.target.value)} autoComplete="name" placeholder="Rani Putri"
                    aria-invalid={!!err.nama} aria-describedby={err.nama ? "ajukan-nama-err" : undefined} className={`${input} ${border(err.nama)}`} />
                </Isian>
                <Isian id="ajukan-nim" label="NIM" error={err.nim}>
                  <input id="ajukan-nim" value={nim} onChange={(e) => setNim(e.target.value.replace(/\D/g, ""))} inputMode="numeric" maxLength={15} placeholder="123456789"
                    aria-invalid={!!err.nim} aria-describedby={err.nim ? "ajukan-nim-err" : undefined} className={`${input} ${border(err.nim)}`} />
                </Isian>
              </div>

              <Isian id="ajukan-prodi" label="Program studi" error={err.prodi}>
                <input id="ajukan-prodi" value={prodi} onChange={(e) => setProdi(e.target.value)} placeholder="Teknik Elektro"
                  aria-invalid={!!err.prodi} aria-describedby={err.prodi ? "ajukan-prodi-err" : undefined} className={`${input} ${border(err.prodi)}`} />
              </Isian>

              <Isian id="ajukan-keperluan" label="Keperluan" error={err.keperluan}>
                <textarea id="ajukan-keperluan" value={keperluan} onChange={(e) => setKeperluan(e.target.value)} rows={3} placeholder="Seminar proposal kelompok"
                  aria-invalid={!!err.keperluan} aria-describedby={err.keperluan ? "ajukan-keperluan-err" : undefined}
                  className={`${input} h-auto resize-y py-3 ${border(err.keperluan)}`} />
              </Isian>

              {butuhSurat && (
                <div className="flex flex-col gap-[6px]">
                  <span id="ajukan-surat-label" className="text-[13px] font-extrabold leading-[18px] text-[#0d2a4b]">Surat izin dosen</span>
                  <div className={`flex flex-wrap items-center gap-3 rounded-[12px] border-2 bg-[#fff7da] p-4 ${border(err.surat)}`}>
                    <input ref={fileRef} id="ajukan-surat-input" type="file" accept="application/pdf,.pdf" className="sr-only" tabIndex={-1}
                      onChange={(e) => pilihFile(e.target.files?.[0])} />
                    <button
                      id="ajukan-surat"
                      type="button"
                      aria-labelledby="ajukan-surat-label"
                      onClick={() => fileRef.current?.click()}
                      className="h-8 rounded-[10px] border-2 border-[#0d2a4b] bg-white px-4 text-[13px] font-extrabold text-[#0d2a4b] transition-transform hover:-translate-y-0.5"
                    >
                      {surat ? "Ganti file" : "Pilih file"}
                    </button>
                    <span className="min-w-0 break-all text-[14px] text-[#2b3f57]">
                      {surat ? `${surat.name} (${ukuran(surat.size)})` : "Belum ada file. PDF, maksimal 2 MB."}
                    </span>
                  </div>
                  {err.surat && <p role="alert" className="text-[12px] font-bold text-[#8e360a]">{err.surat}</p>}
                </div>
              )}

              <div className="flex flex-col gap-[6px]">
                <label className="flex cursor-pointer items-start gap-3">
                  <input id="ajukan-setuju" type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} className="peer sr-only" />
                  <span
                    aria-hidden
                    className="mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 border-[#0d2a4b] bg-white peer-checked:bg-[#2ee6b0] peer-focus-visible:shadow-[0_0_0_3px_#6c98ff] [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7.5l3 3 6-7" stroke="#0d2a4b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="text-[14px] leading-[22px] text-[#2b3f57]">Saya bertanggung jawab atas fasilitas ini dan akan mengembalikannya tepat waktu.</span>
                </label>
                {err.setuju && <p role="alert" className="text-[12px] font-bold text-[#8e360a]">{err.setuju}</p>}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={kirim}
                  className={`${display} flex h-[45px] items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-[#f2862e] px-6 text-[17px] leading-[1.2] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b] disabled:opacity-60`}
                >
                  {kirim ? "Mengirim…" : "Kirim pengajuan"}
                </button>
                <Link
                  href={`${linkJadwal}`}
                  className={`${display} flex h-[45px] items-center justify-center rounded-[14px] border-2 border-[#0d2a4b] bg-white px-6 text-[17px] leading-[1.2] text-[#0d2a4b] shadow-[0_4px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]`}
                >
                  Kembali
                </Link>
              </div>
            </form>

            {/* Pengajuanmu */}
            <aside className="flex w-full flex-col gap-[2px] rounded-[20px] border-2 border-[#0d2a4b] bg-white p-6 shadow-[4px_4px_0_0_#0d2a4b] sm:shadow-[5px_5px_0_0_#0d2a4b] lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0">
              <h2 className={`${display} pb-1 text-[24px] font-normal leading-[normal] text-[#0d2a4b]`}>Pengajuanmu</h2>
              {ringkasan.map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                  <span className="text-[#5b6f87]">{k}</span>
                  <span className="text-right font-bold text-[#0d2a4b]">{v}</span>
                </div>
              ))}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}