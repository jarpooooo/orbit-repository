// app/components/catalog/booking/registry.tsx
//
// BOOKING_MODES: everything that differs between the two booking flows, in one map
// (Figma 2.x "per hari" for equipment, 3.x "per sesi" for rooms). A facility's mode comes from its data
// (bookingMode() in app/data/facilities.ts), so pages look the mode up here instead of branching on category.
// Step-3 label: BOOKING_TEXT.modes[mode].step. Validation: validateSelection() in app/lib/booking.ts.

import type { ComponentType } from "react";
import { bookingMode, type BookingMode, type Facility } from "@/app/data/facilities";
import type { FacilityView } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import type { BookingSelection } from "@/app/lib/booking";
import DailyScheduler from "./daily-scheduler";
import SessionScheduler from "./session-scheduler";
import {
  dailyFinishDetail,
  dailyLetterPeriod,
  dailyLine,
  dailyRows,
  dailyUseDetail,
  sessionFinishDetail,
  sessionLetterPeriod,
  sessionLine,
  sessionRows,
  sessionUseDetail,
  type LetterPeriod,
  type Rows,
} from "./describe";

export type SchedulerProps = { facility: Facility; now: Date };

type ModeConfig<S extends BookingSelection> = {
  /** "Pilih jadwal" step content (left column + draft summary) */
  Scheduler: ComponentType<SchedulerProps>;
  /** detail rows on the request form, summary ticket */
  rows: (s: S, f: FacilityView, locale: Locale) => Rows;
  /** one line on "Pengajuan saya" */
  line: (s: S, f: FacilityView, locale: Locale) => string;
  /** detail of the "Langkah berikutnya" item to pick up / use the room */
  useDetail: (s: S, locale: Locale) => string;
  /** detail of the closing item (return the item / done) */
  finishDetail: (s: S, locale: Locale) => string;
  /** loan period written in the permission letter */
  letterPeriod: (s: S) => LetterPeriod;
  /** one-day selection from a cell of the room schedule ("Cek ketersediaan": day + start hour) */
  quickSelection: (date: string, startHour: number) => S;
};

export const BOOKING_MODES: { [M in BookingMode]: ModeConfig<Extract<BookingSelection, { mode: M }>> } = {
  daily: {
    Scheduler: DailyScheduler,
    rows: dailyRows,
    line: dailyLine,
    useDetail: dailyUseDetail,
    finishDetail: dailyFinishDetail,
    letterPeriod: dailyLetterPeriod,
    quickSelection: (date) => ({ mode: "daily", pickupDate: date, returnDate: date, units: 1 }),
  },
  session: {
    Scheduler: SessionScheduler,
    rows: sessionRows,
    line: sessionLine,
    useDetail: sessionUseDetail,
    finishDetail: sessionFinishDetail,
    letterPeriod: sessionLetterPeriod,
    quickSelection: (date, startHour) => ({ mode: "session", date, startHour, endHour: startHour + 1, participants: 1 }),
  },
};

/** The mode config for a selection (the selection's `mode` picks the matching entry). */
export const modeOf = <S extends BookingSelection>(s: S) => BOOKING_MODES[s.mode] as unknown as ModeConfig<S>;

/** The mode config for a facility. */
export const modeFor = (f: Facility) => BOOKING_MODES[bookingMode(f)];
