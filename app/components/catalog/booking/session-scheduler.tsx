// app/components/catalog/booking/session-scheduler.tsx
//
// "Pilih jadwal" for "session" facilities (rooms), in two steps on the same page (Figma 3.2a / 3.2b):
//   1. Day  (/catalog/[id]/schedule):          one week (Mon–Sun, ‹ › by week). Each day's cell is colored by how
//      many hours are still free (many / few / full / closed) and says "n jam". "Lanjut pilih jam" → ?hari=.
//   2. Time (/catalog/[id]/schedule?hari=…):  the day's hours 08.00–17.00 top to bottom. Click the start hour,
//      then the end hour (custom, up to maxHours()). Booked / pending / past hours cannot be chosen.
//      Right column: "Jumlah peserta", then the summary with "Lanjut isi data" → /request?hari=&mulai=&selesai=&jumlah=.
// The step lives in the URL, so the browser back button returns from the hours to the days.
// Availability: getHourAvailability() (app/data/availability.ts). Rules: validateSelection(). Text: BOOKING_TEXT.schedule.

"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import { UI_ICONS, illustrationFrame } from "@/app/design/icon-map";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import { getHourAvailability, isClosedDay, type HourStatus } from "@/app/data/availability";
import { maxHours, maxQuantity } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { useLocale } from "@/app/components/layout/language";
import {
  BOOKABLE_HOURS,
  MAX_MONTHS_AHEAD,
  firstBookableDate,
  isHourPast,
  timeRangeLabel,
  toSelectionQuery,
  validateSelection,
  type SessionSelection,
} from "@/app/lib/booking";
import { addDays, addMonths, dateNames, isSameDay, parseIsoDate, startOfWeek, toIsoDate, toNoon } from "@/app/lib/date";
import { ASIDE, ContinueButton, PRIMARY_BUTTON, QuantityStepper, SummaryRows, moveFocus } from "./parts";
import { dayLabel } from "./describe";
import type { SchedulerProps } from "./registry";

const CONTROL =
  "inline-flex size-9 items-center justify-center rounded-[10px] border-2 border-line-strong bg-surface text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";
const CARD = "rounded-[20px] border-2 border-line-strong bg-surface p-4 shadow-[5px_5px_0_0_var(--color-shadow)] sm:p-6";
const TITLE = "font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[52px]";
/** a day with this many free hours or more counts as "many" */
const MANY_HOURS = 5;

type DayLevel = "many" | "few" | "full" | "closed";
/** One look per day state; the same colors as the daily calendar (free = green, few = orange, none = gray + red text). */
const DAY_CELL: Record<DayLevel, string> = {
  many: "border-line-strong bg-status-available-bg text-status-available-fg hover:-translate-y-0.5",
  few: "border-line-strong bg-status-attention-bg text-status-attention-fg hover:-translate-y-0.5",
  full: "cursor-not-allowed border-line bg-status-unavailable-bg text-stock-out-fg",
  closed: "cursor-not-allowed border-line bg-status-unavailable-bg text-ink-muted",
};
const SELECTED_CELL = "border-line-strong bg-brand-secondary text-on-secondary shadow-[0_4px_0_0_var(--color-shadow)]";
const LEGEND_SWATCH: Record<DayLevel | "selected", string> = {
  many: "bg-status-available-bg",
  few: "bg-status-attention-bg",
  full: "bg-status-unavailable-bg",
  selected: "bg-brand-secondary",
  closed: "bg-status-unavailable-bg opacity-60",
};

type HourState = HourStatus | "past";
const HOUR_ROW: Record<HourState, string> = {
  free: "bg-surface text-ink hover:bg-status-available-bg",
  taken: "cursor-not-allowed bg-status-unavailable-bg text-stock-out-fg",
  pending: "cursor-not-allowed bg-status-pending-bg text-status-pending-fg",
  past: "cursor-not-allowed bg-status-unavailable-bg text-ink-muted",
};

function weekTitle(weekStart: Date, today: Date, locale: Locale) {
  const { months, monthsShort } = dateNames(locale);
  const last = addDays(weekStart, 6);
  const range =
    weekStart.getMonth() === last.getMonth()
      ? `${weekStart.getDate()} – ${last.getDate()} ${months[last.getMonth()]} ${last.getFullYear()}`
      : `${weekStart.getDate()} ${monthsShort[weekStart.getMonth()]} – ${last.getDate()} ${monthsShort[last.getMonth()]} ${last.getFullYear()}`;
  return `${isSameDay(weekStart, startOfWeek(today)) ? BOOKING_TEXT[locale].schedule.thisWeek : ""}${range}`;
}

export default function SessionScheduler({ facility: original, now }: SchedulerProps) {
  const { locale } = useLocale();
  const pathname = usePathname();
  const params = useSearchParams();
  const f = localizeFacility(original, locale);
  const t = BOOKING_TEXT[locale].schedule;

  const minIso = toIsoDate(firstBookableDate(now));
  const maxIso = toIsoDate(addMonths(toNoon(now), MAX_MONTHS_AHEAD));

  /** each bookable hour of a day: free / taken / pending, or past (today) */
  const hoursOf = (iso: string) => {
    const day = parseIsoDate(iso)!;
    return getHourAvailability(f.id, iso).map(({ hour, status }) => ({ hour, state: (isHourPast(day, hour, now) ? "past" : status) as HourState }));
  };
  const freeCount = (iso: string) => hoursOf(iso).filter((h) => h.state === "free").length;
  const levelOf = (iso: string): DayLevel => {
    if (iso < minIso || iso > maxIso || isClosedDay(iso)) return "closed";
    const n = freeCount(iso);
    return n === 0 ? "full" : n >= MANY_HOURS ? "many" : "few";
  };
  const selectable = (iso: string) => levelOf(iso) === "many" || levelOf(iso) === "few";

  const chosenDay = params.get("hari");
  const dayStep = !chosenDay || !selectable(chosenDay);

  const [day, setDay] = useState<string | null>(() =>
    chosenDay && selectable(chosenDay)
      ? chosenDay
      : (Array.from({ length: 21 }, (_, i) => toIsoDate(addDays(parseIsoDate(minIso)!, i))).find(selectable) ?? null),
  );
  const [weekStart, setWeekStart] = useState(() => startOfWeek(parseIsoDate(day ?? minIso)!));
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);
  const [participants, setParticipants] = useState(1);

  const capacity = maxQuantity(original);
  const limit = maxHours(original);
  const frame = illustrationFrame(f.illustration);
  const rows = BOOKING_TEXT[locale].summaryRows;
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;

  const goToTime = (iso: string) => {
    setStart(null);
    setEnd(null);
    // native history: no server round trip; Next syncs useSearchParams, and Back returns to the days
    window.history.pushState(null, "", `${pathname}?hari=${iso}`);
    window.scrollTo({ top: 0 });
  };

  const draft = (time: string) => (
    <div className="mt-4 flex items-center gap-4">
      <span className={`flex size-[72px] shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong ${CATEGORY_STYLE[f.category].panel}`}>
        <FacilityIllustration id={f.illustration} size={frame} className="size-[54px]" />
      </span>
      <span className="flex min-w-0 flex-col gap-1 leading-[normal]">
        <span className="font-display text-[20px] text-ink">{f.name}</span>
        <span className="text-[13px] text-ink-muted">{time}</span>
      </span>
    </div>
  );

  /* ------------------------------------ step 1: day ------------------------------------ */
  if (dayStep) {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const prevDisabled = toIsoDate(weekStart) <= minIso;
    const nextDisabled = toIsoDate(addDays(weekStart, 7)) > maxIso;
    const names = dateNames(locale);
    const tabStop = days.map(toIsoDate).find((iso) => iso === day) ?? days.map(toIsoDate).find(selectable);

    return (
      <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
          <div className="flex flex-col gap-2">
            <h1 className={TITLE}>{t.dayTitle}</h1>
            <p className="text-[16px] text-ink-body sm:text-[17px]">{t.dayLead}</p>
          </div>

          <section aria-label={t.calendarLabel} className={CARD}>
            <div className="flex items-center justify-between gap-3">
              <h2 aria-live="polite" className="font-display text-[20px] font-normal leading-[normal] text-ink">
                {weekTitle(weekStart, toNoon(now), locale)}
              </h2>
              <div className="flex gap-2">
                <button type="button" aria-label={t.prevWeek} disabled={prevDisabled} onClick={() => setWeekStart(addDays(weekStart, -7))} className={CONTROL}>
                  <PrevIcon size={16} strokeWidth={2.5} aria-hidden />
                </button>
                <button type="button" aria-label={t.nextWeek} disabled={nextDisabled} onClick={() => setWeekStart(addDays(weekStart, 7))} className={CONTROL}>
                  <NextIcon size={16} strokeWidth={2.5} aria-hidden />
                </button>
              </div>
            </div>

            <div role="radiogroup" aria-label={t.calendarLabel} data-nav-root className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2.5">
              {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
                <span key={wd} aria-hidden className="pb-1 text-center text-[12px] font-bold text-ink-muted sm:text-[13px]">
                  {names.daysShort[wd]}
                </span>
              ))}
              {days.map((d) => {
                const iso = toIsoDate(d);
                const level = levelOf(iso);
                const outOfRange = iso < minIso || iso > maxIso;
                const isSelected = iso === day;
                const caption = isSelected
                  ? t.selected
                  : outOfRange
                    ? ""
                    : level === "closed"
                      ? t.closed
                      : t.hoursLeft(level === "full" ? 0 : freeCount(iso));
                return (
                  <button
                    key={iso}
                    type="button"
                    role="radio"
                    data-nav
                    aria-checked={isSelected}
                    aria-disabled={!selectable(iso) || undefined}
                    aria-label={[dayLabel(iso, locale, true), caption].filter(Boolean).join(", ")}
                    tabIndex={iso === tabStop ? 0 : -1}
                    onClick={() => selectable(iso) && setDay(iso)}
                    onDoubleClick={() => selectable(iso) && goToTime(iso)}
                    onKeyDown={(e) => {
                      const next = moveFocus(e, 7);
                      if (next !== null && selectable(toIsoDate(days[next]))) setDay(toIsoDate(days[next]));
                      if (e.key === "Enter" && selectable(iso)) goToTime(iso);
                    }}
                    className={[
                      "flex h-[64px] flex-col items-center justify-center gap-[4px] rounded-[12px] border-2 leading-none transition-transform sm:h-[76px]",
                      isSelected ? SELECTED_CELL : DAY_CELL[level],
                      outOfRange ? "opacity-50" : "",
                    ].join(" ")}
                  >
                    <span className="font-display text-[20px] sm:text-[24px]">{d.getDate()}</span>
                    <span className="text-center text-[10px] font-extrabold leading-tight sm:text-[12px]">{caption}</span>
                  </button>
                );
              })}
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-ink-muted sm:text-[13px]">
              {(["many", "few", "full", "selected", "closed"] as const).map((key) => (
                <li key={key} className="flex items-center gap-[6px]">
                  <span aria-hidden className={`size-3.5 rounded-[4px] border-[1.5px] border-line-strong ${LEGEND_SWATCH[key]}`} />
                  {t.dayLegend[key]}
                </li>
              ))}
            </ul>
          </section>
          <p className="text-[13px] font-bold text-ink-muted-on-page">{t.bookingNote}</p>
        </div>

        <aside className={ASIDE}>
          <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.draftTitle}</h2>
          {draft(t.timeLead(capacity))}
          <div className="mt-4 rounded-[14px] bg-surface-field px-4 py-1">
            <SummaryRows
              divided
              rows={[
                [rows.day, day ? dayLabel(day, locale, true) : "-"],
                [rows.session, t.timeNotChosen],
                [rows.permission, FACILITY_TEXT[locale].statuses[f.level]],
              ]}
            />
          </div>
          {f.level === "letter" && <p className="mt-4 text-[12px] leading-[1.5] text-ink-muted">{t.letterNote}</p>}
          {day ? (
            <button
              type="button"
              onClick={() => goToTime(day)}
              className={`${PRIMARY_BUTTON} mt-4 bg-brand-primary text-on-primary shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]`}
            >
              {t.continueToTime}
              <NextIcon size={18} strokeWidth={2.5} aria-hidden />
            </button>
          ) : (
            <ContinueButton href={null} label={t.continueToTime} error={BOOKING_TEXT[locale].scheduleErrors.dayRequired} />
          )}
        </aside>
      </div>
    );
  }

  /* ------------------------------------ step 2: time ------------------------------------ */
  const iso = chosenDay;
  const hours = hoursOf(iso);
  const stateAt = (h: number) => hours.find((x) => x.hour === h)?.state ?? "taken";
  /** start → h is all free and not longer than the limit */
  const canEndAt = (h: number) =>
    start !== null && h >= start && h + 1 - start <= limit && BOOKABLE_HOURS.filter((x) => x >= start && x <= h).every((x) => stateAt(x) === "free");
  const pickingEnd = start !== null && end === start + 1;

  const choose = (h: number) => {
    if (stateAt(h) !== "free") return;
    if (start !== null && pickingEnd && h > start && canEndAt(h)) {
      setEnd(h + 1);
      return;
    }
    setStart(h);
    setEnd(h + 1);
  };

  const selection: SessionSelection | null =
    start !== null && end !== null ? { mode: "session", date: iso, startHour: start, endHour: end, participants } : null;
  const error = selection ? validateSelection(selection, original, now) : "timeRequired";
  const range = selection ? timeRangeLabel(selection.startHour, selection.endHour, locale) : null;
  const length = selection ? selection.endHour - selection.startHour : 0;
  const noFree = hours.every((h) => h.state !== "free");

  return (
    <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <h1 className={TITLE}>{t.timeTitle}</h1>
          <p className="text-[16px] text-ink-body sm:text-[17px]">{t.timeLead(capacity)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-full border-2 border-line-strong bg-brand-secondary px-4 py-1.5 text-[14px] font-extrabold text-on-secondary">
            {t.chosenDay(dayLabel(iso, locale, true))}
          </span>
          <button
            type="button"
            onClick={() => window.history.pushState(null, "", pathname)}
            className="text-[14px] font-extrabold text-link underline underline-offset-4"
          >
            {t.changeDay}
          </button>
        </div>

        <section aria-label={t.timeCardTitle} className={CARD}>
          <h2 className="font-display text-[22px] font-normal leading-[normal] text-ink">{t.timeCardTitle}</h2>
          <p aria-live="polite" className="mt-1 text-[13px] text-ink-body">
            {t.timeHelp(limit)}
          </p>

          {noFree ? (
            <p role="status" className="mt-4 rounded-[14px] bg-status-unavailable-bg px-4 py-3 text-[14px] font-bold text-stock-out-fg">
              {t.noTimeLeft}
            </p>
          ) : (
            <ol data-nav-root className="mt-4 flex flex-col overflow-hidden rounded-[14px] border-2 border-line-strong">
              {hours.map(({ hour, state }, i) => {
                const inRange = selection !== null && hour >= selection.startHour && hour < selection.endHour;
                const unreachable = pickingEnd && state === "free" && hour > start! && !canEndAt(hour);
                const label = timeRangeLabel(hour, hour + 1, locale);
                const caption = inRange ? t.selected : t.hourState[state];
                const firstFree = hours.find((x) => x.state === "free")?.hour;
                return (
                  <li key={hour} className={i > 0 ? "border-t-2 border-line" : ""}>
                    <button
                      type="button"
                      data-nav
                      aria-pressed={inRange}
                      aria-disabled={state !== "free" || undefined}
                      aria-label={`${label}, ${caption}`}
                      tabIndex={(selection ? hour === selection.startHour : hour === firstFree) ? 0 : -1}
                      onClick={() => choose(hour)}
                      onKeyDown={(e) => moveFocus(e, 1)}
                      className={[
                        "flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors sm:px-5",
                        inRange ? "bg-brand-secondary text-on-secondary" : HOUR_ROW[state],
                        unreachable ? "opacity-50" : "",
                      ].join(" ")}
                    >
                      <span className="font-display text-[18px] sm:text-[20px]">{label}</span>
                      <span className="text-[12px] font-extrabold sm:text-[13px]">{caption}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {selection && (
            <p aria-live="polite" className="mt-3 text-[14px] font-extrabold text-ink">
              {t.selectedRange(range!, length)}
            </p>
          )}
        </section>
      </div>

      <div className="flex w-full flex-col gap-5 lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0">
        <section className={`${ASIDE} !static !w-full`}>
          <h2 className="font-display text-[22px] font-normal leading-[normal] text-ink">{t.peopleTitle}</h2>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] font-bold text-ink-muted">{t.max(capacity)}</p>
            <QuantityStepper
              value={participants}
              max={capacity}
              onChange={setParticipants}
              labels={{ decrease: t.decrease, increase: t.increase, value: t.peopleTitle }}
            />
          </div>
        </section>

        <aside className={`${ASIDE} !static !w-full`}>
          <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.draftTitle}</h2>
          {draft(range ? t.hoursValue(range, length) : t.timeLead(capacity))}
          <div className="mt-4 rounded-[14px] bg-surface-field px-4 py-1">
            <SummaryRows
              divided
              rows={[
                [rows.day, dayLabel(iso, locale, true)],
                [rows.session, range ? t.hoursValue(range, length) : "-"],
                [rows.people, FACILITY_TEXT[locale].quantity(participants, f.unit)],
                [rows.permission, FACILITY_TEXT[locale].statuses[f.level]],
              ]}
            />
          </div>
          {f.level === "letter" && <p className="mt-4 text-[12px] leading-[1.5] text-ink-muted">{t.letterNote}</p>}
          <ContinueButton
            href={selection && !error ? `/catalog/${f.id}/request?${toSelectionQuery(selection)}` : null}
            label={t.continue}
            error={error ? BOOKING_TEXT[locale].scheduleErrors[error] : null}
            icon={<NextIcon size={18} strokeWidth={2.5} aria-hidden />}
          />
        </aside>
      </div>
    </div>
  );
}
