// app/room-schedule/page.tsx
//
// "Cek ketersediaan" (Figma "1.5", the "Cek Ketersediaan" navbar item). One week (Mon–Sat, ‹ › by week); pick a day.
//  - Ruangan: one row per room, the day's hours 08.00–17.00 as columns. Hours with the same state are merged into
//    one block (Kosong / Terisi / Menunggu verifikasi / Lewat). A green block opens the room's "Pilih jam" step
//    (/catalog/[id]/schedule?hari=…).
//  - Barang: one row per item, the week's days as columns: "n unit" (green / orange when low), "Habis" (gray, red
//    text) and "Tutup"; neighboring Habis / Tutup / Lewat days are merged. A green day opens the item's schedule.
//  - Filter: Semua / one category.
// Data: the SAME simulation the schedulers use (getHourAvailability / getDailyAvailability in app/data/availability.ts),
// so what this page shows is what the booking steps accept. Facilities are live (useFacilities).
// Text: ROOM_SCHEDULE_TEXT.schedule (app/i18n/room-schedule.ts); facility content via localizeFacility.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import { UI_ICONS } from "@/app/design/icon-map";
import CategoryBadge from "@/app/components/ui/category-badge";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import { getDailyAvailability, getHourAvailability, isClosedDay } from "@/app/data/availability";
import { CATEGORY_ORDER, bookingMode, type Facility, type FacilityCategory } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { ROOM_SCHEDULE_TEXT } from "@/app/i18n/room-schedule";
import { useLocale } from "@/app/components/layout/language";
import { BOOKABLE_HOURS, MAX_MONTHS_AHEAD, firstBookableDate, firstPickupDate, hourLabel, isHourPast, timeRangeLabel } from "@/app/lib/booking";
import { useFacilities } from "@/app/lib/facility-store";
import { addDays, addMonths, dateNames, formatShortDate, isSameDay, parseIsoDate, startOfWeek, toIsoDate, toNoon } from "@/app/lib/date";

type Filter = "all" | FacilityCategory;
const FILTERS: readonly Filter[] = ["all", ...CATEGORY_ORDER];

type Kind = "free" | "few" | "taken" | "pending" | "past" | "closed";
/** One look per state, shared by both tables (and the same colors as the booking calendars). */
const CELL: Record<Kind, string> = {
  free: "border-line-strong bg-status-available-bg text-status-available-fg",
  few: "border-line-strong bg-status-attention-bg text-status-attention-fg",
  taken: "border-line bg-status-unavailable-bg text-stock-out-fg",
  pending: "border-line-strong bg-status-pending-bg text-status-pending-fg",
  past: "border-line bg-status-unavailable-bg text-ink-muted opacity-70",
  closed: "border-line bg-status-unavailable-bg text-ink-muted",
};
const LINK_CELL = "shadow-[0_3px_0_0_var(--color-shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-shadow)]";
const LEGEND = [
  { key: "available", box: "bg-status-available-bg" },
  { key: "few", box: "bg-status-attention-bg" },
  { key: "pending", box: "bg-status-pending-bg" },
  { key: "full", box: "bg-status-unavailable-bg" },
] as const;

const CONTROL_BUTTON =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong bg-surface text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const CARD =
  "flex w-full flex-col gap-3 rounded-[20px] border-2 border-line-strong bg-surface p-3 shadow-[4px_4px_0_0_var(--color-shadow)] sm:p-[18px] sm:shadow-[6px_6px_0_0_var(--color-shadow)]";

/** Neighbors with the same kind (and `mergeable`) become one block: [{ kind, from, span }] */
function mergeRuns<T>(items: readonly T[], kindOf: (x: T) => Kind, mergeable: (k: Kind) => boolean) {
  const runs: { kind: Kind; from: number; span: number }[] = [];
  items.forEach((x, i) => {
    const kind = kindOf(x);
    const last = runs.at(-1);
    if (last && last.kind === kind && mergeable(kind)) last.span += 1;
    else runs.push({ kind, from: i, span: 1 });
  });
  return runs;
}

function weekRangeLabel(days: readonly Date[], locale: Locale) {
  const { monthsShort } = dateNames(locale);
  const first = days[0];
  const last = days[days.length - 1];
  const end = `${last.getDate()} ${monthsShort[last.getMonth()]} ${last.getFullYear()}`;
  return first.getMonth() === last.getMonth() ? `${first.getDate()} – ${end}` : `${first.getDate()} ${monthsShort[first.getMonth()]} – ${end}`;
}

function FacilityName({ f }: { f: ReturnType<typeof localizeFacility> }) {
  return (
    <div className="flex min-w-0 items-center gap-3 p-[6px]">
      <span className={`shrink-0 rounded-[12px] border-2 border-line-strong p-[5px] ${CATEGORY_STYLE[f.category].panel}`}>
        <FacilityIllustration id={f.illustration} size={34} className="size-[34px]" />
      </span>
      <div className="flex min-w-0 flex-col items-start leading-[normal]">
        <span className="truncate text-[14px] font-extrabold text-ink">{f.name}</span>
        <CategoryBadge category={f.category} />
      </div>
    </div>
  );
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
  const names = dateNames(locale);
  const facilities = useFacilities();
  const filterLabel = (f: Filter) => (f === "all" ? common.all : common.categories[f]);
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;

  const minDate = firstBookableDate(now);
  const maxDate = addMonths(toNoon(now), MAX_MONTHS_AHEAD);
  const pickupIso = toIsoDate(firstPickupDate(now));

  const [selected, setSelected] = useState(minDate);
  const [weekStart, setWeekStart] = useState(startOfWeek(minDate));
  const [filter, setFilter] = useState<Filter>("all");

  const isSelectable = (d: Date) => toIsoDate(d) >= toIsoDate(minDate) && toIsoDate(d) <= toIsoDate(maxDate) && !isClosedDay(toIsoDate(d));
  const shiftWeek = (direction: 1 | -1) => {
    const nextWeek = addDays(weekStart, 7 * direction);
    setWeekStart(nextWeek);
    const days = Array.from({ length: 6 }, (_, i) => addDays(nextWeek, i));
    setSelected(days.find(isSelectable) ?? (toIsoDate(nextWeek) < toIsoDate(minDate) ? minDate : nextWeek));
  };
  const prevWeekDisabled = toIsoDate(weekStart) <= toIsoDate(startOfWeek(minDate));
  const nextWeekDisabled = toIsoDate(addDays(weekStart, 7)) > toIsoDate(maxDate);

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const selectedIso = toIsoDate(selected);
  const selectedLabel = formatShortDate(selected, locale);
  const shown = (f: Facility) => filter === "all" || f.category === filter;
  const rooms = facilities.filter((f) => bookingMode(f) === "session" && shown(f));
  const items = facilities.filter((f) => bookingMode(f) === "daily" && shown(f));

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

        {/* Day picker (Mon–Sat) */}
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
                    aria-label={formatShortDate(d, locale)}
                    onClick={() => setSelected(d)}
                    className={`flex shrink-0 items-center gap-2 rounded-[14px] border-2 px-4 py-2 leading-[normal] transition-transform ${
                      isSelected
                        ? "border-line-strong bg-brand-secondary shadow-[0_3px_0_0_var(--color-shadow)]"
                        : selectable
                          ? "border-line-strong bg-surface hover:-translate-y-0.5"
                          : "cursor-not-allowed border-line bg-status-unavailable-bg opacity-60"
                    }`}
                  >
                    <span className={`text-[13px] font-extrabold ${isSelected ? "text-on-accent-muted" : "text-ink-muted"}`}>{names.workdaysShort[i]}</span>
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

        {rooms.length === 0 && items.length === 0 && <p className="text-[14px] text-ink-muted-on-page">{t.empty}</p>}

        {/* Rooms: hours of the selected day */}
        {rooms.length > 0 && (
          <section aria-label={t.roomsTitle(selectedLabel)} className={CARD}>
            <div className="flex flex-col gap-1 px-1">
              <h2 className="font-display text-[22px] font-normal leading-[normal] text-ink">{t.roomsTitle(selectedLabel)}</h2>
              <p className="text-[13px] text-ink-body">{t.roomsLead}</p>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[760px] grid-cols-[220px_repeat(9,minmax(0,1fr))] gap-x-1.5 gap-y-2">
                <span className="p-[6px] text-[12px] font-extrabold text-ink-muted">{t.facilityColumn}</span>
                {BOOKABLE_HOURS.map((h) => (
                  <span key={h} aria-hidden className="py-[6px] text-center text-[12px] font-extrabold text-ink">
                    {hourLabel(h, locale)}
                  </span>
                ))}
                {rooms.map((original) => {
                  const f = localizeFacility(original, locale);
                  const hours = getHourAvailability(f.id, selectedIso).map(({ hour, status }) => ({
                    hour,
                    kind: (isClosedDay(selectedIso) ? "closed" : isHourPast(selected, hour, now) ? "past" : status) as Kind,
                  }));
                  const runs = mergeRuns(hours, (x) => x.kind, () => true);
                  return (
                    <div key={f.id} className="contents">
                      <FacilityName f={f} />
                      {runs.map((run) => {
                        const start = hours[run.from].hour;
                        const range = timeRangeLabel(start, start + run.span, locale);
                        const label = t.cell[run.kind === "few" ? "free" : run.kind];
                        const className = `flex min-h-[52px] min-w-0 flex-col items-center justify-center rounded-[10px] border-2 px-1 text-center text-[12px] font-extrabold leading-tight ${CELL[run.kind]}`;
                        const style = { gridColumn: `span ${run.span}` };
                        return run.kind === "free" ? (
                          <Link
                            key={run.from}
                            href={`/catalog/${f.id}/schedule?hari=${selectedIso}`}
                            aria-label={t.openRoom(f.name, range)}
                            style={style}
                            className={`${className} ${LINK_CELL}`}
                          >
                            {label}
                            {run.span > 1 && <span className="text-[11px] font-bold opacity-80">{range}</span>}
                          </Link>
                        ) : (
                          <div key={run.from} role="img" aria-label={`${f.name}, ${range}, ${label}`} style={style} className={className}>
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Items: stock per day of the week */}
        {items.length > 0 && (
          <section aria-label={t.itemsTitle} className={CARD}>
            <div className="flex flex-col gap-1 px-1">
              <h2 className="font-display text-[22px] font-normal leading-[normal] text-ink">{t.itemsTitle}</h2>
              <p className="text-[13px] text-ink-body">{t.itemsLead}</p>
            </div>
            <div className="overflow-x-auto pb-1">
              <div className="grid min-w-[640px] grid-cols-[220px_repeat(6,minmax(0,1fr))] gap-x-1.5 gap-y-2">
                <span className="p-[6px] text-[12px] font-extrabold text-ink-muted">{t.facilityColumn}</span>
                {weekDays.map((d, i) => (
                  <span
                    key={toIsoDate(d)}
                    aria-hidden
                    className={`rounded-[8px] py-[6px] text-center text-[12px] font-extrabold ${isSameDay(d, selected) ? "bg-brand-secondary text-on-secondary" : "text-ink"}`}
                  >
                    {names.workdaysShort[i]} {d.getDate()}
                  </span>
                ))}
                {items.map((original) => {
                  const f = localizeFacility(original, locale);
                  const days = weekDays.map((d) => {
                    const iso = toIsoDate(d);
                    const a = getDailyAvailability(f.id, iso);
                    const kind: Kind =
                      a.level === "closed" ? "closed" : iso < pickupIso ? "past" : a.level === "out" ? "taken" : a.level === "low" ? "few" : "free";
                    return { iso, kind, units: a.units };
                  });
                  const runs = mergeRuns(days, (x) => x.kind, (k) => k === "taken" || k === "closed" || k === "past");
                  return (
                    <div key={f.id} className="contents">
                      <FacilityName f={f} />
                      {runs.map((run) => {
                        const day = days[run.from];
                        const open = run.kind === "free" || run.kind === "few";
                        const label = open ? FACILITY_TEXT[locale].quantity(day.units, f.unit) : run.kind === "taken" ? t.cell.soldOut : t.cell[run.kind === "past" ? "past" : "closed"];
                        const dayName = formatShortDate(parseIsoDate(day.iso)!, locale);
                        const className = `flex min-h-[52px] min-w-0 items-center justify-center rounded-[10px] border-2 px-1 text-center text-[12px] font-extrabold leading-tight ${CELL[run.kind]}`;
                        const style = { gridColumn: `span ${run.span}` };
                        return open ? (
                          <Link
                            key={day.iso}
                            href={`/catalog/${f.id}/schedule`}
                            aria-label={t.openItem(f.name, dayName, label)}
                            style={style}
                            className={`${className} ${LINK_CELL}`}
                          >
                            {label}
                          </Link>
                        ) : (
                          <div key={day.iso} role="img" aria-label={`${f.name}, ${dayName}, ${label}`} style={style} className={className}>
                            {label}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="text-[13px] font-extrabold text-ink">{t.legendLabel}</span>
          {LEGEND.map((item) => (
            <span key={item.key} className="inline-flex items-center gap-[6px] text-[13px] font-bold text-ink-body">
              <span aria-hidden className={`size-3.5 rounded-[4px] border-[1.5px] border-line-strong ${item.box}`} />
              {t.legend[item.key]}
            </span>
          ))}
          <span className="text-[13px] text-ink-muted-on-page">{common.simulatedData}</span>
        </div>
      </div>
    </main>
  );
}
