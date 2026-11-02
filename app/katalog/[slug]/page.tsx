// app/katalog/[slug]/page.tsx
//
// Halaman Detail fasilitas (Figma "03 Detail – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:722).
// SATU halaman untuk semua barang: isi diambil dari app/data/fasilitas.ts berdasarkan slug.
// Langkah 2 dari alur 5 langkah. "Pilih jadwal" lanjut ke /katalog/[slug]/jadwal. Server component.

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FACILITY_ILLUSTRATIONS, UI_ICONS } from "@/app/design/icon-map";
import Stepper from "@/app/components/layout/stepper";
import { FASILITAS, IZIN_NOTE, STATUS, getFasilitas } from "@/app/data/fasilitas";
import { OG_DASAR } from "@/app/data/situs";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

type Params = { slug: string };

export function generateStaticParams() {
  return FASILITAS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const f = getFasilitas((await params).slug);
  if (!f) return { title: "Fasilitas" };
  const url = `/katalog/${f.slug}`;
  return {
    title: f.name,
    description: f.long ?? f.desc,
    alternates: { canonical: url },
    openGraph: { ...OG_DASAR, title: f.name, description: f.desc, url },
  };
}

const btn =
  "inline-flex items-center justify-center whitespace-nowrap rounded-[14px] border-2 border-[#0d2a4b] px-[22px] py-[11px] text-[17px] leading-[1.2] shadow-[0_4px_0_0_#0d2a4b] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_2px_0_0_#0d2a4b]";

export default async function DetailFasilitasPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const f = getFasilitas(slug);
  if (!f) notFound();

  const Sep = UI_ICONS.breadcrumbSeparator;
  const s = STATUS[f.status];
  const note = IZIN_NOTE[f.izin];
  const noteBox = STATUS[f.izin].box;

  return (
    <main className={`min-h-screen bg-[#d7eefb] px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20 ${sans}`}>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-[#5b6f87]">
          <Link href="/" className="hover:text-[#0d2a4b] hover:underline">
            Beranda
          </Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <Link href="/katalog" className="hover:text-[#0d2a4b] hover:underline">
            Katalog
          </Link>
          <Sep size={14} strokeWidth={2.5} aria-hidden />
          <span aria-current="page">{f.name}</span>
        </nav>

        <Stepper active={2} />

        <div className="mt-1 flex flex-col gap-8 lg:flex-row xl:gap-11">
          {/* Panel ilustrasi */}
          <div className="flex h-[260px] w-full shrink-0 items-center justify-center rounded-[22px] border-2 border-[#0d2a4b] bg-[#ffd43b] p-8 shadow-[5px_5px_0_0_#5b3bb5] sm:h-[340px] sm:shadow-[7px_7px_0_0_#5b3bb5] lg:h-[400px] lg:w-[420px] xl:w-[520px]">
            <Image
              src={FACILITY_ILLUSTRATIONS[f.img]}
              alt={f.name}
              width={260}
              height={260}
              preload
              className="size-[180px] sm:size-[240px] xl:size-[260px]"
            />
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[14px]">
            <span className="text-[13px] font-extrabold uppercase leading-none text-[#5b3bb5]">{f.group}</span>
            <h1 className={`${display} text-[40px] font-normal leading-none text-[#0d2a4b] sm:text-[48px] xl:text-[54px]`}>
              {f.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-[#0d2a4b] px-[11px] py-[3px] text-[12.5px] font-extrabold leading-none ${s.box} ${s.text}`}
              >
                <span aria-hidden className={`size-2 rounded-full ${s.dot}`} />
                {s.label}
              </span>
              <span className="text-[14px] font-bold text-[#5b6f87]">{f.tersedia}</span>
            </div>

            <p className="text-[16px] font-normal leading-[26px] text-[#2b3f57] sm:text-[17px]">{f.long ?? f.desc}</p>

            {/* Spesifikasi */}
            <dl className="w-full overflow-hidden rounded-2xl border-2 border-[#0d2a4b] bg-white text-[14px]">
              {f.rows.map(([label, value], i) => (
                <div key={label} className={`flex gap-4 px-4 py-[10px] ${i % 2 === 0 ? "bg-[#fff4c2]" : "bg-white"}`}>
                  <dt className="w-[104px] shrink-0 font-extrabold text-[#0d2a4b] sm:w-[130px]">{label}</dt>
                  <dd className="min-w-0 flex-1 text-[#2b3f57]">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Catatan izin */}
            <div className={`flex w-full flex-col gap-1 rounded-2xl border-2 border-[#0d2a4b] p-[14px] text-[14px] sm:flex-row sm:items-center sm:gap-[10px] ${noteBox}`}>
              <span className="shrink-0 font-extrabold text-[#0d2a4b]">{note.title}</span>
              <span className="text-[#2b3f57]">{note.text}</span>
            </div>

            {/* Aksi */}
            <div className="flex flex-wrap gap-[14px]">
              <Link href={`/katalog/${f.slug}/jadwal`} className={`${btn} ${display} bg-[#f2862e] text-[#0d2a4b]`}>
                Pilih jadwal
              </Link>
              <Link href="/katalog" className={`${btn} ${display} bg-white text-[#0d2a4b]`}>
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}