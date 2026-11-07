// app/data/availability.ts
//
// Availability per facility per date, kept apart from the facility data (app/data/facilities.ts).
// [dummy] Everything here is simulated but has the shape the API will return:
//   getDailyAvailability(id, date)   → "daily" facilities: closed day, or units left that day
//   getHourAvailability(id, date)    → "session" facilities (rooms): free / taken / pending per hour 08–16
// Swap the bodies for API calls later; the components only call these two functions.
// Stock (units) and loans (borrowedUntil) come from the live Firestore facility (app/lib/facility-store.ts).

import { currentFacility as getFacility } from "@/app/lib/facility-store";

/** "ok" = every unit free, "low" = some taken, "out" = none left, "closed" = Sunday / holiday. */
export type StockLevel = "ok" | "low" | "out" | "closed";
export type DailyAvailability = { level: StockLevel; units: number };

/** Per hour of a room: free, booked ("taken"), or requested and waiting for approval ("pending"). */
export type HourStatus = "free" | "taken" | "pending";
/** One entry per bookable hour 8 … 16 (the hour 08 = 08.00–09.00). */
export type HourAvailability = { hour: number; status: HourStatus }[];

const OPEN = 8;
const CLOSE = 17;

/** [dummy] Holidays (yyyy-mm-dd). Sundays are always closed. */
const HOLIDAYS: ReadonlySet<string> = new Set(["2026-11-30", "2026-12-24", "2026-12-25", "2027-01-01"]);

/** Small stable hash so the same facility + date always gives the same dummy value. */
function hash(text: string) {
  let h = 7;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

const weekday = (date: string) => new Date(`${date}T12:00:00`).getDay();

export const isClosedDay = (date: string) => weekday(date) === 0 || HOLIDAYS.has(date);

/** Units left on `date` (yyyy-mm-dd) for a "daily" facility. */
export function getDailyAvailability(facilityId: string, date: string): DailyAvailability {
  const f = getFacility(facilityId);
  if (!f || isClosedDay(date)) return { level: "closed", units: 0 };
  if (f.borrowedUntil && date <= f.borrowedUntil) return { level: "out", units: 0 };
  const roll = hash(`${facilityId}:${date}`) % 9;
  const units = roll === 0 ? 0 : roll <= 2 ? Math.max(1, Math.ceil(f.units / 3)) : f.units;
  return { level: units === 0 ? "out" : units < f.units ? "low" : "ok", units };
}

/**
 * Free / taken / pending per hour on `date` for a "session" facility. A closed day or a room on loan is taken all day.
 * [dummy] Each day gets up to two bookings of 1–3 hours and sometimes one pending request, from a stable hash.
 */
export function getHourAvailability(facilityId: string, date: string): HourAvailability {
  const f = getFacility(facilityId);
  if (!f) return [];
  const hours = Array.from({ length: CLOSE - OPEN }, (_, i) => OPEN + i);
  if (isClosedDay(date) || (!!f.borrowedUntil && date <= f.borrowedUntil)) return hours.map((hour) => ({ hour, status: "taken" }));
  const h = hash(`${facilityId}:${date}`);
  const status = new Map<number, HourStatus>();
  const block = (from: number, length: number, kind: HourStatus) => {
    for (let x = from; x < Math.min(CLOSE, from + length); x++) if (!status.has(x)) status.set(x, kind);
  };
  block(OPEN + (h % 9), 1 + ((h >> 4) % 3), "taken");
  if ((h >> 8) % 3 !== 0) block(OPEN + ((h >> 10) % 9), 1 + ((h >> 13) % 2), "taken");
  if ((h >> 15) % 4 === 0) block(OPEN + ((h >> 17) % 9), 1 + ((h >> 20) % 2), "pending");
  return hours.map((hour) => ({ hour, status: status.get(hour) ?? "free" }));
}

/** Free hours left on `date` (0 on a closed day). */
export const freeHoursOn = (facilityId: string, date: string) => getHourAvailability(facilityId, date).filter((x) => x.status === "free").length;
