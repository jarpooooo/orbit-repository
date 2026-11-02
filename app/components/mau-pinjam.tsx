// app/components/home/mau-pinjam.tsx
//
// Section "Mau pinjam apa hari ini?" (Figma node 1:3241, desktop 1440px).
// 6 kartu kategori + chip filter (Semua / Hardware / Ruang / Logistik).
// Isi kartu ada di CATEGORIES di bawah: edit di sana kalau data berubah.
// Ilustrasi: CATEGORY_ILLUSTRATIONS dari icon-map (public/img/illustrations/cat-*.svg).

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_ILLUSTRATIONS, UI_ICONS, type CategoryIllustrationKey } from "@/app/design/icon-map";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

type Tag = "Hardware" | "Ruang" | "Logistik";
type Tone = "kuning" | "mint" | "periwinkle";

const TONE: Record<Tone, string> = {
  kuning: "bg-[#ffd43b]",
  mint: "bg-[#2ee6b0]",
  periwinkle: "bg-[#6c98ff]",
};

const CATEGORIES: readonly {
  key: CategoryIllustrationKey;
  title: string;
  desc: string;
  tag: Tag;
  tone: Tone;
}[] = [
  { key: "mikrokontroler", title: "Mikro-kontroler", desc: "Arduino, ESP32, Raspberry Pi.", tag: "Hardware", tone: "kuning" },
  { key: "perangkat-jaringan", title: "Perangkat jaringan", desc: "Router, switch, access point, LAN tester", tag: "Hardware", tone: "mint" },
  { key: "alat-ukur", title: "Alat ukur", desc: "Multimeter, oscilloscope, solder station", tag: "Hardware", tone: "periwinkle" },
  { key: "ruang-diskusi", title: "Ruang diskusi", desc: "Ruang diskusi, ruang sidang, kelas kosong", tag: "Ruang", tone: "kuning" },
  { key: "kursi", title: "Kursi PC lab", desc: "PC spek tinggi di luar jam praktikum", tag: "Ruang", tone: "mint" },
  { key: "kamera", title: "Kamera dan acara", desc: "Kamera, tripod, proyektor, HT, mic", tag: "Logistik", tone: "periwinkle" },
];

const FILTERS = ["Semua", "Hardware", "Ruang", "Logistik"] as const;
type Filter = (typeof FILTERS)[number];

export default function MauPinjam() {
  const [filter, setFilter] = useState<Filter>("Semua");
  const GoTo = UI_ICONS.goTo;
  const items = CATEGORIES.filter((c) => filter === "Semua" || c.tag === filter);

  return (
    <section
      id="mau-pinjam"
      className={`rounded-t-[32px] border-t-[3px] border-[#0d2a4b] bg-white px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16 md:rounded-t-[48px] xl:px-[110px] xl:pb-[91px] xl:pt-[94px] ${sans}`}
    >
      <div className="mx-auto max-w-[1220px]">
        {/* Kepala */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-[10px]">
            <h2
              className={`${display} text-[34px] font-normal leading-none text-[#0d2a4b] sm:text-[42px] xl:text-[52px]`}
            >
              Mau pinjam apa hari ini?
            </h2>
            <p className="max-w-[479px] text-[16px] font-normal leading-[1.6] text-[#2b3f57] sm:text-[19px]">
              Pilih jenisnya dulu, nanti kamu lihat stok dan jadwalnya.
            </p>
          </div>

          <div role="group" aria-label="Filter kategori" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={[
                    "h-11 rounded-full border-2 border-[#0d2a4b] px-[18px] text-[16px] font-bold leading-[1.3] transition-colors",
                    active ? "bg-[#0d2a4b] text-white" : "bg-white text-[#0d2a4b] hover:bg-[#fff7da]",
                  ].join(" ")}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid kartu */}
        <ul className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 xl:mt-10 xl:grid-cols-3">
          {items.map((c) => (
            <li key={c.key} className="min-w-0">
              <Link
                href={`/katalog?kategori=${c.key}`}
                className="group flex h-full min-h-[200px] overflow-hidden rounded-[22px] border-2 border-[#0d2a4b] bg-[#fff7da] shadow-[5px_5px_0_0_#5b3bb5] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f4fd8] sm:min-h-[230px] sm:shadow-[8px_8px_0_0_#5b3bb5]"
              >
                {/* kotak ilustrasi */}
                <div
                  className={`flex w-[116px] shrink-0 items-center justify-center border-r-2 border-[#0d2a4b] sm:w-[160px] ${TONE[c.tone]}`}
                >
                  <Image
                    src={CATEGORY_ILLUSTRATIONS[c.key]}
                    alt=""
                    width={120}
                    height={120}
                    className="size-[84px] sm:size-[120px]"
                  />
                </div>

                {/* isi */}
                <div className="flex min-w-0 flex-1 flex-col items-start gap-[14px] p-4 sm:p-[22px]">
                  <div className="flex w-full items-start gap-[10px]">
                    <h3
                      className={`${display} min-w-0 flex-1 break-words text-[22px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[26px]`}
                    >
                      {c.title}
                    </h3>
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#1f4fd8] text-white transition-colors group-hover:bg-[#1a43b8] sm:size-[46px]"
                    >
                      <GoTo size={20} strokeWidth={2.5} />
                    </span>
                  </div>

                  <p className="w-full border-b-[1.5px] border-[#e6d6a0] pb-[14px] text-[14px] font-normal leading-[1.5] text-[#2b3f57] sm:text-[15px]">
                    {c.desc}
                  </p>

                  <span className="rounded-[10px] border-2 border-[#0d2a4b] px-[14px] py-[7px] text-[14px] font-bold leading-[1.3] text-[#0d2a4b]">
                    {c.tag}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}