"use client";

// app/components/home/hero.tsx  (SATU FILE: Hero + form cari + pita berjalan)
//
// Hero Beranda PinjamTEDI (Figma node 1:3069, desktop 1440px). Server component.
// Warna = hex persis Figma. Font = var(--font-lilita) / var(--font-jakarta) dari fonts.ts.
// Aset (export dari Figma, lihat catatan): public/img/hero/*.svg

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { UI_ICON_DEFAULTS, UI_ICONS } from "@/app/design/icon-map";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

const btn =
  "inline-flex h-[58px] items-center justify-center whitespace-nowrap rounded-2xl border-2 border-b-[6px] border-[#0d2a4b] px-[26px] text-[17px] font-extrabold leading-[1.2] text-[#0d2a4b] transition-[filter,transform] hover:brightness-95 active:translate-y-[3px] active:border-b-[3px]";

const CATEGORIES = [
  { value: "", label: "Semua kategori" },
  { value: "mikrokontroler", label: "Mikrokontroler" },
  { value: "perangkat-jaringan", label: "Perangkat jaringan" },
  { value: "alat-ukur", label: "Alat ukur" },
  { value: "ruang-diskusi", label: "Ruang diskusi" },
  { value: "kursi-pc-lab", label: "Kursi & PC Lab" },
  { value: "kamera-acara", label: "Kamera & acara" },
] as const;

function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const Chevron = UI_ICONS.dropdown;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (cat) p.set("kategori", cat);
    const s = p.toString();
    router.push(s ? `/katalog?${s}` : "/katalog");
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex w-full max-w-[580px] flex-wrap items-center gap-[10px] rounded-[20px] border-2 border-[#0d2a4b] bg-white p-[10px] shadow-[6px_6px_0_0_#1f4fd8] sm:flex-nowrap"
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari Arduino, ruang diskusi, kamera…"
        aria-label="Cari fasilitas"
        className="h-12 min-w-0 basis-full rounded-xl bg-transparent pl-[14px] text-[16px] leading-[1.55] text-[#2b3f57] outline-none placeholder:text-[#5b6f87] focus-visible:ring-2 focus-visible:ring-[#1f4fd8] sm:flex-1 sm:basis-0"
      />

      <div className="relative min-w-0 flex-1 sm:flex-none">
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Kategori"
          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-[#b9cfe2] bg-[#f3f9fe] pl-3 pr-9 text-[15px] leading-[1.5] text-[#0d2a4b] outline-none focus-visible:border-[#1f4fd8]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <Chevron
          {...UI_ICON_DEFAULTS}
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#0d2a4b]"
        />
      </div>

      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-[#1f4fd8] px-[22px] text-[16px] font-extrabold leading-[1.3] text-white transition-colors hover:bg-[#1a43b8]"
      >
        Cari
      </button>
    </form>
  );
}

const ITEMS = [
  "Arduino Uno",
  "Ruang Diskusi",
  "ESP32",
  "Proyektor Portabel",
  "PC Lab",
  "Multimeter",
  "Kamera",
  "Ruang Sidang",
  "Router Cisco",
] as const;

// diulang 2x per grup supaya grup selalu lebih lebar dari layar lebar (ultrawide)
const GROUP = [...ITEMS, ...ITEMS];

function Group({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10"
    >
      {GROUP.map((t, i) => (
        <li key={`${t}-${i}`} className="flex items-center gap-6 sm:gap-10">
          <span>{t}</span>
          <span aria-hidden className="font-normal">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Marquee() {
  return (
    <div
      role="region"
      aria-label="Fasilitas yang bisa dipinjam"
      className="pt-marquee overflow-hidden border-y-[3px] border-[#0d2a4b] bg-[#ffd43b] py-[10px] font-[family-name:var(--font-lilita,'Lilita_One')] text-[20px] leading-[1.05] text-[#0d2a4b] sm:py-[14px] sm:text-[26px]"
    >
      {/* keyframes ikut komponen: tidak perlu edit globals.css */}
      <style>{`
        @keyframes pt-marquee-move {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .pt-marquee-track {
          animation: pt-marquee-move 40s linear infinite;
          will-change: transform;
        }
        .pt-marquee:hover .pt-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .pt-marquee-track { animation: none; }
        }
      `}</style>

      <div className="pt-marquee-track flex w-max whitespace-nowrap">
        <Group />
        <Group hidden />
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <>
    <section className={`relative overflow-hidden bg-[#d7eefb] ${sans}`}>
      {/* Dekor (di belakang konten) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[88px] sm:top-[104px]">
        <Image
          src="/img/hero/cincin-kuning.svg"
          alt=""
          width={260}
          height={260}
          className="absolute -right-10 -top-8 size-[130px] sm:-right-14 sm:-top-10 sm:size-[190px] xl:-right-20 xl:-top-[60px] xl:size-[260px]"
        />
        <Image
          src="/img/hero/lengkung-ungu.svg"
          alt=""
          width={120}
          height={200}
          className="absolute -left-10 top-[140px] hidden h-[150px] w-[90px] md:block xl:-left-[50px] xl:h-[200px] xl:w-[120px]"
        />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[136px] lg:grid-cols-[minmax(0,620px)_minmax(0,560px)] lg:justify-between xl:px-20 xl:pb-20">
        {/* Teks */}
        <div className="flex w-full flex-col items-start gap-[22px]">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#0d2a4b] bg-white px-4 py-2 text-[12px] font-bold leading-[1.3] text-[#0d2a4b] sm:text-[14px]">
            <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-[#0d2a4b] bg-[#2ee6b0]" />
            Departemen Teknik Elektro dan Informatika
          </span>

          <h1
            className={`${display} text-[44px] font-normal leading-none tracking-[0.005em] text-[#0d2a4b] sm:text-[56px] xl:text-[80px]`}
            style={{ textShadow: "4px 4px 0 #fff" }}
          >
            Pinjam alat dan ruang DTEDI tanpa bolak-balik ke lab
          </h1>

          <p className="max-w-[560px] text-[17px] font-normal leading-[1.6] text-[#2b3f57] sm:text-[19px]">
            Cek stok Arduino, jadwal ruang diskusi, sampai kamera departemen dari satu tempat. Ajukan peminjaman, dan
            kalau perlu surat, kami buatkan otomatis.
          </p>

          <div className="flex flex-wrap gap-[14px]">
            <Link href="/katalog" className={`${btn} bg-[#f2862e]`}>
              Mulai pinjam
            </Link>
            <Link href="/cara-pinjam" className={`${btn} bg-[#ffd43b]`}>
              Lihat cara pinjam
            </Link>
          </div>

          <HeroSearch />
        </div>

        {/* Ilustrasi gedung DTEDI */}
        <div className="mx-auto w-full max-w-[400px] sm:max-w-[560px] lg:max-w-none">
          <Image
            src="/img/hero/gedung-dtedi.svg"
            alt="Ilustrasi gedung DTEDI dengan kartu peminjaman disetujui"
            width={560}
            height={500}
            preload
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
    <Marquee />
    </>
  );
}