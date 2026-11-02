// app/components/home/today-summary.tsx
//
// "Ringkasan hari ini" section (Figma node 1:3171, desktop 1440px):
//   card 1 "Ruang kosong hari ini"  +  card 2 "Paling sering dipinjam".
// No image assets. Simulated data lives in ROOM_SLOTS / POPULAR (replace with API data later).
// Text: HOME_TEXT.todaySummary (app/i18n/home.ts). Client component because the text follows the language preference.

"use client";

import Link from "next/link";
import type { FacilityGroup } from "@/app/data/facilities";
import { COMMON_TEXT, formatTimeRange } from "@/app/i18n/common";
import { HOME_TEXT, type SlotStatus, type SummaryItemKey, type SummaryRoomKey } from "@/app/i18n/home";
import { useLocale } from "@/app/components/layout/language";

/* ---------------------------------- data ---------------------------------- */

const SLOT_CLASSES: Record<SlotStatus, string> = {
  free: "bg-pair-green-bg text-pair-green-fg",
  taken: "bg-pair-gray-bg text-pair-gray-fg",
  lastSlot: "bg-pair-orange-bg text-pair-orange-fg",
};

const ROOM_SLOTS: readonly { time: string; room: SummaryRoomKey; status: SlotStatus }[] = [
  { time: "08.00–10.00", room: "discussionA", status: "free" },
  { time: "10.00–12.00", room: "seminar", status: "taken" },
  { time: "13.00–15.00", room: "pcLab", status: "free" },
  { time: "15.00–17.00", room: "discussionB", status: "lastSlot" },
];

const POPULAR: readonly { item: SummaryItemKey; group: FacilityGroup; count: number }[] = [
  { item: "esp32", group: "hardware", count: 18 },
  { item: "hdmi", group: "logistics", count: 15 },
  { item: "discussionA", group: "room", count: 12 },
  { item: "multimeter", group: "hardware", count: 9 },
];

/** Badge colors for ranks 1–3 (fixed light chips, navy text in both themes). Other ranks: plain `text-ink`. */
const RANK_CLASSES: Record<number, string> = {
  1: "border-2 border-line-strong bg-rank-first text-on-accent",
  2: "border-2 border-line-strong bg-gray-bg text-on-accent",
  3: "border-2 border-line-strong bg-peach text-on-accent",
};

/* ------------------------------- building blocks ------------------------------- */

const HEADER_CELL = "px-[14px] py-[6px] text-[14px] font-bold leading-[1.3] text-ink-body";
const ROW = "items-center gap-3 rounded-xl p-[14px]";
const rowBackground = (i: number) => (i % 2 === 0 ? "bg-surface-row" : "bg-surface");

// columns: tighter on mobile, exactly Figma from sm up (130 / rest / 130)
const ROOM_COLUMNS = "grid grid-cols-[84px_minmax(0,1fr)_auto] sm:grid-cols-[130px_minmax(0,1fr)_130px]";
// popular: the Category column is hidden on mobile
const POPULAR_COLUMNS = "grid grid-cols-[32px_minmax(0,1fr)_52px] sm:grid-cols-[40px_minmax(0,1fr)_100px_90px]";

function Card({ title, href, cta, footnote, children }: { title: string; href: string; cta: string; footnote: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] border-2 border-line-strong bg-surface p-5 shadow-[5px_5px_0_0_var(--color-shadow-accent)] sm:rounded-[24px] sm:p-8 sm:shadow-[8px_8px_0_0_var(--color-shadow-accent)]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h2 className="font-display text-[26px] font-normal leading-[1.05] text-ink sm:text-[34px]">{title}</h2>
        <Link
          href={href}
          className="inline-flex h-[46px] shrink-0 items-center justify-center rounded-2xl border-2 border-b-[6px] border-line-strong bg-brand-interactive px-[26px] text-[17px] font-extrabold leading-[1.2] text-on-interactive transition-[filter,transform] hover:brightness-110 active:translate-y-[3px] active:border-b-[3px]"
        >
          {cta}
        </Link>
      </div>
      {children}
      <p className="text-[13px] font-normal leading-[1.4] text-ink-muted">{footnote}</p>
    </div>
  );
}

/* --------------------------------- section --------------------------------- */

export default function TodaySummary() {
  const { locale } = useLocale();
  const t = HOME_TEXT[locale].todaySummary;
  const common = COMMON_TEXT[locale];

  return (
    <section className="bg-page px-5 pb-12 pt-12 sm:px-8 sm:pb-14 sm:pt-16 xl:px-[110px] xl:pb-[72px] xl:pt-[88px]">
      <div className="mx-auto flex max-w-[1220px] flex-col gap-8 xl:flex-row">
        {/* Free rooms today */}
        <Card title={t.freeRoomsTitle} href="/room-schedule" cta={t.viewSchedule} footnote={common.simulatedData}>
          <div role="table" aria-label={t.freeRoomsTitle} className="flex flex-col gap-[6px]">
            <div role="row" className={`${ROOM_COLUMNS} gap-3 ${HEADER_CELL}`}>
              <span role="columnheader">{t.columns.time}</span>
              <span role="columnheader">{t.columns.room}</span>
              <span role="columnheader">{t.columns.status}</span>
            </div>
            {ROOM_SLOTS.map((r, i) => (
              <div key={r.time} role="row" className={`${ROOM_COLUMNS} ${ROW} ${rowBackground(i)}`}>
                <span role="cell" className="text-[14px] font-bold leading-[1.3] text-ink sm:text-[16px]">
                  {formatTimeRange(r.time, locale)}
                </span>
                <span role="cell" className="min-w-0 text-[15px] font-normal leading-[1.55] text-ink sm:text-[16px]">
                  {t.rooms[r.room]}
                </span>
                <span role="cell" className="flex">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[14px] font-bold leading-[1.3] ${SLOT_CLASSES[r.status]}`}
                  >
                    {t.slotStatus[r.status]}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Most borrowed */}
        <Card title={t.popularTitle} href="/catalog" cta={t.viewCatalog} footnote={common.simulatedData}>
          <div role="table" aria-label={t.popularTitle} className="flex flex-col gap-[6px]">
            <div role="row" className={`${POPULAR_COLUMNS} gap-3 ${HEADER_CELL}`}>
              <span role="columnheader">{t.columns.rank}</span>
              <span role="columnheader">{t.columns.item}</span>
              <span role="columnheader" className="hidden sm:block">
                {t.columns.category}
              </span>
              <span role="columnheader" className="text-right">
                <span className="sm:hidden">{t.columns.countShort}</span>
                <span className="hidden sm:inline">{t.columns.countLong}</span>
              </span>
            </div>
            {POPULAR.map((p, i) => (
              <div key={p.item} role="row" className={`${POPULAR_COLUMNS} ${ROW} ${rowBackground(i)}`}>
                <span role="cell" className="flex">
                  <span
                    className={`flex size-[30px] items-center justify-center rounded-full text-[14px] font-extrabold ${RANK_CLASSES[i + 1] ?? "text-ink"}`}
                  >
                    {i + 1}
                  </span>
                </span>
                <span role="cell" className="min-w-0 text-[15px] font-bold leading-[1.3] text-ink sm:text-[16px]">
                  {t.items[p.item]}
                </span>
                <span role="cell" className="hidden text-[16px] font-normal leading-[1.55] text-ink sm:block">
                  {common.groups[p.group]}
                </span>
                <span role="cell" className="text-right text-[16px] font-extrabold leading-[1.3] text-ink">
                  {p.count}×
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
