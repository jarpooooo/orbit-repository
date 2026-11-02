// app/lib/booking.ts
//
// Booking rules and the URL contract between the request steps:
//   Jadwal → Ajukan → (Pratinjau surat) → Ringkasan
// The selection travels in the query string: ?hari=2026-11-02&sesi=0&jumlah=1 (+ &kode=PJM-… on Ringkasan).
// The query parameter names stay Indonesian because they are part of the public URLs.

import type { Locale } from "@/app/i18n/locale";
import { addDays, parseIsoDate, toNoon } from "./date";

export const SESSIONS = ["08.00 – 10.00", "10.00 – 12.00", "13.00 – 15.00", "15.00 – 17.00"] as const;
export const SESSION_START_HOURS = [8, 10, 13, 15] as const;
/** End of the last session; after this, today can no longer be booked. */
const CLOSING_HOUR = 17;

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

/** Today, or the next working day when today is Sunday or already past closing time. */
export function firstBookableDate(now: Date) {
  let d = toNoon(now);
  if (now.getHours() >= CLOSING_HOUR) d = addDays(d, 1);
  if (d.getDay() === 0) d = addDays(d, 1);
  return d;
}

/** True when the session on `day` has already started. */
export const isSessionPast = (day: Date, index: number, now: Date) =>
  toNoon(day).getTime() === toNoon(now).getTime() && now.getHours() >= SESSION_START_HOURS[index];

/** SIMULATION. Replace with a code issued by the API. */
export function generateRequestCode(now = new Date()) {
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `PJM-${mmdd}-${Math.floor(Math.random() * 9000) + 1000}`;
}

export type BookingSelection = {
  /** yyyy-mm-dd */
  date: string;
  /** index into SESSIONS */
  session: number;
  quantity: number;
};

export type ParsedBooking = BookingSelection & { day: Date };

/** Reads and validates ?hari=&sesi=&jumlah=. Returns null when anything is missing or out of range. */
export function parseBookingQuery(params: URLSearchParams, maxQuantity: number): ParsedBooking | null {
  const date = params.get("hari") ?? "";
  const session = Number(params.get("sesi"));
  const quantity = Number(params.get("jumlah"));
  const day = parseIsoDate(date);
  if (!day) return null;
  if (!Number.isInteger(session) || session < 0 || session >= SESSIONS.length) return null;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxQuantity) return null;
  return { date, session, quantity, day };
}

/** Like parseBookingQuery, plus a valid ?kode=. */
export function parseSubmittedQuery(params: URLSearchParams, maxQuantity: number) {
  const code = params.get("kode") ?? "";
  const booking = parseBookingQuery(params, maxQuantity);
  return booking && REQUEST_CODE_PATTERN.test(code) ? { ...booking, code } : null;
}

export function toBookingQuery({ date, session, quantity }: BookingSelection, code?: string) {
  const params = new URLSearchParams({ hari: date, sesi: String(session), jumlah: String(quantity) });
  if (code) params.set("kode", code);
  return params.toString();
}
