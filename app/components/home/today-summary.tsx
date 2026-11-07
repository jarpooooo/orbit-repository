// app/components/home/today-summary.tsx
//
// "Ringkasan hari ini" section (Figma node 1:3171, desktop 1440px):
//   card 1 "Ruang kosong hari ini"  +  card 2 "Paling sering dipinjam".
// Free rooms: a few rooms with today's free hours (custom hours, merged into ranges "08.00–11.00") from the same
// simulation the booking steps use (getHourAvailability); a row links to that room's "Pilih jam" step.
// "Today" is read in the browser (useSyncExternalStore, so the server render shows "Memuat…" instead of a wrong day).
// POPULAR is still simulated (replace with API data later).
// Text: HOME_TEXT.todaySummary (app/i18n/home.ts). Client component because the text follows the language preference.

"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { getHourAvailability, isClosedDay } from "@/app/data/availability";
import { getFacility, type FacilityCategory } from "@/app/data/facilities";
import CategoryBadge from "@/app/components/ui/category-badge";
import { COMMON_TEXT } from "@/app/i18n/common";
import { localizeFacility } from "@/app/i18n/facilities";
import { HOME_TEXT, type SlotStatus, type SummaryItemKey } from "@/app/i18n/home";
import { useLocale } from "@/app/components/layout/language";
import { isHourPast, timeRangeLabel } from "@/app/lib/booking";
import { toIsoDate } from "@/app/lib/date";

/* ---------------------------------- data ---------------------------------- */

/** same colors as the booking calendars: many free hours green, a few orange, none gray + red */
const SLOT_CLASSES: Record<SlotStatus, string> = {
  free: "bg-status-available-bg text-status-available-fg",
  few: "bg-status-attention-bg text-status-attention-fg",
  full: "bg-status-unavailable-bg text-stock-out-fg",
};
/** a room with this many free hours left today or more is "Tersedia" */
const MANY_HOURS = 5;
const HOME_ROOMS = ["discussion-room-1", "auditorium", "computer-lab-1", "discussion-room-2"] as const;

// "now" from the browser, rounded to the minute (stable snapshot); null on the server
const subscribeClock = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};
const minuteNow = () => Math.floor(Date.now() / 60_000);
const serverNow = () => null;

/** today's free hours of a room as ranges: [[8, 11], [14, 17]] = 08.00–11.00, 14.00–17.00 */
function freeRanges(facilityId: string, now: Date) {
  const iso = toIsoDate(now);
  if (isClosedDay(iso)) return [];
  const ranges: [number, number][] = [];
  for (const { hour, status } of getHourAvailability(facilityId, iso)) {
    if (status !== "free" || isHourPast(now, hour, now)) continue;
    const last = ranges.at(-1);
    if (last && last[1] === hour) last[1] = hour + 1;
    else ranges.push([hour, hour + 1]);
  }
  return ranges;
}

/** Same top 4 as the "Paling sering dipinjam" page. */
const POPULAR: readonly { item: SummaryItemKey; category: FacilityCategory; count: number }[] = [
  { item: "esp32", category: "hardware", count: 18 },
  { item: "hdmi", category: "multimedia", count: 15 },
  { item: "discussionA", category: "room", count: 12 },
  { item: "sensorKit", category: "hardware", count: 9 },
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
  const minute = useSyncExternalStore(subscribeClock, minuteNow, serverNow);
  const now = minute === null ? null : new Date(minute * 60_000);
  const rooms = HOME_ROOMS.flatMap((id) => {
    const facility = getFacility(id);
    if (!facility) return [];
    const ranges = now ? freeRanges(id, now) : [];
    const hours = ranges.reduce((sum, [a, b]) => sum + b - a, 0);
    const status: SlotStatus = hours === 0 ? "full" : hours >= MANY_HOURS ? "free" : "few";
    return [{ id, name: localizeFacility(facility, locale).name, ranges, hours, status }];
  });

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
            {rooms.map((r, i) => (
              <div key={r.id} role="row" className={`${ROOM_COLUMNS} ${ROW} ${rowBackground(i)}`}>
                <span role="cell" className="text-[13px] font-bold leading-[1.35] text-ink sm:text-[15px]">
                  {!now ? t.loading : r.ranges.length ? r.ranges.map(([a, b]) => timeRangeLabel(a, b, locale).replace(" – ", "–")).join(", ") : t.noFreeHours}
                </span>
                <span role="cell" className="min-w-0 text-[15px] font-normal leading-[1.55] text-ink sm:text-[16px]">
                  {r.status === "full" || !now ? (
                    r.name
                  ) : (
                    <Link href={`/catalog/${r.id}/schedule?hari=${toIsoDate(now)}`} className="font-bold underline decoration-2 underline-offset-4 hover:text-link">
                      {r.name}
                    </Link>
                  )}
                </span>
                <span role="cell" className="flex">
                  {now && (
                    <span className={`whitespace-nowrap rounded-full px-3 py-[5px] text-[14px] font-bold leading-[1.3] ${SLOT_CLASSES[r.status]}`}>
                      {t.slotStatus[r.status](r.hours)}
                    </span>
                  )}
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
                <span role="cell" className="hidden sm:block">
                  <CategoryBadge category={p.category} />
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
