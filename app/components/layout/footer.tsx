// src/components/layout/Footer.tsx
//
// Footer Beranda PinjamTEDI (Figma node 1:2982, desktop 1440px).
// Meja/rak (papan + kaki) dibuat dengan kode di <ShelfTable />.
// Warna = hex persis dari Figma, jadi tidak bergantung pada colors.css.
// Font  = Lilita One (judul) dan Plus Jakarta Sans (isi) lewat variabel next/font
//         (--font-lilita, --font-jakarta dari fonts.ts), dengan fallback nama font.
//
// Client component: rak (Shelf) dan tombol "Kembali ke atas" hanya tampil di Beranda ("/").

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BRAND_ICONS,
  FOOTER_SOCIALS,
  FOOTER_STRIP_ILLUSTRATIONS,
  UI_ICON_DEFAULTS,
  UI_ICONS,
} from "@/app/design/icon-map";

/* Placeholder persis dari Figma ("[Jam layanan peminjaman]", "[nomor kontak]"). Isi sebelum rilis. */
const CONTACT = {
  address: "Jl. Yacaranda, Sekip Unit III, Yogyakarta 55281",
  hours: "[Jam layanan peminjaman]",
  helpdesk: "Help desk: [nomor kontak]",
} as const;

const SOCIAL_LINKS: Record<(typeof FOOTER_SOCIALS)[number], string> = {
  instagram: "#",
  youtube: "#",
  tiktok: "#",
  x: "#",
  linkedin: "#",
};

const LINK_COLUMNS = [
  {
    title: "Jelajahi",
    links: [
      { label: "Beranda", href: "/" },
      { label: "Katalog", href: "/katalog" },
      { label: "Jadwal Ruang", href: "/jadwal" },
      { label: "Cara Pinjam", href: "/cara-pinjam" },
    ],
  },
  {
    title: "Peminjaman",
    links: [
      { label: "Pengajuan Saya", href: "/pengajuan-saya" },
      { label: "Riwayat Peminjaman", href: "/riwayat" },
      { label: "Pengembalian", href: "/pengembalian" },
      { label: "Notifikasi", href: "/notifikasi" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Panduan Peminjaman", href: "/panduan" },
      { label: "Contoh Surat", href: "/contoh-surat" },
      { label: "Pertanyaan Umum", href: "/faq" },
      { label: "Lapor Kendala", href: "/lapor" },
    ],
  },
] as const;

/* Area rak di Figma: 1220px (1440 - 2×110). Semua ukuran meja diskalakan terhadap angka ini. */
const SHELF_DESKTOP = 1220;
const SHELF_GAP = 34;

/**
 * Meja (rak) Figma "Rak barang":
 *  - Papan : tinggi 16, radius 8, border navy 3, isi kuning #FFD43B, lebar penuh.
 *  - Kaki  : 2 balok navy 14×26, jarak dari tepi 60px (= 4,9% lebar rak).
 * Ukuran mengecil mengikuti lebar rak lewat container query (cqw).
 * Harus dirender DI DALAM elemen `@container`.
 */
function ShelfTable() {
  return (
    <>
      {/* papan meja */}
      <div
        className="w-full rounded-lg border-2 border-[#0d2a4b] bg-[#ffd43b] md:border-[3px]"
        style={{ height: "min(16px, max(10px, 1.31cqw))" }}
      />
      {/* kaki meja: menempel ke footer navy di bawahnya */}
      <div className="flex justify-between" style={{ paddingInline: "4.9cqw" }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-[#0d2a4b]"
            style={{
              width: "min(14px, max(8px, 1.15cqw))",
              height: "min(26px, max(14px, 2.13cqw))",
            }}
          />
        ))}
      </div>
    </>
  );
}

function Shelf() {
  const all = FOOTER_STRIP_ILLUSTRATIONS;
  const mobileItems = all.filter((i) => i.mobile);
  // lebar acuan (px): semua item (md+) vs. item mobile saja → dipakai untuk skala
  const baseAll = all.reduce((s, i) => s + i.size, 0) + SHELF_GAP * (all.length - 1);
  const baseMobile = mobileItems.reduce((s, i) => s + i.size, 0) + SHELF_GAP * (mobileItems.length - 1);

  return (
    <div
      aria-hidden
      className="bg-white px-5 pt-8 sm:px-8 md:pt-12 xl:px-[110px]"
      style={{ "--base": baseMobile, "--base-md": baseAll } as React.CSSProperties}
    >
      {/* area rak = container query */}
      <div className="@container mx-auto" style={{ maxWidth: SHELF_DESKTOP }}>
        {/* barang di atas meja */}
        <div
          className="flex items-end justify-center [--b:var(--base)] md:[--b:var(--base-md)]"
          style={{ gap: `min(${SHELF_GAP}px, calc(${SHELF_GAP} / var(--b) * 100cqw))` }}
        >
          {all.map((item) => (
            <Image
              key={item.key}
              src={item.src}
              alt=""
              width={120}
              height={120}
              className={item.mobile ? "" : "max-md:hidden"}
              style={{
                width: `min(${item.size}px, calc(${item.size} / var(--b) * 100cqw))`,
                height: "auto",
              }}
            />
          ))}
        </div>

        <ShelfTable />
      </div>
    </div>
  );
}

export default function Footer() {
  const isHome = usePathname() === "/";
  const BackIcon = UI_ICONS.backToTop;
  const Location = UI_ICONS.location;
  const Hours = UI_ICONS.hours;
  const Phone = UI_ICONS.phone;

  return (
    <footer className="bg-[#0d2a4b] font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')] text-[#d3e3f2]">
      {isHome && <Shelf />}

      {/* Isi */}
      <div className="flex flex-col gap-12 px-5 pb-12 pt-12 sm:px-8 md:pt-16 xl:flex-row xl:justify-between xl:px-[110px]">
        {/* Identitas */}
        <div className="flex w-full max-w-[480px] flex-col gap-[22px]">
          <p className="font-[family-name:var(--font-lilita,'Lilita_One')] text-[44px] font-normal leading-none text-white sm:text-[60px]">
            PinjamTEDI
          </p>

          <p className="text-[17px] font-normal leading-[1.6] sm:text-[19px]">
            Peminjaman alat dan ruang
            <br />
            Departemen Teknik Elektro dan Informatika
            <br />
            Sekolah Vokasi Universitas Gadjah Mada
          </p>

          <ul className="flex flex-col gap-[14px] text-[16px] font-normal leading-[1.55]">
            <li className="flex items-start gap-[14px]">
              <Location {...UI_ICON_DEFAULTS} size={24} aria-hidden className="mt-px shrink-0 text-[#ffd43b]" />
              <span>{CONTACT.address}</span>
            </li>
            <li className="flex items-start gap-[14px]">
              <Hours {...UI_ICON_DEFAULTS} size={24} aria-hidden className="mt-px shrink-0 text-[#ffd43b]" />
              <span>{CONTACT.hours}</span>
            </li>
            <li className="flex items-start gap-[14px]">
              <Phone {...UI_ICON_DEFAULTS} size={24} aria-hidden className="mt-px shrink-0 text-[#ffd43b]" />
              <span>{CONTACT.helpdesk}</span>
            </li>
          </ul>

          <ul className="flex flex-wrap gap-3 pt-2" aria-label="Media sosial">
            {FOOTER_SOCIALS.map((name) => {
              const icon = BRAND_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={SOCIAL_LINKS[name]}
                    aria-label={icon.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-[54px] items-center justify-center rounded-[14px] border-b-[5px] border-[#12358f] bg-[#1f4fd8] transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:border-b-2"
                  >
                    <Image src={icon.src} alt="" width={24} height={24} className="size-6" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Tautan */}
        <nav
          aria-label="Tautan footer"
          className="grid grid-cols-2 gap-x-8 gap-y-10 pt-3 sm:grid-cols-3 md:gap-x-14 xl:flex xl:gap-14"
        >
          {LINK_COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4 whitespace-nowrap">
              <p className="text-[19px] font-extrabold leading-[1.3] text-[#ffd43b]">{col.title}</p>
              <ul className="flex flex-col gap-4">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[16px] font-normal leading-[1.55] transition-colors hover:text-white hover:underline"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Hak cipta */}
      <div className="px-5 pb-9 sm:px-8 xl:px-[110px]">
        <div className="h-[2px] w-full bg-[#2b5182]" />
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-normal leading-[1.5]">
            © 2026 PinjamTEDI. Prototipe untuk ORBIT Repository 2026, Branch Developer. Semua data bersifat simulasi.
          </p>
          {isHome && (
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#ffd43b] px-4 py-[10px] text-[16px] font-extrabold leading-[1.3] text-[#0d2a4b] transition-[filter] hover:brightness-95"
            >
              Kembali ke atas
              <BackIcon {...UI_ICON_DEFAULTS} size={20} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}