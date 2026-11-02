// app/lib/date.ts
//
// Date helpers shared by the schedule, request, summary, and letter pages.
// Every date is normalized to 12:00 local time so adding days never trips over DST/timezone edges.
// Day and month names: the exported constants are Indonesian (default UI language, and the permission letter).
// For the English UI use dateNames("en") and pass the locale to the format helpers.

import type { Locale } from "@/app/i18n/locale";

/** Indexed by Date.getDay() (Sunday = 0). */
export const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
export const DAY_NAMES_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
/** Monday–Saturday, the days facilities are open (Sunday is closed). */
export const WORKDAY_NAMES_SHORT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;
export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"] as const;

type DateNames = {
  days: readonly string[];
  daysShort: readonly string[];
  workdaysShort: readonly string[];
  months: readonly string[];
  monthsShort: readonly string[];
};

const DATE_NAMES: Record<Locale, DateNames> = {
  id: { days: DAY_NAMES, daysShort: DAY_NAMES_SHORT, workdaysShort: WORKDAY_NAMES_SHORT, months: MONTH_NAMES, monthsShort: MONTH_NAMES_SHORT },
  en: {
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    workdaysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

/** Day / month names for a UI language. */
export const dateNames = (locale: Locale = "id") => DATE_NAMES[locale];

const MS_PER_DAY = 86_400_000;

export const toNoon = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return toNoon(x);
};

export const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, d.getDate(), 12);

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1, 12);

/** Monday of the week containing `d`. */
export const startOfWeek = (d: Date) => addDays(d, -weekdayIndex(d));

/** Monday = 0 … Saturday = 5, Sunday = 6. */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const diffInDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);

/** yyyy-mm-dd in local time. Strings in this format also compare correctly with < and >. */
export const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const isSameDay = (a: Date, b: Date) => toIsoDate(a) === toIsoDate(b);

/** Parses yyyy-mm-dd. Returns null for malformed or impossible dates (e.g. 2026-02-31). */
export function parseIsoDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], 12);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
}

/** "Sen, 2 Nov 2026" / "Mon, 2 Nov 2026" */
export function formatShortDate(d: Date, locale: Locale = "id") {
  const n = DATE_NAMES[locale];
  return `${n.daysShort[d.getDay()]}, ${d.getDate()} ${n.monthsShort[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Senin, 2 November 2026", or "2 November 2026" without the weekday (English: "Monday, 2 November 2026"). */
export function formatLongDate(d: Date, withWeekday = true, locale: Locale = "id") {
  const n = DATE_NAMES[locale];
  const date = `${d.getDate()} ${n.months[d.getMonth()]} ${d.getFullYear()}`;
  return withWeekday ? `${n.days[d.getDay()]}, ${date}` : date;
}
