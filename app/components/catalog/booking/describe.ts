// app/components/catalog/booking/describe.ts
//
// Turns a schedule selection into display text, one set of functions per booking mode.
// Wired into BOOKING_MODES (registry.tsx); call them through the registry, not directly.

import { formatTimeRange } from "@/app/i18n/common";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT, type FacilityView } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { PICKUP_HOURS, RETURN_BEFORE, loanDays, sessionEnd, sessionLabel, sessionStart, type DailySelection, type SessionSelection } from "@/app/lib/booking";
import { dateNames, formatShortDate, parseIsoDate } from "@/app/lib/date";

export type Rows = (readonly [label: string, value: string])[];

/** Dates and times of the loan for the permission letter (Indonesian times, "08.00"). */
export type LetterPeriod = { from: string; fromTime: string; until: string; untilTime: string };

/** "Sen, 26 Okt" (or with the year: "Sen, 26 Okt 2026") */
export function dayLabel(iso: string, locale: Locale, withYear = false) {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  if (withYear) return formatShortDate(d, locale);
  const n = dateNames(locale);
  return `${n.daysShort[d.getDay()]}, ${d.getDate()} ${n.monthsShort[d.getMonth()]}`;
}

const time = (value: string, locale: Locale) => formatTimeRange(value, locale);

/* --------------------------------- daily --------------------------------- */

/** A loan over New Year ("Rab, 30 Des → Sen, 4 Jan") shows the years, so the dates are not ambiguous. */
const yearsDiffer = (s: DailySelection) => s.pickupDate.slice(0, 4) !== s.returnDate.slice(0, 4);

export const dailyRows = (s: DailySelection, f: FacilityView, locale: Locale): Rows => {
  const t = BOOKING_TEXT[locale];
  return [
    [t.summaryRows.pickup, t.pickupValue(dayLabel(s.pickupDate, locale, yearsDiffer(s)), time(PICKUP_HOURS, locale))],
    [t.summaryRows.return, t.returnValue(dayLabel(s.returnDate, locale, yearsDiffer(s)), time(RETURN_BEFORE, locale))],
    [t.summaryRows.quantity, FACILITY_TEXT[locale].quantity(s.units, f.unit)],
  ];
};

export const dailyLine = (s: DailySelection, f: FacilityView, locale: Locale) =>
  [
    `${dayLabel(s.pickupDate, locale, yearsDiffer(s))} – ${dayLabel(s.returnDate, locale, yearsDiffer(s))}`,
    BOOKING_TEXT[locale].daily.loanMeta(loanDays(s), FACILITY_TEXT[locale].quantity(s.units, f.unit)),
  ].join(" · ");

/** last "Langkah berikutnya" item: when to pick it up */
export const dailyUseDetail = (s: DailySelection, locale: Locale) =>
  BOOKING_TEXT[locale].summary.pickUpWhen(dayLabel(s.pickupDate, locale, yearsDiffer(s)), time(PICKUP_HOURS, locale));

/** "Kembalikan" step: return day and deadline */
export const dailyFinishDetail = (s: DailySelection, locale: Locale) =>
  BOOKING_TEXT[locale].summary.returnWhen(dayLabel(s.returnDate, locale, yearsDiffer(s)), time(RETURN_BEFORE, locale));

export const dailyLetterPeriod = (s: DailySelection): LetterPeriod => ({
  from: s.pickupDate,
  fromTime: PICKUP_HOURS.split("–")[0],
  until: s.returnDate,
  untilTime: RETURN_BEFORE,
});

/* -------------------------------- session -------------------------------- */

export const sessionRows = (s: SessionSelection, f: FacilityView, locale: Locale): Rows => {
  const t = BOOKING_TEXT[locale].summaryRows;
  return [
    [t.date, dayLabel(s.date, locale, true)],
    [t.session, sessionLabel(s.sessionId, locale)],
    [t.people, FACILITY_TEXT[locale].quantity(s.participants, f.unit)],
  ];
};

export const sessionLine = (s: SessionSelection, f: FacilityView, locale: Locale) =>
  [dayLabel(s.date, locale), sessionLabel(s.sessionId, locale), FACILITY_TEXT[locale].quantity(s.participants, f.unit)].join(" · ");

/** last "Langkah berikutnya" item: when the room is used */
export const sessionUseDetail = (s: SessionSelection, locale: Locale) => `${dayLabel(s.date, locale, true)}, ${sessionStart(s.sessionId, locale)}`;

/** "Selesai" step */
export const sessionFinishDetail = (_s: SessionSelection, locale: Locale) => BOOKING_TEXT[locale].summary.steps.afterSession;

export const sessionLetterPeriod = (s: SessionSelection): LetterPeriod => ({
  from: s.date,
  fromTime: sessionStart(s.sessionId),
  until: s.date,
  untilTime: sessionEnd(s.sessionId),
});
