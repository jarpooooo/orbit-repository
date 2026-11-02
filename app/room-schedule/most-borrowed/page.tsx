// app/room-schedule/most-borrowed/page.tsx
// Route: /room-schedule/most-borrowed
//
// "10 Paling sering dipinjam" (Figma node 8:1840): podium for ranks 1–3 + list for ranks 4–9.
//  - Period filter: Minggu ini / Bulan ini / Semester. "Minggu ini" numbers are exactly Figma;
//    Bulan & Semester = SIMULATION (this week's numbers × 4 and × 13).
//  - Bar width = count / count of rank 1 (in Figma 9× = 50% of 18×).
//  - Rows 4–9: the "Pinjam" button appears on hover/focus (always visible on small screens).
//  - The permission badge comes from the `permission` field in facilities.ts.
// Static data, not persisted yet.
// Text: ROOM_SCHEDULE_TEXT.mostBorrowed (app/i18n/room-schedule.ts); facility content via localizeFacility.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FACILITY_ILLUSTRATIONS } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import StatusBadge from "@/app/components/ui/status-badge";
import { withFacilities } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { ROOM_SCHEDULE_TEXT, type PeriodKey } from "@/app/i18n/room-schedule";
import { useLocale } from "@/app/components/layout/language";

/** Period chips (labels in ROOM_SCHEDULE_TEXT.mostBorrowed.periods). */
const PERIODS: readonly { key: PeriodKey; multiplier: number }[] = [
  { key: "week", multiplier: 1 },
  { key: "month", multiplier: 4 },
  { key: "semester", multiplier: 13 },
];

/** Times borrowed "Minggu ini" (Figma). Already sorted from most to least. */
const RANKING = withFacilities([
  { slug: "kit-esp32", count: 18 },
  { slug: "converter-hdmi", count: 15 },
  { slug: "ruang-diskusi-a", count: 12 },
  { slug: "multimeter-digital", count: 9 },
  { slug: "ruang-sidang", count: 8 },
  { slug: "kamera-mirrorless", count: 6 },
  { slug: "pc-lab-rpl", count: 5 },
  { slug: "arduino-uno-r3", count: 4 },
  { slug: "proyektor-portabel", count: 3 },
]);
type RankedItem = (typeof RANKING)[number];

const PODIUM = RANKING.slice(0, 3);
const REST = RANKING.slice(3);
const TOP_COUNT = RANKING[0]?.count ?? 1;

const PRESS_BUTTON =
  "font-display flex items-center justify-center rounded-[14px] border-2 border-line-strong leading-[normal] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

type PodiumRank = 1 | 2 | 3;

const PODIUM_STYLES: Record<PodiumRank, { medal: string; shadow: string; order: string }> = {
  1: { medal: "bg-rank-first", shadow: "shadow-[5px_5px_0_0_var(--color-rank-first)] sm:shadow-[7px_7px_0_0_var(--color-rank-first)]", order: "order-1 md:order-2" },
  2: { medal: "bg-rank-second", shadow: "shadow-[5px_5px_0_0_var(--color-rank-second)] sm:shadow-[7px_7px_0_0_var(--color-rank-second)]", order: "order-2 md:order-1" },
  3: { medal: "bg-rank-third", shadow: "shadow-[5px_5px_0_0_var(--color-rank-third)] sm:shadow-[7px_7px_0_0_var(--color-rank-third)]", order: "order-3" },
};

const PermissionBadge = ({ item }: { item: RankedItem }) => <StatusBadge status={item.facility.permission} />;

/** Podium card (ranks 1–3). */
function PodiumCard({ item, rank, multiplier, locale }: { item: RankedItem; rank: PodiumRank; multiplier: number; locale: Locale }) {
  const t = ROOM_SCHEDULE_TEXT[locale].mostBorrowed;
  const f = localizeFacility(item.facility, locale);
  const { count } = item;
  const isWinner = rank === 1;
  const style = PODIUM_STYLES[rank];
  const imageSize = isWinner ? 140 : 100;

  return (
    <li
      className={`flex min-w-0 flex-1 flex-col items-center gap-[10px] rounded-[22px] border-2 border-line-strong bg-surface p-[22px] ${style.shadow} ${style.order}`}
    >
      <span
        aria-label={t.rank(rank)}
        className={`font-display flex size-11 items-center justify-center rounded-full border-2 border-line-strong text-[24px] leading-[normal] text-on-accent ${style.medal}`}
      >
        {rank}
      </span>
      <div
        className={`flex w-full items-center justify-center rounded-[18px] border-2 border-line-strong bg-sun-200 ${isWinner ? "p-[26px]" : "p-[18px]"}`}
      >
        <Image
          src={FACILITY_ILLUSTRATIONS[f.illustration]}
          alt=""
          width={imageSize}
          height={imageSize}
          style={{ width: imageSize, height: imageSize }}
        />
      </div>
      <h3 className={`font-display text-center font-normal leading-[normal] text-ink ${isWinner ? "text-[30px]" : "text-[26px]"}`}>
        {rank === 3 ? (
          <Link href={`/catalog/${f.slug}`} className="hover:underline">
            {f.name}
          </Link>
        ) : (
          f.name
        )}
      </h3>
      <span className="text-[12px] font-extrabold uppercase leading-[normal] text-ink-accent">{COMMON_TEXT[locale].groups[f.group]}</span>
      <p className="flex items-end gap-2 leading-[normal]">
        <span className={`font-display text-ink ${isWinner ? "text-[48px]" : "text-[40px]"}`}>{count * multiplier}×</span>
        <span className="pb-1 text-[14px] font-bold text-ink-muted">{t.borrowed}</span>
      </p>
      <PermissionBadge item={item} />
      {rank !== 3 && (
        <Link href={`/catalog/${f.slug}`} className={`${PRESS_BUTTON} bg-brand-primary text-on-primary px-[18px] py-2 text-[15px]`}>
          {t.viewDetail}
        </Link>
      )}
    </li>
  );
}

export default function MostBorrowedPage() {
  const { locale } = useLocale();
  const t = ROOM_SCHEDULE_TEXT[locale].mostBorrowed;
  const groups = COMMON_TEXT[locale].groups;
  const [period, setPeriod] = useState<PeriodKey>("week");
  const multiplier = PERIODS.find((p) => p.key === period)?.multiplier ?? 1;

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[128px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-[22px]">
        <Breadcrumb items={[{ label: ROOM_SCHEDULE_TEXT[locale].schedule.title, href: "/room-schedule" }, { label: t.title }]} />

        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className="font-display text-[36px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">
              {t.title}
            </h1>
            <p className="text-[15px] text-ink-body sm:text-[17px]">{t.lead}</p>
          </div>
          <Link href="/room-schedule" className={`${PRESS_BUTTON} bg-brand-secondary text-on-secondary px-[18px] py-[9px] text-[15px]`}>
            {t.viewSchedule}
          </Link>
        </div>

        {/* Period */}
        <div role="group" aria-label={t.periodLabel} className="flex flex-wrap gap-[10px]">
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={active}
                onClick={() => setPeriod(p.key)}
                className={`rounded-full border-2 border-line-strong px-[18px] py-2 text-[15px] font-extrabold leading-[normal] transition-transform ${
                  active ? "bg-brand-secondary text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)]" : "bg-surface text-ink hover:-translate-y-0.5"
                }`}
              >
                {t.periods[p.key]}
              </button>
            );
          })}
        </div>

        {/* Podium: visual order 2-1-3 on wide screens, 1-2-3 stacked on small screens */}
        <ol aria-label={t.podiumLabel} className="flex w-full flex-col gap-6 md:flex-row md:items-end md:gap-[26px]">
          {PODIUM.map((item, i) => (
            <PodiumCard key={item.slug} item={item} rank={(i + 1) as PodiumRank} multiplier={multiplier} locale={locale} />
          ))}
        </ol>

        {/* Ranks 4–9 */}
        <section
          aria-label={t.restLabel}
          className="flex w-full flex-col gap-[10px] rounded-[20px] border-2 border-line-strong bg-surface p-3 shadow-[4px_4px_0_0_var(--color-shadow)] sm:p-[18px] sm:shadow-[6px_6px_0_0_var(--color-shadow)]"
        >
          <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink sm:text-[28px]">{t.restTitle}</h2>
          <ol className="flex flex-col gap-[10px]">
            {REST.map((item, i) => {
              const f = localizeFacility(item.facility, locale);
              const { count } = item;
              const rank = i + 4;
              const total = count * multiplier;
              return (
                <li
                  key={f.slug}
                  className={`group grid grid-cols-[34px_54px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-[14px] px-3 py-[10px] focus-within:bg-surface-row md:grid-cols-[34px_54px_minmax(140px,230px)_minmax(0,1fr)_56px_auto_88px] ${
                    i % 2 === 0 ? "bg-surface-row" : "bg-surface"
                  }`}
                >
                  <span
                    aria-label={t.rank(rank)}
                    className="font-display flex size-[34px] items-center justify-center rounded-full border-2 border-line-strong bg-surface text-[17px] leading-[normal] text-ink"
                  >
                    {rank}
                  </span>
                  <span className="rounded-[12px] border-2 border-line-strong bg-sun-200 p-[5px]">
                    <Image src={FACILITY_ILLUSTRATIONS[f.illustration]} alt="" width={40} height={40} className="size-10" />
                  </span>
                  <div className="flex min-w-0 flex-col leading-[normal]">
                    <span className="truncate text-[16px] font-extrabold text-ink">{f.name}</span>
                    <span className="text-[12px] font-bold text-ink-muted">{groups[f.group]}</span>
                  </div>

                  <div className="col-span-3 flex items-center gap-3 md:contents">
                    <div
                      role="meter"
                      aria-label={t.timesBorrowed(f.name, total)}
                      aria-valuemin={0}
                      aria-valuemax={TOP_COUNT * multiplier}
                      aria-valuenow={total}
                      className="h-4 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-line-strong bg-pair-gray-bg"
                    >
                      <div className="h-full bg-data-bar transition-[width] duration-300" style={{ width: `${(count / TOP_COUNT) * 100}%` }} />
                    </div>
                    <span className="font-display w-14 shrink-0 text-[24px] leading-[normal] text-ink">{total}×</span>
                  </div>

                  <div className="col-span-3 flex items-center justify-between gap-3 md:contents">
                    <PermissionBadge item={item} />
                    <Link
                      href={`/catalog/${f.slug}`}
                      className={`${PRESS_BUTTON} bg-brand-primary text-on-primary px-4 py-[6px] text-[14px] md:justify-self-end md:opacity-0 md:transition-opacity md:group-focus-within:opacity-100 md:group-hover:opacity-100 md:focus-visible:opacity-100`}
                    >
                      {t.borrow}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="text-[13px] text-ink-muted-on-page">{COMMON_TEXT[locale].simulatedData}</p>
      </div>
    </main>
  );
}
