// app/components/home/cara-pinjam.tsx
//
// Section "Empat langkah, dari cari sampai ambil" (Figma node 1:3262, desktop 1440px).
// Kartu navy + bayangan kuning, 4 kartu langkah, 3 level izin (Langsung / Verifikasi / Perlu surat).
// Tanpa aset gambar: nomor, label, garis semua dibuat dengan CSS. Server component.

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

const STEPS = [
  { no: 1, title: "Cari", desc: "Temukan alat atau ruang lewat pencarian dan filter.", tone: "bg-[#ffd43b]" },
  { no: 2, title: "Pilih jadwal", desc: "Slot jam untuk ruang, tanggal ambil dan kembali untuk alat.", tone: "bg-[#2ee6b0]" },
  { no: 3, title: "Ajukan", desc: "Isi keperluanmu. Kalau butuh surat, PDF-nya dibuat otomatis.", tone: "bg-[#6c98ff]" },
  { no: 4, title: "Ambil", desc: "Tunjukkan kode QR dan KTM ke pengelola saat mengambil.", tone: "bg-[#f2862e]" },
] as const;

const LEVELS = [
  { label: "Langsung", desc: "Barang kecil seperti converter dan clicker. Isi form, langsung ambil.", pill: "bg-[#c8f7e6] text-[#0b5c43]" },
  { label: "Verifikasi", desc: "Kit praktikum dan ruang diskusi. Dicek dulu oleh pengelola.", pill: "bg-[#fff1c7] text-[#6e4a00]" },
  { label: "Perlu surat", desc: "Kamera, alat ukur mahal, ruang acara. Butuh tanda tangan dosen atau pembina.", pill: "bg-[#ffe2cf] text-[#8e360a]" },
] as const;

export default function CaraPinjam() {
  return (
    <section id="cara-singkat" className={`bg-white px-5 pb-14 pt-4 sm:px-8 sm:pb-16 xl:px-[110px] xl:pb-24 ${sans}`}>
      <div className="mx-auto max-w-[1220px] rounded-[24px] border-2 border-[#0d2a4b] bg-[#0d2a4b] px-5 py-9 shadow-[6px_6px_0_0_#ffd43b] sm:rounded-[32px] sm:px-8 sm:py-12 sm:shadow-[10px_10px_0_0_#ffd43b] xl:px-12 xl:py-14">
        {/* Kepala */}
        <div className="flex flex-col gap-3">
          <h2 className={`${display} text-[32px] font-normal leading-none text-white sm:text-[42px] xl:text-[52px]`}>
            Empat langkah, dari cari sampai ambil
          </h2>
          <p className="text-[16px] font-normal leading-[1.6] text-[#d3e3f2] sm:text-[19px]">
            Status pengajuanmu selalu kelihatan, jadi kamu tahu harus menunggu apa.
          </p>
        </div>

        {/* Langkah */}
        <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:mt-10 xl:grid-cols-4 xl:items-start">
          {STEPS.map((s) => (
            <li
              key={s.no}
              className="flex flex-col items-start gap-[10px] rounded-[20px] border-2 border-[#2b5182] bg-[#163a63] p-5 sm:p-6"
            >
              <span
                aria-hidden
                className={`${display} flex size-12 items-center justify-center rounded-[14px] text-[24px] leading-[1.05] text-[#0d2a4b] ${s.tone}`}
              >
                {s.no}
              </span>
              <h3 className="text-[20px] font-bold leading-[1.3] text-white">{s.title}</h3>
              <p className="text-[16px] font-normal leading-[1.55] text-[#d3e3f2]">{s.desc}</p>
            </li>
          ))}
        </ol>

        {/* Level izin */}
        <ul className="mt-8 grid grid-cols-1 gap-5 border-t border-[#2b5182] pt-[22px] lg:grid-cols-3 lg:gap-4 xl:mt-10">
          {LEVELS.map((l) => (
            <li key={l.label} className="flex items-start gap-3">
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-[5px] text-[14px] font-bold leading-[1.3] ${l.pill}`}
              >
                {l.label}
              </span>
              <p className="min-w-0 flex-1 text-[15px] font-normal leading-[1.5] text-[#d3e3f2]">{l.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}