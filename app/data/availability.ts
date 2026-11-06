// app/data/availability.ts
//
// Availability per facility per date, kept apart from the facility data (app/data/facilities.ts).
// [dummy] Everything here is simulated but has the shape the API will return:
//   getDailyAvailability(id, date)   → "daily" facilities: closed day, or units left that day
//   getSessionAvailability(id, date) → "session" facilities: free / full per session
// Swap the bodies for API calls later; the components only call these two functions.
// Stock (units) and loans (borrowedUntil) come from the live Firestore facility (app/lib/facility-store.ts).

import { facilitySessions } from "./facilities";
import { currentFacility as getFacility } from "@/app/lib/facility-store";

/** "ok" = every unit free, "low" = some taken, "out" = none left, "closed" = Sunday / holiday. */
export type StockLevel = "ok" | "low" | "out" | "closed";
export type DailyAvailability = { level: StockLevel; units: number };

export type SessionStatus = "free" | "full";
/** Status per session id (index into SESSIONS) the facility offers. */
export type SessionAvailability = { sessionId: number; status: SessionStatus }[];

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

/** Free / full per offered session on `date` (yyyy-mm-dd) for a "session" facility. Closed days are all full. */
export function getSessionAvailability(facilityId: string, date: string): SessionAvailability {
  const f = getFacility(facilityId);
  if (!f) return [];
  const closed = isClosedDay(date) || (!!f.borrowedUntil && date <= f.borrowedUntil);
  return facilitySessions(f).map((sessionId) => ({
    sessionId,
    status: closed || hash(`${facilityId}:${date}:${sessionId}`) % 5 === 0 ? "full" : "free",
  }));
}
