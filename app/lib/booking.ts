// app/lib/booking.ts
//
// Booking rules, the schedule selection (one type per booking mode), its validation, and the URL contract
// between the request steps (Jadwal → Ajukan → (Pratinjau surat) → Ringkasan). See toSelectionQuery().

import type { Locale } from "@/app/i18n/locale";
import { bookingMode, maxDays, maxHours, maxQuantity, type Facility } from "@/app/data/facilities";
import { getDailyAvailability, getHourAvailability, isClosedDay } from "@/app/data/availability";
import { addDays, addMonths, diffInDays, parseIsoDate, toIsoDate, toNoon } from "./date";

/** Rooms are booked per hour inside the service hours: a booking is start hour → end hour (08 → 10 = 08.00–10.00). */
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 17;
/** Every hour a booking can start at: 8 … 16. */
export const BOOKABLE_HOURS: readonly number[] = Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => OPEN_HOUR + i);
/** End of the pick-up window ("kapan saja 08.00–16.00"); after this, today can no longer be a pick-up day. */
const PICKUP_CLOSING_HOUR = 16;

/** How far ahead a schedule can be viewed or booked (months). */
export const MAX_MONTHS_AHEAD = 6;

/** sessionStorage key for the submitted request (read by the summary page). */
export const REQUEST_STORAGE_KEY = "pinjamtedi:pengajuan";

const REQUEST_CODE_PATTERN = /^PJM-\d{4}-\d{4}$/;

/** "08.00" (Indonesian) or "08:00" (English) */
export const hourLabel = (hour: number, locale: Locale = "id") => `${String(hour).padStart(2, "0")}${locale === "en" ? ":" : "."}00`;

/** "08.00 – 10.00" */
export const timeRangeLabel = (start: number, end: number, locale: Locale = "id") => `${hourLabel(start, locale)} – ${hourLabel(end, locale)}`;

/** Today, or the next working day when today is Sunday or the last bookable hour (16.00) has started. */
export function firstBookableDate(now: Date) {
  let d = toNoon(now);
  if (now.getHours() >= CLOSE_HOUR - 1) d = addDays(d, 1);
  if (d.getDay() === 0) d = addDays(d, 1);
  return d;
}

/** First possible pick-up day: today until 16.00 (the counter stops handing out items), else tomorrow. */
export function firstPickupDate(now: Date) {
  const d = toNoon(now);
  return now.getHours() >= PICKUP_CLOSING_HOUR ? addDays(d, 1) : d;
}

/** Last day that can be booked (both modes). */
export const lastBookableDate = (now: Date) => addMonths(toNoon(now), MAX_MONTHS_AHEAD);

/** True when `hour` on `day` has already started (today only). */
export const isHourPast = (day: Date, hour: number, now: Date) =>
  toNoon(day).getTime() === toNoon(now).getTime() && now.getHours() >= hour;

/** SIMULATION. Replace with a code issued by the API. */
export function generateRequestCode(now = new Date()) {
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `PJM-${mmdd}-${Math.floor(Math.random() * 9000) + 1000}`;
}

/* ------------------------------- selection ------------------------------- */

/** "daily" facilities (equipment): pick-up day → return day, number of units. */
export type DailySelection = {
  mode: "daily";
  /** yyyy-mm-dd */
  pickupDate: string;
  /** yyyy-mm-dd, same day or later */
  returnDate: string;
  units: number;
};

/** "session" facilities (rooms): one day, a start and end hour (custom, max maxHours()), number of participants. */
export type SessionSelection = {
  mode: "session";
  /** yyyy-mm-dd */
  date: string;
  /** 8 … 16 (OPEN_HOUR … CLOSE_HOUR - 1) */
  startHour: number;
  /** 9 … 17, after startHour */
  endHour: number;
  participants: number;
};

export type BookingSelection = DailySelection | SessionSelection;

/** Why a selection is not valid (labels in BOOKING_TEXT.scheduleErrors). */
export type ScheduleErrorKey =
  | "pickupRequired"
  | "returnRequired"
  | "returnBeforePickup"
  | "tooLong"
  | "unavailableDay"
  | "unitsOverStock"
  | "dayRequired"
  | "timeRequired"
  | "timeTaken"
  | "tooLongHours"
  | "quantityRange"
  | "outOfRange"
  | "timePast";

/** Pick-up / return hours of "daily" loans (Figma 2.2: pick up any time 08.00–16.00, return before 16.00). */
export const PICKUP_HOURS = "08.00–16.00";
export const RETURN_BEFORE = "16.00";

/** Days in a daily loan, both ends included (26 → 28 Okt = 3). */
export const loanDays = (s: Pick<DailySelection, "pickupDate" | "returnDate">) => {
  const a = parseIsoDate(s.pickupDate);
  const b = parseIsoDate(s.returnDate);
  return a && b ? diffInDays(b, a) + 1 : 0;
};

/** Every yyyy-mm-dd from `from` to `to`, both included. */
export function datesBetween(from: string, to: string) {
  const start = parseIsoDate(from);
  const end = parseIsoDate(to);
  if (!start || !end || to < from) return [];
  return Array.from({ length: diffInDays(end, start) + 1 }, (_, i) => toIsoDate(addDays(start, i)));
}

/**
 * Units free for the whole loan (the stock that can be requested). Closed days in the middle (Sunday, holiday)
 * do not count: the item simply stays with the borrower while the counter is closed.
 */
export const unitsFreeBetween = (facilityId: string, from: string, to: string) => {
  const open = datesBetween(from, to).map((d) => getDailyAvailability(facilityId, d)).filter((a) => a.level !== "closed");
  return open.length ? Math.min(...open.map((a) => a.units)) : 0;
};

/** Can the loan start / end on this day? (counter open and the item not sold out) */
export const isHandoverDay = (facilityId: string, date: string) => getDailyAvailability(facilityId, date).units > 0;

/**
 * Checks a selection against the facility rules and the availability data. null = valid.
 * "daily": pick-up from firstPickupDate(), return the same day or later, at most maxDays calendar days
 * (closed days in the middle count but are allowed), pick-up and return day open and not sold out,
 * no sold-out day in between, units ≤ the stock for the whole loan.
 * "session": a day from firstBookableDate(), not closed, start < end inside 08.00–17.00, at most maxHours(),
 * not started yet (today), every hour free, participants ≤ capacity.
 */
export function validateSelection(s: BookingSelection, f: Facility, now: Date = new Date()): ScheduleErrorKey | null {
  if (s.mode !== bookingMode(f)) return s.mode === "daily" ? "dayRequired" : "pickupRequired";
  const last = toIsoDate(lastBookableDate(now));
  if (s.mode === "daily") {
    if (!parseIsoDate(s.pickupDate)) return "pickupRequired";
    if (s.pickupDate < toIsoDate(firstPickupDate(now)) || s.pickupDate > last) return "outOfRange";
    if (!parseIsoDate(s.returnDate)) return "returnRequired";
    if (s.returnDate < s.pickupDate) return "returnBeforePickup";
    if (loanDays(s) > maxDays(f)) return "tooLong";
    if (!isHandoverDay(f.id, s.pickupDate) || !isHandoverDay(f.id, s.returnDate)) return "unavailableDay";
    if (datesBetween(s.pickupDate, s.returnDate).some((d) => getDailyAvailability(f.id, d).level === "out")) return "unavailableDay";
    if (!Number.isInteger(s.units) || s.units < 1 || s.units > unitsFreeBetween(f.id, s.pickupDate, s.returnDate)) return "unitsOverStock";
    return null;
  }
  if (!parseIsoDate(s.date)) return "dayRequired";
  if (s.date < toIsoDate(firstBookableDate(now)) || s.date > last) return "outOfRange";
  if (isClosedDay(s.date)) return "unavailableDay";
  if (!Number.isInteger(s.startHour) || !Number.isInteger(s.endHour) || s.startHour < OPEN_HOUR || s.endHour > CLOSE_HOUR || s.endHour <= s.startHour)
    return "timeRequired";
  if (s.endHour - s.startHour > maxHours(f)) return "tooLongHours";
  if (isHourPast(parseIsoDate(s.date)!, s.startHour, now)) return "timePast";
  const hours = getHourAvailability(f.id, s.date);
  for (let h = s.startHour; h < s.endHour; h++) if (hours.find((x) => x.hour === h)?.status !== "free") return "timeTaken";
  if (!Number.isInteger(s.participants) || s.participants < 1 || s.participants > maxQuantity(f)) return "quantityRange";
  return null;
}

/* ------------------------------ URL contract ------------------------------ */

/**
 * The selection travels in the query string between Jadwal → Ajukan → (Pratinjau surat) → Ringkasan:
 *   daily:   ?ambil=2026-10-26&kembali=2026-10-28&jumlah=1
 *   session: ?hari=2026-10-26&mulai=8&selesai=10&jumlah=120  (hours: 08.00–10.00)
 * plus &kode=PJM-… on Ringkasan. Names stay Indonesian (public URLs).
 */
export function toSelectionQuery(s: BookingSelection, code?: string) {
  const params =
    s.mode === "daily"
      ? new URLSearchParams({ ambil: s.pickupDate, kembali: s.returnDate, jumlah: String(s.units) })
      : new URLSearchParams({ hari: s.date, mulai: String(s.startHour), selesai: String(s.endHour), jumlah: String(s.participants) });
  if (code) params.set("kode", code);
  return params.toString();
}

/** Reads the selection for this facility's mode and validates it. null when missing or not valid. */
export function parseSelectionQuery(params: URLSearchParams, f: Facility): BookingSelection | null {
  const quantity = Number(params.get("jumlah"));
  const selection: BookingSelection =
    bookingMode(f) === "daily"
      ? { mode: "daily", pickupDate: params.get("ambil") ?? "", returnDate: params.get("kembali") ?? "", units: quantity }
      : { mode: "session", date: params.get("hari") ?? "", startHour: Number(params.get("mulai") ?? "-1"), endHour: Number(params.get("selesai") ?? "-1"), participants: quantity };
  return validateSelection(selection, f) ? null : selection;
}

/**
 * The submitted request on the Summary: a valid ?kode= plus a selection of the right SHAPE (real dates, return
 * not before pick-up, session index, positive quantity). It is not checked against today or the availability
 * again: the request was valid when it was sent, and the Summary must still open tomorrow or after 16.00.
 */
export function parseSubmittedQuery(params: URLSearchParams, f: Facility) {
  const code = params.get("kode") ?? "";
  if (!REQUEST_CODE_PATTERN.test(code)) return null;
  const quantity = Number(params.get("jumlah"));
  if (!Number.isInteger(quantity) || quantity < 1) return null;
  if (bookingMode(f) === "daily") {
    const pickupDate = params.get("ambil") ?? "";
    const returnDate = params.get("kembali") ?? "";
    if (!parseIsoDate(pickupDate) || !parseIsoDate(returnDate) || returnDate < pickupDate) return null;
    return { code, selection: { mode: "daily", pickupDate, returnDate, units: quantity } as BookingSelection };
  }
  const date = params.get("hari") ?? "";
  const startHour = Number(params.get("mulai") ?? "-1");
  const endHour = Number(params.get("selesai") ?? "-1");
  if (!parseIsoDate(date) || !Number.isInteger(startHour) || !Number.isInteger(endHour) || startHour < OPEN_HOUR || endHour > CLOSE_HOUR || endHour <= startHour)
    return null;
  return { code, selection: { mode: "session", date, startHour, endHour, participants: quantity } as BookingSelection };
}

/** First day of the selection (pick-up day / session day), yyyy-mm-dd. */
export const selectionStart = (s: BookingSelection) => (s.mode === "daily" ? s.pickupDate : s.date);
