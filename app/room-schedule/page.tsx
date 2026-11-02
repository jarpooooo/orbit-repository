// app/room-schedule/page.tsx
//
// "09 Lihat jadwal" (Figma node 8:1588), the "Jadwal Ruang" navbar item.
// Availability table: rows = facilities, columns = 4 sessions, for one selected day.
//  - Default day = today (Sunday closed, after 17.00 → next working day). Read in the browser after mount.
//  - ‹ › moves by week (up to MAX_MONTHS_AHEAD ahead). Filter: Semua / Ruang / Hardware / Logistik.
//  - Green cell = link to /catalog/[slug]/request?hari=…&sesi=…&jumlah=1. Yellow/gray cells are not clickable.
// Data = SIMULATION. SCHEDULE_ROWS below comes from Figma (Mon, 26 Oct 2026); other days rotate that pattern.
// Not yet in sync with the simulation on the Pilih jadwal page. Replace both with API data later.

// Text: ROOM_SCHEDULE_TEXT.schedule (app/i18n/room-schedule.ts); facility content via localizeFacility.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICONS } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import { withFacilities, type Facility, type FacilityGroup } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { ROOM_SCHEDULE_TEXT } from "@/app/i18n/room-schedule";
import { useLocale } from "@/app/components/layout/language";
import { MAX_MONTHS_AHEAD, SESSIONS, firstBookableDate, isSessionPast, sessionLabel, toBookingQuery } from "@/app/lib/booking";
import {
  addDays,
  addMonths,
  dateNames,
  diffInDays,
  formatShortDate,
  isSameDay,
  startOfWeek,
  toIsoDate,
  toNoon,
} from "@/app/lib/date";

/* ----------------------------- simulated data ----------------------------- */

/** number = units left (0 = sold out) */
type SlotValue = number | "free" | "taken" | "pending";

/** Row order + 4-session pattern, exactly as in Figma for Mon, 26 Oct 2026. */
const SCHEDULE_ROWS = withFacilities([
  { slug: "kit-esp32", pattern: [6, 4, 0, 3] },
  { slug: "ruang-diskusi-a", pattern: ["free", "taken", "free", "pending"] },
  { slug: "ruang-sidang", pattern: ["free", "free", "taken", "free"] },
  { slug: "pc-lab-rpl", pattern: ["taken", "taken", "taken", "taken"] },
  { slug: "multimeter-digital", pattern: [2, 1, 2, 0] },
  { slug: "converter-hdmi", pattern: [12, 10, 11, 12] },
  { slug: "kamera-mirrorless", pattern: [1, 0, 1, 1] },
] satisfies { slug: string; pattern: SlotValue[] }[]);

/** 26 Oct 2026 = the Figma pattern as-is */
const PATTERN_REFERENCE_DATE = new Date(2026, 9, 26, 12);

type CellKind = "open" | "full" | "pending" | "past";
type Cell = { kind: CellKind; line1: string; line2: string };

function computeCell(f: Facility, pattern: readonly SlotValue[], day: Date, session: number, now: Date, locale: Locale): Cell {
  const t = ROOM_SCHEDULE_TEXT[locale].schedule.cell;
  if (isSessionPast(day, session, now)) return { kind: "past", line1: t.past, line2: "" };
  const shift = ((diffInDays(day, PATTERN_REFERENCE_DATE) % 4) + 4) % 4;
  const value = pattern[(session + shift) % 4];
  if (value === "pending") return { kind: "pending", line1: t.pending[0], line2: t.pending[1] };
  if (value === "free") return { kind: "open", line1: t.free, line2: "" };
  if (value === "taken") return { kind: "full", line1: t.taken, line2: "" };
  if (value > 0) return { kind: "open", line1: FACILITY_TEXT[locale].quantity(value, f.unit), line2: t.available };
  return { kind: "full", line1: f.unit === "person" ? t.taken : t.soldOut, line2: "" };
}

const CELL_CLASSES: Record<CellKind, string> = {
  open: "border-line-strong bg-status-available-bg text-status-available-fg shadow-[0_3px_0_0_var(--color-shadow)]",
  pending: "border-line-strong bg-status-pending-bg text-status-pending-fg",
  full: "border-line-strong bg-status-unavailable-bg text-status-unavailable-fg",
  past: "border-line-strong bg-status-unavailable-bg text-status-unavailable-fg opacity-70",
};

/** Legend chips (labels in ROOM_SCHEDULE_TEXT.schedule.legend). */
const LEGEND = [
  { key: "available", box: "bg-status-available-bg text-status-available-fg", dot: "bg-status-available-fg" },
  { key: "pending", box: "bg-status-pending-bg text-status-pending-fg", dot: "bg-status-pending-fg" },
  { key: "full", box: "bg-status-unavailable-bg text-status-unavailable-fg", dot: "bg-status-unavailable-fg" },
] as const;

type Filter = "all" | FacilityGroup;
const FILTERS: readonly Filter[] = ["all", "room", "hardware", "logistics"];

const TABLE_COLUMNS = "md:grid-cols-[210px_repeat(4,minmax(0,1fr))] lg:grid-cols-[280px_repeat(4,minmax(0,1fr))]";
const CONTROL_BUTTON =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong bg-surface text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

function weekRangeLabel(days: readonly Date[], locale: Locale) {
  const { monthsShort } = dateNames(locale);
  const first = days[0];
  const last = days[days.length - 1];
  const end = `${last.getDate()} ${monthsShort[last.getMonth()]} ${last.getFullYear()}`;
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()} – ${end}`
    : `${first.getDate()} ${monthsShort[first.getMonth()]} – ${end}`;
}

/* -------------------------------- components -------------------------------- */

export default function RoomSchedulePage() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  // wait for "today" from the browser first (avoids a server vs. client render mismatch)
  if (!now) return <main className="min-h-screen bg-page" />;
  return <RoomSchedule now={now} />;
}

function RoomSchedule({ now }: { now: Date }) {
  const { locale } = useLocale();
  const t = ROOM_SCHEDULE_TEXT[locale].schedule;
  const common = COMMON_TEXT[locale];
  const { workdaysShort, monthsShort } = dateNames(locale);
  const filterLabel = (f: Filter) => (f === "all" ? common.all : common.groups[f]);
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;

  const minDate = firstBookableDate(now);
  const maxDate = addMonths(toNoon(now), MAX_MONTHS_AHEAD);

  const [selected, setSelected] = useState(minDate);
  const [weekStart, setWeekStart] = useState(startOfWeek(minDate));
  const [filter, setFilter] = useState<Filter>("all");

  const isSelectable = (d: Date) => toIsoDate(d) >= toIsoDate(minDate) && toIsoDate(d) <= toIsoDate(maxDate);
  const shiftWeek = (direction: 1 | -1) => {
    const nextWeek = addDays(weekStart, 7 * direction);
    setWeekStart(nextWeek);
    setSelected(toIsoDate(nextWeek) < toIsoDate(minDate) ? minDate : nextWeek);
  };
  const prevWeekDisabled = toIsoDate(weekStart) <= toIsoDate(startOfWeek(minDate));
  const nextWeekDisabled = toIsoDate(addDays(weekStart, 7)) > toIsoDate(maxDate);

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const selectedLabel = formatShortDate(selected, locale);
  const rows = SCHEDULE_ROWS.filter((row) => filter === "all" || row.facility.group === filter);

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[128px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-[18px]">
        <Breadcrumb items={[{ label: t.title }]} />

        {/* Title */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-[6px]">
            <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">{t.title}</h1>
            <p className="text-[15px] text-ink-body sm:text-[17px]">{t.lead}</p>
          </div>
          <Link
            href="/room-schedule/most-borrowed"
            className="font-display flex items-center justify-center rounded-[14px] border-2 border-line-strong bg-brand-secondary px-[18px] py-[9px] text-[15px] leading-[normal] text-on-secondary shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]"
          >
            {t.mostBorrowed}
          </Link>
        </div>

        {/* Day picker */}
        <div className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <button type="button" aria-label={t.prevWeek} disabled={prevWeekDisabled} onClick={() => shiftWeek(-1)} className={CONTROL_BUTTON}>
              <PrevIcon size={18} strokeWidth={2.5} aria-hidden />
            </button>
            <div role="group" aria-label={t.chooseDay} className="flex min-w-0 flex-1 gap-[10px] overflow-x-auto px-1 pb-[5px] pt-[1px]">
              {weekDays.map((d, i) => {
                const isSelected = isSameDay(d, selected);
                const selectable = isSelectable(d);
                return (
                  <button
                    key={toIsoDate(d)}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={isSelected}
                    aria-label={`${workdaysShort[i]} ${d.getDate()} ${monthsShort[d.getMonth()]}`}
                    onClick={() => setSelected(d)}
                    className={`flex shrink-0 items-center gap-2 rounded-[14px] border-2 px-4 py-2 leading-[normal] transition-transform ${
                      isSelected
                        ? "border-line-strong bg-brand-secondary shadow-[0_3px_0_0_var(--color-shadow)]"
                        : selectable
                          ? "border-line-strong bg-surface hover:-translate-y-0.5"
                          : "cursor-not-allowed border-line bg-surface/50 opacity-60"
                    }`}
                  >
                    <span className={`text-[13px] font-extrabold ${isSelected ? "text-on-accent-muted" : "text-ink-muted"}`}>{workdaysShort[i]}</span>
                    <span className={`font-display text-[22px] ${isSelected ? "text-on-secondary" : "text-ink"}`}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <button type="button" aria-label={t.nextWeek} disabled={nextWeekDisabled} onClick={() => shiftWeek(1)} className={CONTROL_BUTTON}>
              <NextIcon size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <p aria-live="polite" className="text-[13px] font-bold text-ink-muted-on-page">
            {weekRangeLabel(weekDays, locale)}
          </p>
        </div>

        {/* Category filter */}
        <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-[10px]">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f)}
                className={`rounded-full border-2 border-line-strong px-[18px] py-2 text-[15px] font-extrabold leading-[normal] transition-transform ${
                  active ? "bg-brand-secondary text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)]" : "bg-surface text-ink hover:-translate-y-0.5"
                }`}
              >
                {filterLabel(f)}
              </button>
            );
          })}
        </div>

        {/* Schedule table */}
        <section
          aria-label={t.tableLabel(selectedLabel)}
          className="flex w-full flex-col gap-2 rounded-[20px] border-2 border-line-strong bg-surface p-3 shadow-[4px_4px_0_0_var(--color-shadow)] sm:p-[18px] sm:shadow-[6px_6px_0_0_var(--color-shadow)]"
        >
          <p className="px-1 text-[13px] font-extrabold text-ink md:hidden">{selectedLabel}</p>

          <div aria-hidden className={`hidden gap-2 md:grid ${TABLE_COLUMNS}`}>
            <span className="p-[6px] text-[13px] font-extrabold text-ink-muted">{t.facilityColumn}</span>
            {SESSIONS.map((s, i) => (
              <span key={s} className="py-[6px] text-center text-[13px] font-extrabold text-ink">
                {sessionLabel(i, locale)}
              </span>
            ))}
          </div>

          {rows.length === 0 && <p className="p-4 text-[14px] text-ink-muted">{t.empty}</p>}

          {rows.map(({ facility: original, pattern }) => {
            const f = localizeFacility(original, locale);
            return (
              <div
                key={f.slug}
                className={`grid grid-cols-2 items-center gap-2 border-t-2 border-line-warm/60 pt-3 first:border-t-0 first:pt-0 md:border-t-0 md:pt-0 ${TABLE_COLUMNS}`}
              >
                <div className="col-span-2 flex items-center gap-3 p-[6px] md:col-span-1 md:h-[60px]">
                  <span className="shrink-0 rounded-[12px] border-2 border-line-strong bg-sun-200 p-[5px]">
                    <Image src={FACILITY_ILLUSTRATIONS[f.illustration]} alt="" width={38} height={38} className="size-[38px]" />
                  </span>
                  <div className="flex min-w-0 flex-col leading-[normal]">
                    <span className="text-[15px] font-extrabold text-ink">{f.name}</span>
                    <span className="text-[12px] font-bold text-ink-muted">{common.groups[f.group]}</span>
                  </div>
                </div>

                {SESSIONS.map((session, i) => {
                  const label = sessionLabel(i, locale);
                  const cell = computeCell(f, pattern, selected, i, now, locale);
                  const description = `${cell.line1}${cell.line2 ? ` ${cell.line2}` : ""}`;
                  const content = (
                    <>
                      <span className="text-[11px] font-bold opacity-75 md:hidden">{label}</span>
                      <span className="text-[15px] font-extrabold">{cell.line1}</span>
                      <span className="min-h-[14px] text-[11px] font-medium">{cell.line2 || " "}</span>
                    </>
                  );
                  const cellClass = `flex min-w-0 flex-col items-center rounded-[12px] border-2 py-[10px] text-center leading-[normal] ${CELL_CLASSES[cell.kind]}`;
                  return cell.kind === "open" ? (
                    <Link
                      key={session}
                      href={`/catalog/${f.slug}/request?${toBookingQuery({ date: toIsoDate(selected), session: i, quantity: 1 })}`}
                      aria-label={t.requestCell(f.name, label, description)}
                      className={`${cellClass} transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-shadow)]`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={session} role="img" aria-label={`${f.name}, ${label}, ${description}`} className={cellClass}>
                      {content}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[13px] font-extrabold text-ink">{t.legendLabel}</span>
          {LEGEND.map((item) => (
            <span
              key={item.key}
              className={`inline-flex items-center gap-[6px] rounded-full border-2 border-line-strong px-[11px] py-[3px] text-[12.5px] font-extrabold ${item.box}`}
            >
              <span aria-hidden className={`size-2 rounded-full ${item.dot}`} />
              {t.legend[item.key]}
            </span>
          ))}
          <span className="text-[13px] text-ink-muted-on-page">{common.simulatedData}</span>
        </div>
      </div>
    </main>
  );
}
