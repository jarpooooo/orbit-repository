// app/components/home/ringkasan-hari-ini.tsx
//
// Section "Ringkasan hari ini" (Figma node 1:3171, desktop 1440px):
//   kartu 1 "Ruang kosong hari ini"  +  kartu 2 "Paling sering dipinjam".
// Tanpa aset gambar. Server component. Data simulasi ada di RUANG / POPULER (edit / ganti dari API nanti).

import Link from "next/link";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/* ------------------------------- data ------------------------------- */

type Status = "kosong" | "terisi" | "sisa";

const STATUS: Record<Status, { label: string; cls: string }> = {
  kosong: { label: "Kosong", cls: "bg-[#c8f7e6] text-[#0b5c43]" },
  terisi: { label: "Terisi", cls: "bg-[#e4e8ee] text-[#3b4a5c]" },
  sisa: { label: "Sisa 1 slot", cls: "bg-[#ffe2cf] text-[#8e360a]" },
};

const RUANG: readonly { jam: string; nama: string; status: Status }[] = [
  { jam: "08.00–10.00", nama: "Ruang Diskusi A", status: "kosong" },
  { jam: "10.00–12.00", nama: "Ruang Sidang", status: "terisi" },
  { jam: "13.00–15.00", nama: "PC Lab RPL, 8 kursi", status: "kosong" },
  { jam: "15.00–17.00", nama: "Ruang Diskusi B", status: "sisa" },
];

const POPULER: readonly { nama: string; kategori: string; jumlah: number }[] = [
  { nama: "Kit ESP32", kategori: "Hardware", jumlah: 18 },
  { nama: "Converter HDMI", kategori: "Logistik", jumlah: 15 },
  { nama: "Ruang Diskusi A", kategori: "Ruang", jumlah: 12 },
  { nama: "Multimeter digital", kategori: "Hardware", jumlah: 9 },
];

const RANK: Record<number, string> = {
  1: "border-2 border-[#0d2a4b] bg-[#ffd43b]",
  2: "border-2 border-[#0d2a4b] bg-[#e4e8ee]",
  3: "border-2 border-[#0d2a4b] bg-[#f7b98e]",
};

/* ------------------------------ bagian kecil ------------------------------ */

const rowBg = (i: number) => (i % 2 === 0 ? "bg-[#fff4c2]" : "bg-white");

function Card({
  title,
  href,
  cta,
  children,
}: {
  title: string;
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] border-2 border-[#0d2a4b] bg-white p-5 shadow-[5px_5px_0_0_#5b3bb5] sm:rounded-[24px] sm:p-8 sm:shadow-[8px_8px_0_0_#5b3bb5]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className={`${display} text-[26px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[34px]`}>{title}</h2>
        <Link
          href={href}
          className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-2xl border-2 border-b-[6px] border-[#0d2a4b] bg-[#1f4fd8] px-[26px] text-[17px] font-extrabold leading-[1.2] text-white transition-[filter,transform] hover:brightness-110 active:translate-y-[3px] active:border-b-[3px]"
        >
          {cta}
        </Link>
      </div>
      {children}
      <p className="text-[13px] font-normal leading-[1.4] text-[#5b6f87]">Data simulasi untuk prototipe.</p>
    </div>
  );
}

const head = "px-[14px] py-[6px] text-[14px] font-bold leading-[1.3] text-[#2b3f57]";
const row = "items-center gap-3 rounded-xl p-[14px]";

/* -------------------------------- section -------------------------------- */

export default function RingkasanHariIni() {
  // kolom: mobile lebih rapat, sm+ persis Figma (130 / sisa / 130)
  const ruangCols = "grid grid-cols-[84px_minmax(0,1fr)_auto] sm:grid-cols-[130px_minmax(0,1fr)_130px]";
  // populer: kolom Kategori disembunyikan di mobile
  const popCols = "grid grid-cols-[32px_minmax(0,1fr)_52px] sm:grid-cols-[40px_minmax(0,1fr)_100px_90px]";

  return (
    <section className={`bg-[#d7eefb] px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 xl:px-[110px] xl:pb-[72px] xl:pt-[88px] ${sans}`}>
      <div className="mx-auto flex max-w-[1220px] flex-col gap-8 xl:flex-row">
        {/* Ruang kosong hari ini */}
        <Card title="Ruang kosong hari ini" href="/jadwal-ruang" cta="Lihat jadwal">
          <div role="table" aria-label="Ruang kosong hari ini" className="flex flex-col gap-[6px]">
            <div role="row" className={`${ruangCols} gap-3 ${head}`}>
              <span role="columnheader">Jam</span>
              <span role="columnheader">Ruang</span>
              <span role="columnheader">Status</span>
            </div>
            {RUANG.map((r, i) => (
              <div key={r.jam} role="row" className={`${ruangCols} ${row} ${rowBg(i)}`}>
                <span role="cell" className="text-[14px] font-bold leading-[1.3] text-[#0d2a4b] sm:text-[16px]">
                  {r.jam}
                </span>
                <span role="cell" className="min-w-0 text-[15px] font-normal leading-[1.55] text-[#0d2a4b] sm:text-[16px]">
                  {r.nama}
                </span>
                <span role="cell" className="flex">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[14px] font-bold leading-[1.3] ${STATUS[r.status].cls}`}
                  >
                    {STATUS[r.status].label}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Paling sering dipinjam */}
        <Card title="Paling sering dipinjam" href="/katalog" cta="Lihat katalog">
          <div role="table" aria-label="Paling sering dipinjam" className="flex flex-col gap-[6px]">
            <div role="row" className={`${popCols} gap-3 ${head}`}>
              <span role="columnheader">#</span>
              <span role="columnheader">Barang / ruang</span>
              <span role="columnheader" className="hidden sm:block">
                Kategori
              </span>
              <span role="columnheader" className="text-right">
                <span className="sm:hidden">Pinjam</span>
                <span className="hidden sm:inline">Minggu ini</span>
              </span>
            </div>
            {POPULER.map((p, i) => (
              <div key={p.nama} role="row" className={`${popCols} ${row} ${rowBg(i)}`}>
                <span role="cell" className="flex">
                  <span
                    className={`flex size-[30px] items-center justify-center rounded-full text-[14px] font-extrabold text-[#0d2a4b] ${RANK[i + 1] ?? ""}`}
                  >
                    {i + 1}
                  </span>
                </span>
                <span role="cell" className="min-w-0 text-[15px] font-bold leading-[1.3] text-[#0d2a4b] sm:text-[16px]">
                  {p.nama}
                </span>
                <span role="cell" className="hidden text-[16px] font-normal leading-[1.55] text-[#0d2a4b] sm:block">
                  {p.kategori}
                </span>
                <span role="cell" className="text-right text-[16px] font-extrabold leading-[1.3] text-[#0d2a4b]">
                  {p.jumlah}×
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}