// app/components/katalog/katalog-fasilitas.tsx  (dipakai app/katalog/page.tsx)
//
// Halaman "Katalog fasilitas" (Figma 02 Katalog – Semua / Hardware / Ruang / Logistik, node 1:205).
// Satu komponen untuk 4 frame: chip Semua / Hardware / Ruang / Logistik menyaring kartu.
// Juga membaca ?q= (dari navbar / hero) dan ?kategori= (dari kartu "Mau pinjam apa hari ini?").
// Ilustrasi: FACILITY_ILLUSTRATIONS dari icon-map (public/img/illustrations/*.svg).
// Client component: ?q= dan ?kategori= dibaca di server page lalu dikirim lewat props.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICON_DEFAULTS, UI_ICONS, type FacilityKey } from "@/app/design/icon-map";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

/* -------------------------------- data -------------------------------- */

type Group = "Hardware" | "Ruang" | "Logistik";
type StatusKey = "verifikasi" | "surat" | "dipinjam" | "langsung";

const STATUS: Record<StatusKey, { label: string; box: string; text: string; dot: string }> = {
  verifikasi: { label: "Verifikasi", box: "bg-[#fff4c2]", text: "text-[#6e4a00]", dot: "bg-[#6e4a00]" },
  surat: { label: "Perlu surat", box: "bg-[#ffe0c7]", text: "text-[#8e360a]", dot: "bg-[#8e360a]" },
  dipinjam: { label: "Sedang dipinjam", box: "bg-[#e3e8ee]", text: "text-[#3b4a5c]", dot: "bg-[#3b4a5c]" },
  langsung: { label: "Langsung", box: "bg-[#c9f7e6]", text: "text-[#0b5c43]", dot: "bg-[#0b5c43]" },
};

type Item = {
  slug: string;
  img: FacilityKey;
  name: string;
  group: Group;
  /** sub-kategori (sama dengan key kartu di Beranda) */
  sub: string;
  desc: string;
  status: StatusKey;
  /** teks kecil di samping status, mis. "6 unit". Kosong kalau tidak ada. */
  meta?: string;
};

// Data simulasi dari Figma. Ganti dari API nanti.
const ITEMS: readonly Item[] = [
  { slug: "kit-esp32", img: "kit-esp32", name: "Kit ESP32", group: "Hardware", sub: "mikrokontroler", desc: "Paket pengembangan IoT lengkap dengan breadboard, kabel jumper, dan sensor dasar.", status: "verifikasi", meta: "6 unit" },
  { slug: "multimeter-digital", img: "multimeter-digital", name: "Multimeter Digital", group: "Hardware", sub: "alat-ukur", desc: "Alat ukur tegangan, arus, dan hambatan untuk praktikum dan proyek akhir.", status: "surat", meta: "2 unit" },
  { slug: "arduino-uno-r3", img: "arduino-uno-r3", name: "Arduino Uno R3", group: "Hardware", sub: "mikrokontroler", desc: "Kembali Sen 26 Okt", status: "dipinjam" },
  { slug: "ruang-diskusi-a", img: "ruang-diskusi-a", name: "Ruang Diskusi A", group: "Ruang", sub: "ruang-diskusi", desc: "Ruang kecil ber-AC dengan papan tulis untuk kerja kelompok dan bimbingan.", status: "verifikasi", meta: "10 orang" },
  { slug: "ruang-sidang", img: "ruang-sidang", name: "Ruang Sidang", group: "Ruang", sub: "ruang-diskusi", desc: "Ruang formal untuk sidang, seminar proposal, dan rapat himpunan.", status: "surat", meta: "20 orang" },
  { slug: "pc-lab-rpl", img: "pc-lab-rpl", name: "PC Lab RPL", group: "Ruang", sub: "kursi-pc-lab", desc: "Dipakai kelas sampai Kam 29 Okt", status: "dipinjam", meta: "30 orang" },
  { slug: "converter-hdmi", img: "converter-hdmi", name: "Converter HDMI", group: "Logistik", sub: "kamera-acara", desc: "Adaptor HDMI ke VGA dan USB-C untuk presentasi di ruang mana pun.", status: "langsung", meta: "12 unit" },
  { slug: "kamera-mirrorless", img: "kamera-mirrorless", name: "Kamera Mirrorless", group: "Logistik", sub: "kamera-acara", desc: "Kamera untuk dokumentasi kegiatan himpunan dan proyek video.", status: "surat", meta: "1 unit" },
  { slug: "proyektor-portabel", img: "proyektor-portabel", name: "Proyektor Portabel", group: "Logistik", sub: "kamera-acara", desc: "Kembali Rab 28 Okt", status: "dipinjam" },
];

const FILTERS = ["Semua", "Hardware", "Ruang", "Logistik"] as const;
type Filter = (typeof FILTERS)[number];

/** ?kategori= bisa berisi nama grup (hardware) atau sub-kategori dari kartu Beranda (mikrokontroler). */
const SUB_TO_GROUP: Record<string, Group> = {
  mikrokontroler: "Hardware",
  "perangkat-jaringan": "Hardware",
  "alat-ukur": "Hardware",
  "ruang-diskusi": "Ruang",
  "kursi-pc-lab": "Ruang",
  "kamera-acara": "Logistik",
};
const SUB_LABEL: Record<string, string> = {
  mikrokontroler: "Mikro-kontroler",
  "perangkat-jaringan": "Perangkat jaringan",
  "alat-ukur": "Alat ukur",
  "ruang-diskusi": "Ruang diskusi",
  "kursi-pc-lab": "Kursi PC lab",
  "kamera-acara": "Kamera dan acara",
};

function resolveKategori(k?: string): { filter: Filter; sub: string | null } {
  const key = (k ?? "").toLowerCase();
  const g = FILTERS.find((f) => f.toLowerCase() === key);
  if (g) return { filter: g, sub: null };
  if (key in SUB_TO_GROUP) return { filter: SUB_TO_GROUP[key], sub: key };
  return { filter: "Semua", sub: null };
}

/* ------------------------------- komponen ------------------------------- */

function Kartu({ item }: { item: Item }) {
  const s = STATUS[item.status];
  const off = item.status === "dipinjam";
  return (
    <li className="min-w-0">
      <Link
        href={`/katalog/${item.slug}`}
        className={[
          "flex h-full overflow-hidden rounded-[20px] border-2 border-[#0d2a4b] bg-[#fff7da] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f4fd8]",
          off ? "shadow-[4px_4px_0_0_#2b5182] sm:shadow-[6px_6px_0_0_#2b5182]" : "shadow-[4px_4px_0_0_#5b3bb5] sm:shadow-[6px_6px_0_0_#5b3bb5]",
        ].join(" ")}
      >
        {/* panel ilustrasi */}
        {/* pudar hanya di warna latar + gambar; garis pemisah tetap navy penuh */}
        <div
          className={`flex w-[104px] shrink-0 items-center justify-center border-r-2 border-[#0d2a4b] p-[10px] sm:w-[152px] sm:p-[14px] ${off ? "bg-[#ffd43b]/60" : "bg-[#ffd43b]"}`}
        >
          <Image
            src={FACILITY_ILLUSTRATIONS[item.img]}
            alt=""
            width={100}
            height={100}
            className={`size-[72px] sm:size-[100px] ${off ? "opacity-60" : ""}`}
          />
        </div>

        {/* isi */}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 p-4">
          <span className="text-[12px] font-extrabold uppercase leading-none text-[#5b3bb5]">{item.group}</span>
          <h3 className={`${display} text-[20px] font-normal leading-[1.1] text-[#0d2a4b] sm:text-[22px]`}>{item.name}</h3>
          <p className="text-[14px] font-normal leading-[21px] text-[#2b3f57]">{item.desc}</p>
          <div className="flex flex-wrap items-center gap-x-[10px] gap-y-2">
            <span
              className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold leading-none ${s.box} ${s.text}`}
            >
              <span aria-hidden className={`size-2 rounded-full ${s.dot}`} />
              {s.label}
            </span>
            {item.meta && <span className="whitespace-nowrap text-[13px] font-bold text-[#5b6f87]">{item.meta}</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}

type Props = {
  /** dari ?q= */
  initialQuery?: string;
  /** dari ?kategori= (hardware | ruang | logistik | mikrokontroler | ...) */
  initialKategori?: string;
};

export default function KatalogFasilitas({ initialQuery = "", initialKategori }: Props) {
  const start = resolveKategori(initialKategori);
  const [q, setQ] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(start.filter);
  const [sub, setSub] = useState<string | null>(start.sub);

  const Search = UI_ICONS.search;
  const Sep = UI_ICONS.breadcrumbSeparator;

  const counts = useMemo(
    () => ({
      Semua: ITEMS.length,
      Hardware: ITEMS.filter((i) => i.group === "Hardware").length,
      Ruang: ITEMS.filter((i) => i.group === "Ruang").length,
      Logistik: ITEMS.filter((i) => i.group === "Logistik").length,
    }),
    [],
  );

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ITEMS.filter(
      (i) =>
        (filter === "Semua" || i.group === filter) &&
        (!sub || i.sub === sub) &&
        (!term || `${i.name} ${i.desc} ${i.group}`.toLowerCase().includes(term)),
    );
  }, [q, filter, sub]);

  // jaga URL tetap bisa dibagikan, tanpa memicu navigasi
  const syncUrl = (nextQ: string, nextFilter: Filter, nextSub: string | null) => {
    const p = new URLSearchParams();
    if (nextQ.trim()) p.set("q", nextQ.trim());
    const kat = nextSub ?? (nextFilter === "Semua" ? "" : nextFilter.toLowerCase());
    if (kat) p.set("kategori", kat);
    const s = p.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
  };

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-[72px] ${sans}`}>
      <div className="mx-auto max-w-[1160px]">
        {/* Kepala */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">
            Beranda
          </Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">Katalog</span>
        </nav>

        <h1 className={`${display} mt-[18px] text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[56px]`}>
          Katalog fasilitas
        </h1>
        <p className="mt-[18px] text-[16px] font-normal leading-[1.5] text-[#2b3f57] sm:text-[18px]">
          Pilih ruang atau alat yang kamu butuhkan.
        </p>

        {/* Toolbar */}
        <div className="mt-[18px] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex h-[46px] w-full items-center gap-2 rounded-[14px] border-2 border-[#0d2a4b] bg-white px-4 focus-within:border-[#1f4fd8] lg:max-w-[420px]"
          >
            <Search {...UI_ICON_DEFAULTS} size={18} aria-hidden className="shrink-0 text-[#5b6f87]" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                syncUrl(e.target.value, filter, sub);
              }}
              placeholder="Cari nama atau lokasi"
              aria-label="Cari fasilitas"
              className="w-full bg-transparent text-[15px] text-[#0d2a4b] outline-none placeholder:text-[#5b6f87]"
            />
          </form>

          <div role="group" aria-label="Filter kategori" className="flex flex-wrap gap-[14px]">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilter(f);
                    setSub(null);
                    syncUrl(q, f, null);
                  }}
                  className={[
                    "inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-[#0d2a4b] px-[18px] py-2 transition-colors",
                    active ? "bg-[#ffd43b] shadow-[0_3px_0_0_#0d2a4b]" : "bg-white hover:bg-[#fff7da]",
                  ].join(" ")}
                >
                  <span className="text-[15px] font-extrabold leading-none text-[#0d2a4b]">{f}</span>
                  <span className="text-[13px] font-bold leading-none text-[#5b6f87]">{counts[f]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter sub-kategori dari Beranda */}
        {sub && (
          <p className="mt-4 text-[14px] font-bold text-[#2b3f57]">
            Kategori: {SUB_LABEL[sub] ?? sub}{" "}
            <button
              type="button"
              onClick={() => {
                setSub(null);
                syncUrl(q, filter, null);
              }}
              className="ml-1 text-[#1f4fd8] underline underline-offset-2"
            >
              Hapus
            </button>
          </p>
        )}

        {/* Grid kartu */}
        {shown.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-[22px] lg:grid-cols-2 lg:gap-[26px] xl:mt-10">
            {shown.map((i) => (
              <Kartu key={i.slug} item={i} />
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[20px] border-2 border-dashed border-[#0d2a4b] bg-white/60 p-8 text-center xl:mt-10">
            <p className={`${display} text-[24px] leading-[1.1] text-[#0d2a4b]`}>Belum ada yang cocok</p>
            <p className="mt-2 text-[15px] text-[#2b3f57]">Coba kata kunci lain atau pilih kategori Semua.</p>
          </div>
        )}
      </div>
    </main>
  );
}
