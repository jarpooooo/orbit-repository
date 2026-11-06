// app/lib/booking.ts
//
// Booking rules, the schedule selection (one type per booking mode), its validation, and the URL contract
// between the request steps (Jadwal → Ajukan → (Pratinjau surat) → Ringkasan). See toSelectionQuery().

import type { Locale } from "@/app/i18n/locale";
import { bookingMode, maxDays, maxQuantity, type Facility } from "@/app/data/facilities";
import { getDailyAvailability, getSessionAvailability, isClosedDay } from "@/app/data/availability";
import { addDays, addMonths, diffInDays, parseIsoDate, toIsoDate, toNoon } from "./date";

export const SESSIONS = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"] as const;
export const SESSION_START_HOURS = [8, 10, 13, 15] as const;
/** End of the last session; after this, today can no longer be booked for a room. */
const CLOSING_HOUR = 17;
/** End of the pick-up window ("kapan saja 08.00–16.00"); after this, today can no longer be a pick-up day. */
const PICKUP_CLOSING_HOUR = 16;

/** How far ahead a schedule can be viewed or booked (months). */
export const MAX_MONTHS_AHEAD = 6;

/** sessionStorage key for the submitted request (read by the summary page). */
export const REQUEST_STORAGE_KEY = "pinjamtedi:pengajuan";

const REQUEST_CODE_PATTERN = /^PJM-\d{4}-\d{4}$/;

/** Session label for the UI: "08.00 – 10.00" (Indonesian) or "08:00 – 10:00" (English). */
export const sessionLabel = (index: number, locale: Locale = "id") =>
  locale === "en" ? SESSIONS[index].replaceAll(".", ":") : SESSIONS[index];

/** "08.00" from "08.00 – 10.00" ("08:00" in English). */
export const sessionStart = (index: number, locale: Locale = "id") => sessionLabel(index, locale).split("–")[0].trim();
export const sessionEnd = (index: number, locale: Locale = "id") => sessionLabel(index, locale).split("–")[1].trim();

/** Today, or the next working day when today is Sunday or already past closing time (room sessions). */
export function firstBookableDate(now: Date) {
  let d = toNoon(now);
  if (now.getHours() >= CLOSING_HOUR) d = addDays(d, 1);
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

/** True when the session on `day` has already started. */
export const isSessionPast = (day: Date, index: number, now: Date) =>
  toNoon(day).getTime() === toNoon(now).getTime() && now.getHours() >= SESSION_START_HOURS[index];

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

/** "session" facilities (rooms): one day, one 2-hour session, number of participants. */
export type SessionSelection = {
  mode: "session";
  /** yyyy-mm-dd */
  date: string;
  /** index into SESSIONS */
  sessionId: number;
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
  | "sessionRequired"
  | "sessionFull"
  | "quantityRange"
  | "outOfRange"
  | "sessionPast";

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
 * "session": a day from firstBookableDate(), not closed, a free session the room offers, participants ≤ capacity.
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
  const slot = getSessionAvailability(f.id, s.date).find((x) => x.sessionId === s.sessionId);
  if (!slot) return "sessionRequired";
  const day = parseIsoDate(s.date)!;
  if (isSessionPast(day, s.sessionId, now)) return "sessionPast";
  if (slot.status === "full") return "sessionFull";
  if (!Number.isInteger(s.participants) || s.participants < 1 || s.participants > maxQuantity(f)) return "quantityRange";
  return null;
}

/* ------------------------------ URL contract ------------------------------ */

/**
 * The selection travels in the query string between Jadwal → Ajukan → (Pratinjau surat) → Ringkasan:
 *   daily:   ?ambil=2026-10-26&kembali=2026-10-28&jumlah=1
 *   session: ?hari=2026-10-26&sesi=0&jumlah=120
 * plus &kode=PJM-… on Ringkasan. Names stay Indonesian (public URLs).
 */
export function toSelectionQuery(s: BookingSelection, code?: string) {
  const params =
    s.mode === "daily"
      ? new URLSearchParams({ ambil: s.pickupDate, kembali: s.returnDate, jumlah: String(s.units) })
      : new URLSearchParams({ hari: s.date, sesi: String(s.sessionId), jumlah: String(s.participants) });
  if (code) params.set("kode", code);
  return params.toString();
}

/** Reads the selection for this facility's mode and validates it. null when missing or not valid. */
export function parseSelectionQuery(params: URLSearchParams, f: Facility): BookingSelection | null {
  const quantity = Number(params.get("jumlah"));
  const selection: BookingSelection =
    bookingMode(f) === "daily"
      ? { mode: "daily", pickupDate: params.get("ambil") ?? "", returnDate: params.get("kembali") ?? "", units: quantity }
      : { mode: "session", date: params.get("hari") ?? "", sessionId: Number(params.get("sesi") ?? "-1"), participants: quantity };
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
  const sessionId = Number(params.get("sesi") ?? "-1");
  if (!parseIsoDate(date) || !Number.isInteger(sessionId) || sessionId < 0 || sessionId >= SESSIONS.length) return null;
  return { code, selection: { mode: "session", date, sessionId, participants: quantity } as BookingSelection };
}

/** First day of the selection (pick-up day / session day), yyyy-mm-dd. */
export const selectionStart = (s: BookingSelection) => (s.mode === "daily" ? s.pickupDate : s.date);
