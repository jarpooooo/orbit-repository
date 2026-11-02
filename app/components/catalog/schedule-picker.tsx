// app/components/catalog/schedule-picker.tsx
//
// "Pilih jadwal" page content (Figma node 1:979), browsable several months ahead:
//  - default = today (Sunday is closed → start on Monday)
//  - Mon–Sat strip per week, ‹ › buttons move by week, "Hari ini" jumps back to the start
//  - the "Kalender" button opens a month calendar for jumping further
//  - range: today up to MAX_MONTHS_AHEAD months ahead (see app/lib/booking.ts)
// The selection goes to the next step through the query: /catalog/[slug]/request?hari=2026-11-02&sesi=0&jumlah=1
// Session availability is still simulated (slotState()). Replace with API data later.
// "Today" is read in the browser after mount so it never differs from the server prerender.
// Text: BOOKING_TEXT.schedule (app/i18n/booking-flow.ts); facility content via localizeFacility.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UI_ICONS } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import type { Facility } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";
import { MAX_MONTHS_AHEAD, SESSIONS, firstBookableDate, isSessionPast, sessionLabel, toBookingQuery } from "@/app/lib/booking";
import {
  addDays,
  addMonths,
  dateNames,
  diffInDays,
  formatShortDate,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toIsoDate,
  toNoon,
  weekdayIndex,
} from "@/app/lib/date";

const PRIMARY_BUTTON =
  "font-display mt-1 flex items-center justify-center rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2]";
// Control buttons: CONTROL_BASE has no fill or text color, so a state can pick its own (no class conflicts).
const CONTROL_BASE =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border-2 border-line-strong px-3 text-[14px] font-extrabold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const CONTROL_BUTTON = `${CONTROL_BASE} bg-surface text-ink`;

function weekLabel(weekStart: Date, today: Date, locale: Locale) {
  const { months, monthsShort } = dateNames(locale);
  const first = weekStart;
  const last = addDays(weekStart, 5);
  const year = last.getFullYear();
  const range =
    first.getMonth() === last.getMonth()
      ? `${first.getDate()} – ${last.getDate()} ${months[last.getMonth()]} ${year}`
      : `${first.getDate()} ${monthsShort[first.getMonth()]} – ${last.getDate()} ${monthsShort[last.getMonth()]} ${year}`;
  const isThisWeek = isSameDay(weekStart, startOfWeek(today));
  return `${isThisWeek ? BOOKING_TEXT[locale].schedule.thisWeek : ""}${range}.`;
}

/* ------------------------------ simulated data ------------------------------ */

type SlotState = "open" | "full" | "past";

/** SIMULATION of availability. Replace with API data. */
function slotState(f: Facility, day: Date, session: number, now: Date): SlotState {
  if (isSessionPast(day, session, now)) return "past";
  if (f.status === "borrowed" && diffInDays(day, toNoon(now)) < 3) return "full";
  if (session === 2) return day.getDate() % 2 === 0 ? "full" : "open";
  return (day.getDate() * 3 + day.getMonth() * 5 + f.slug.length + session) % 7 === 0 ? "full" : "open";
}

const firstOpenSession = (f: Facility, day: Date, now: Date) =>
  SESSIONS.findIndex((_, i) => slotState(f, day, i, now) === "open");

/* -------------------------------- components -------------------------------- */

export default function SchedulePicker({ facility }: { facility: Facility }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  // wait for "today" from the browser first (avoids a server vs. client render mismatch)
  if (!now) return <main className="min-h-screen bg-page" />;
  return <Schedule facility={facility} now={now} />;
}

function Schedule({ facility: original, now }: { facility: Facility; now: Date }) {
  const { locale } = useLocale();
  const f = localizeFacility(original, locale);
  const text = BOOKING_TEXT[locale];
  const t = text.schedule;
  const { months, workdaysShort, monthsShort } = dateNames(locale);
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;
  const CalendarIcon = UI_ICONS.calendar;

  const today = toNoon(now);
  const minDate = firstBookableDate(now);
  const maxDate = addMonths(today, MAX_MONTHS_AHEAD);

  const [selected, setSelected] = useState(minDate);
  const [weekStart, setWeekStart] = useState(startOfWeek(minDate));
  const [session, setSession] = useState(() => firstOpenSession(f, minDate, now));
  const [quantity, setQuantity] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(minDate));

  const isRoom = f.unit === "person";
  const hasSession = session >= 0;

  const isSelectable = (d: Date) =>
    toIsoDate(d) >= toIsoDate(minDate) && toIsoDate(d) <= toIsoDate(maxDate) && d.getDay() !== 0;

  const selectDate = (d: Date) => {
    setSelected(d);
    setWeekStart(startOfWeek(d));
    setSession(firstOpenSession(f, d, now));
    setCalendarMonth(startOfMonth(d));
  };

  const shiftWeek = (direction: 1 | -1) => {
    const nextWeek = addDays(weekStart, 7 * direction);
    selectDate(toIsoDate(nextWeek) < toIsoDate(minDate) ? minDate : nextWeek);
  };

  const prevWeekDisabled = toIsoDate(weekStart) <= toIsoDate(startOfWeek(minDate));
  const nextWeekDisabled = toIsoDate(addDays(weekStart, 7)) > toIsoDate(maxDate);
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const rows = text.summaryRows;
  const summary: [string, string][] = [
    [rows.facility, f.name],
    [rows.day, formatShortDate(selected, locale)],
    [rows.session, hasSession ? sessionLabel(session, locale) : "-"],
    [isRoom ? rows.people : rows.quantity, String(quantity)],
    [rows.permission, FACILITY_TEXT[locale].statuses[f.permission]],
  ];

  /* ------- month calendar ------- */
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const monthDays = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1, 12),
  ).filter((d) => d.getDay() !== 0);
  const leadingBlanks = monthDays.length ? weekdayIndex(monthDays[0]) : 0;
  const prevMonthDisabled = toIsoDate(calendarMonth) <= toIsoDate(startOfMonth(minDate));
  const nextMonthDisabled = toIsoDate(addMonths(calendarMonth, 1)) > toIsoDate(maxDate);

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb
          items={[
            { label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" },
            { label: f.name, href: `/catalog/${f.slug}` },
            { label: text.crumbs.schedule },
          ]}
        />

        <Stepper active={3} />

        <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {/* Left: selection */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[18px]">
            <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[52px]">
              {t.title}
            </h1>
            <p aria-live="polite" className="text-[16px] text-ink-body sm:text-[17px]">
              {weekLabel(weekStart, today, locale)}
            </p>

            {/* Week / calendar navigation */}
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-label={t.prevWeek} disabled={prevWeekDisabled} onClick={() => shiftWeek(-1)} className={CONTROL_BUTTON}>
                <PrevIcon size={18} strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" aria-label={t.nextWeek} disabled={nextWeekDisabled} onClick={() => shiftWeek(1)} className={CONTROL_BUTTON}>
                <NextIcon size={18} strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" onClick={() => selectDate(minDate)} className={CONTROL_BUTTON}>
                {t.today}
              </button>
              <button
                type="button"
                aria-expanded={calendarOpen}
                onClick={() => setCalendarOpen((v) => !v)}
                className={`${CONTROL_BASE} ${calendarOpen ? "bg-brand-secondary text-on-secondary" : "bg-surface text-ink"}`}
              >
                <CalendarIcon size={18} strokeWidth={2.25} aria-hidden />
                {t.calendar}
              </button>
            </div>

            {/* Month calendar */}
            {calendarOpen && (
              <div className="w-full max-w-[420px] rounded-2xl border-2 border-line-strong bg-surface p-4 shadow-[4px_4px_0_0_var(--color-shadow)]">
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label={t.prevMonth}
                    disabled={prevMonthDisabled}
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                    className={`${CONTROL_BUTTON} !h-9 !px-2`}
                  >
                    <PrevIcon size={16} strokeWidth={2.5} aria-hidden />
                  </button>
                  <span className="font-display text-[20px] text-ink">
                    {months[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                  </span>
                  <button
                    type="button"
                    aria-label={t.nextMonth}
                    disabled={nextMonthDisabled}
                    onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                    className={`${CONTROL_BUTTON} !h-9 !px-2`}
                  >
                    <NextIcon size={16} strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {workdaysShort.map((name) => (
                    <span key={name} className="pb-1 text-[12px] font-extrabold text-ink-muted">
                      {name}
                    </span>
                  ))}
                  {Array.from({ length: leadingBlanks }, (_, i) => (
                    <span key={`blank-${i}`} />
                  ))}
                  {monthDays.map((d) => {
                    const selectable = isSelectable(d);
                    const isSelected = isSameDay(d, selected);
                    const isToday = isSameDay(d, today);
                    return (
                      <button
                        key={toIsoDate(d)}
                        type="button"
                        disabled={!selectable}
                        aria-pressed={isSelected}
                        onClick={() => {
                          selectDate(d);
                          setCalendarOpen(false);
                        }}
                        className={[
                          "h-10 rounded-[10px] border-2 text-[14px] font-extrabold transition-colors",
                          isSelected
                            ? "border-line-strong bg-brand-secondary text-on-secondary"
                            : isToday
                              ? "border-status-available bg-surface text-ink hover:bg-surface-warm"
                              : "border-transparent bg-surface text-ink hover:bg-surface-warm",
                          selectable ? "" : "cursor-not-allowed !bg-transparent !text-line hover:!bg-transparent",
                        ].join(" ")}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px] text-ink-muted">
                  {t.calendarNote(MAX_MONTHS_AHEAD)}
                </p>
              </div>
            )}

            {/* Days (Mon–Sat of the selected week) */}
            <div role="group" aria-label={t.chooseDay} className="grid w-full grid-cols-3 gap-[10px] sm:grid-cols-6">
              {weekDays.map((d, i) => {
                const isSelected = isSameDay(d, selected);
                const selectable = isSelectable(d);
                return (
                  <button
                    key={toIsoDate(d)}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={isSelected}
                    onClick={() => selectDate(d)}
                    className={`flex flex-col items-center rounded-[14px] border-2 py-[10px] leading-[normal] transition-transform ${
                      isSelected
                        ? "border-line-strong bg-brand-secondary shadow-[0_4px_0_0_var(--color-shadow)]"
                        : selectable
                          ? "border-line-strong bg-surface hover:-translate-y-0.5"
                          : "cursor-not-allowed border-line bg-surface/50 opacity-60"
                    }`}
                  >
                    <span className={`text-[12px] font-extrabold ${isSelected ? "text-on-accent-muted" : "text-ink-muted"}`}>{workdaysShort[i]}</span>
                    <span className={`font-display text-[26px] ${isSelected ? "text-on-secondary" : "text-ink"}`}>{d.getDate()}</span>
                    <span className={`text-[12px] font-extrabold ${isSelected ? "text-on-accent-muted" : "text-ink-muted"}`}>{monthsShort[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>

            {/* Sessions */}
            <h2 className="font-display text-[24px] font-normal leading-[1.05] text-ink sm:text-[26px]">{t.sessionsTitle}</h2>
            <div role="group" aria-label={t.chooseSession} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
              {SESSIONS.map((_, i) => {
                const label = sessionLabel(i, locale);
                const state = slotState(f, selected, i, now);
                const blocked = state !== "open";
                const isSelected = i === session && !blocked;
                const caption =
                  state === "full"
                    ? t.sessionState.full
                    : state === "past"
                      ? t.sessionState.past
                      : isSelected
                        ? t.sessionState.selected
                        : isRoom
                          ? t.sessionState.free
                          : t.sessionState.available;
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={blocked}
                    aria-pressed={isSelected}
                    onClick={() => setSession(i)}
                    className={`flex flex-col items-start gap-[2px] rounded-[14px] border-2 border-line-strong px-4 py-[13px] text-left leading-[normal] transition-transform ${
                      blocked
                        ? "cursor-not-allowed bg-status-unavailable-bg text-status-unavailable-fg"
                        : isSelected
                          ? "bg-status-available text-on-accent shadow-[0_4px_0_0_var(--color-shadow)]"
                          : "bg-surface text-ink hover:-translate-y-0.5"
                    }`}
                  >
                    <span className="text-[15px] font-extrabold">{label}</span>
                    <span className={`text-[12px] font-bold ${blocked ? "" : isSelected ? "text-on-accent-muted" : "text-ink-muted"}`}>{caption}</span>
                  </button>
                );
              })}
            </div>

            {/* Quantity */}
            <h2 className="font-display text-[24px] font-normal leading-[1.05] text-ink sm:text-[26px]">
              {isRoom ? t.peopleTitle : t.unitsTitle}
            </h2>
            <div className="flex items-center overflow-hidden rounded-[14px] border-2 border-line-strong bg-surface">
              <button
                type="button"
                aria-label={t.decrease}
                disabled={quantity <= 1}
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
                className="font-display size-11 bg-brand-secondary text-[22px] text-on-secondary disabled:opacity-50"
              >
                -
              </button>
              <output aria-live="polite" className="font-display flex h-11 w-16 items-center justify-center text-[20px] text-ink">
                {quantity}
              </output>
              <button
                type="button"
                aria-label={t.increase}
                disabled={quantity >= f.maxQuantity}
                onClick={() => setQuantity((n) => Math.min(f.maxQuantity, n + 1))}
                className="font-display size-11 bg-brand-secondary text-[22px] text-on-secondary disabled:opacity-50"
              >
                +
              </button>
            </div>
            <p className="text-[13px] font-bold text-ink-muted-on-page">{t.max(f.maxQuantity)}</p>
          </div>

          {/* Right: draft summary */}
          <aside className="flex w-full flex-col gap-[2px] rounded-[20px] border-2 border-line-strong bg-surface p-[22px] shadow-[4px_4px_0_0_var(--color-shadow)] sm:shadow-[5px_5px_0_0_var(--color-shadow)] lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0">
            <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.draftTitle}</h2>
            {summary.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                <span className="text-ink-muted">{label}</span>
                <span className="text-right font-bold text-ink">{value}</span>
              </div>
            ))}
            {hasSession ? (
              <Link
                href={`/catalog/${f.slug}/request?${toBookingQuery({ date: toIsoDate(selected), session, quantity })}`}
                className={`${PRIMARY_BUTTON} bg-brand-primary text-on-primary shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]`}
              >
                {t.continue}
              </Link>
            ) : (
              <>
                <span aria-disabled className={`${PRIMARY_BUTTON} cursor-not-allowed bg-status-unavailable-bg text-ink-muted`}>
                  {t.continue}
                </span>
                <p className="pt-2 text-[13px] text-status-attention-fg">{t.noSessionLeft}</p>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
