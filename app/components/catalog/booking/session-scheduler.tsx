// app/components/catalog/booking/session-scheduler.tsx
//
// "Pilih jadwal" (Figma 3.2 "Schedule · Pilih sesi", node 149:2078) for "session" facilities (rooms).
// - Mon–Sat day strip for one week (‹ › by week, "Hari ini", month calendar to jump), up to MAX_MONTHS_AHEAD.
// - "Sesi tersedia": the room's 2-hour sessions (facilitySessions()), Kosong / Dipilih / Penuh / Sudah lewat.
// - "Jumlah peserta" up to the room's capacity.
// - Draft summary with "Lanjut ajukan" → /catalog/[id]/request?hari=&sesi=&jumlah=.
// Day strip and sessions are radio groups: arrow keys move and select, full sessions are aria-disabled.
// Availability: getSessionAvailability() (app/data/availability.ts). Text: BOOKING_TEXT.schedule.

"use client";

import { useState } from "react";
import { UI_ICONS } from "@/app/design/icon-map";
import CategoryBadge from "@/app/components/ui/category-badge";
import { getSessionAvailability, isClosedDay } from "@/app/data/availability";
import { maxQuantity } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { useLocale } from "@/app/components/layout/language";
import {
  MAX_MONTHS_AHEAD,
  firstBookableDate,
  isSessionPast,
  sessionLabel,
  toSelectionQuery,
  validateSelection,
  type SessionSelection,
} from "@/app/lib/booking";
import { addDays, addMonths, dateNames, isSameDay, startOfMonth, startOfWeek, toIsoDate, toNoon, weekdayIndex } from "@/app/lib/date";
import { ASIDE, ContinueButton, QuantityStepper, SECTION_TITLE, SummaryRows, moveFocus } from "./parts";
import { dayLabel } from "./describe";
import type { SchedulerProps } from "./registry";

// Control buttons: CONTROL_BASE has no fill or text color, so a state can pick its own (no class conflicts).
const CONTROL_BASE =
  "inline-flex h-11 items-center justify-center gap-2 rounded-[14px] border-2 border-line-strong px-3 text-[14px] font-extrabold transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const CONTROL_BUTTON = `${CONTROL_BASE} bg-surface text-ink`;

type SlotState = "open" | "full" | "past";

function weekLabel(weekStart: Date, today: Date, locale: Locale) {
  const { months, monthsShort } = dateNames(locale);
  const last = addDays(weekStart, 5);
  const year = last.getFullYear();
  const range =
    weekStart.getMonth() === last.getMonth()
      ? `${weekStart.getDate()} – ${last.getDate()} ${months[last.getMonth()]} ${year}`
      : `${weekStart.getDate()} ${monthsShort[weekStart.getMonth()]} – ${last.getDate()} ${monthsShort[last.getMonth()]} ${year}`;
  return `${isSameDay(weekStart, startOfWeek(today)) ? BOOKING_TEXT[locale].schedule.thisWeek : ""}${range}.`;
}

export default function SessionScheduler({ facility: original, now }: SchedulerProps) {
  const { locale } = useLocale();
  const f = localizeFacility(original, locale);
  const text = BOOKING_TEXT[locale];
  const t = text.schedule;
  const { months, workdaysShort, monthsShort } = dateNames(locale);
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;
  const CalendarIcon = UI_ICONS.calendar;
  const capacity = maxQuantity(original);

  const today = toNoon(now);
  const minDate = firstBookableDate(now);
  const maxDate = addMonths(today, MAX_MONTHS_AHEAD);

  const slots = (day: Date) =>
    getSessionAvailability(f.id, toIsoDate(day)).map(({ sessionId, status }) => ({
      sessionId,
      state: (isSessionPast(day, sessionId, now) ? "past" : status === "full" ? "full" : "open") as SlotState,
    }));
  const firstOpen = (day: Date) => slots(day).find((s) => s.state === "open")?.sessionId ?? -1;

  const [selected, setSelected] = useState(minDate);
  const [weekStart, setWeekStart] = useState(startOfWeek(minDate));
  const [sessionId, setSessionId] = useState(() => firstOpen(minDate));
  const [participants, setParticipants] = useState(1);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(minDate));

  const isSelectable = (d: Date) => toIsoDate(d) >= toIsoDate(minDate) && toIsoDate(d) <= toIsoDate(maxDate) && !isClosedDay(toIsoDate(d));

  const selectDate = (d: Date) => {
    setSelected(d);
    setWeekStart(startOfWeek(d));
    setSessionId(firstOpen(d));
    setCalendarMonth(startOfMonth(d));
  };
  const shiftWeek = (direction: 1 | -1) => {
    const nextWeek = addDays(weekStart, 7 * direction);
    const target = toIsoDate(nextWeek) < toIsoDate(minDate) ? minDate : nextWeek;
    // land on the first open day of that week
    selectDate(Array.from({ length: 6 }, (_, i) => addDays(startOfWeek(target), i)).find(isSelectable) ?? target);
  };

  const prevWeekDisabled = toIsoDate(weekStart) <= toIsoDate(startOfWeek(minDate));
  const nextWeekDisabled = toIsoDate(addDays(weekStart, 7)) > toIsoDate(maxDate);
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
  const daySlots = slots(selected);

  const selection: SessionSelection = { mode: "session", date: toIsoDate(selected), sessionId, participants };
  const error = sessionId < 0 ? "sessionRequired" : validateSelection(selection, original, now);

  const rows = text.summaryRows;
  const summary: [string, string][] = [
    [rows.room, f.name],
    [rows.day, dayLabel(selection.date, locale, true)],
    [rows.session, sessionId >= 0 ? sessionLabel(sessionId, locale) : "-"],
    [rows.people, String(participants)],
    [rows.permission, FACILITY_TEXT[locale].statuses[f.level]],
  ];

  /* ------- month calendar ------- */
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1, 12)).filter(
    (d) => d.getDay() !== 0,
  );
  const leadingBlanks = monthDays.length ? weekdayIndex(monthDays[0]) : 0;
  const prevMonthDisabled = toIsoDate(calendarMonth) <= toIsoDate(startOfMonth(minDate));
  const nextMonthDisabled = toIsoDate(addMonths(calendarMonth, 1)) > toIsoDate(maxDate);

  return (
    <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col items-start gap-[18px]">
        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[52px]">{t.title}</h1>
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

        {/* Month calendar (jump further ahead) */}
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
                        : isSameDay(d, today)
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
            <p className="mt-3 text-[12px] text-ink-muted">{t.calendarNote(MAX_MONTHS_AHEAD)}</p>
          </div>
        )}

        {/* Days (Mon–Sat of the selected week): one radio group */}
        <div role="radiogroup" aria-label={t.chooseDay} data-nav-root className="grid w-full grid-cols-3 gap-[10px] sm:grid-cols-6">
          {weekDays.map((d, i) => {
            const isSelected = isSameDay(d, selected);
            const selectable = isSelectable(d);
            return (
              <button
                key={toIsoDate(d)}
                type="button"
                role="radio"
                data-nav
                aria-checked={isSelected}
                aria-disabled={!selectable || undefined}
                aria-label={dayLabel(toIsoDate(d), locale, true)}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => selectable && selectDate(d)}
                onKeyDown={(e) => {
                  const next = moveFocus(e, 1);
                  if (next !== null && isSelectable(weekDays[next])) selectDate(weekDays[next]);
                }}
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

        {/* Sessions: one radio group, full / past sessions are aria-disabled */}
        <h2 className={SECTION_TITLE}>{t.sessionsTitle}</h2>
        <div role="radiogroup" aria-label={t.chooseSession} data-nav-root className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {daySlots.map(({ sessionId: id, state }, i) => {
            const label = sessionLabel(id, locale);
            const blocked = state !== "open";
            const isSelected = id === sessionId && !blocked;
            const caption = state === "full" ? t.sessionState.full : state === "past" ? t.sessionState.past : isSelected ? t.sessionState.selected : t.sessionState.free;
            const tabStop = sessionId >= 0 ? isSelected : i === 0;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                data-nav
                aria-checked={isSelected}
                aria-disabled={blocked || undefined}
                tabIndex={tabStop ? 0 : -1}
                onClick={() => !blocked && setSessionId(id)}
                onKeyDown={(e) => {
                  const next = moveFocus(e, 2);
                  if (next !== null && daySlots[next].state === "open") setSessionId(daySlots[next].sessionId);
                }}
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

        {/* Participants */}
        <h2 className={SECTION_TITLE}>{t.peopleTitle}</h2>
        <QuantityStepper
          value={participants}
          max={capacity}
          onChange={setParticipants}
          labels={{ decrease: t.decrease, increase: t.increase, value: t.peopleTitle }}
        />
        <p className="text-[13px] font-bold text-ink-muted-on-page">{t.max(capacity)}</p>
      </div>

      {/* Draft summary */}
      <aside className={`${ASIDE} gap-[2px]`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.draftTitle}</h2>
          <CategoryBadge category={f.category} />
        </div>
        <SummaryRows rows={summary} />
        <ContinueButton
          href={error ? null : `/catalog/${f.id}/request?${toSelectionQuery(selection)}`}
          label={t.continue}
          error={sessionId < 0 ? t.noSessionLeft : error ? text.scheduleErrors[error] : null}
        />
      </aside>
    </div>
  );
}
