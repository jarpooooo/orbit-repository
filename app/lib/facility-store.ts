// app/lib/facility-store.ts
//
// Live facility data from Firestore (collection `facilities`, one document per facility id).
// FACILITIES (app/data/facilities.ts) is the seed (scripts/seed-facilities.mjs) and the first value:
// the server renders it, the browser starts with it, then switches to the Firestore documents as soon as
// they arrive (onSnapshot, so a change in the console shows up without a reload).
// Only ids that exist in FACILITIES are shown, because names and descriptions live in app/i18n/facilities.ts.
// Each field of a document is checked; an invalid value falls back to the seed value.
//
// - useFacilities()        → every facility, in display order (`order` field)
// - useLiveFacility(f)     → the live version of one facility (pages pass the seed version as a prop)
// - currentFacility(id)    → same, outside React (availability.ts); components re-render through the hooks above

import { useSyncExternalStore } from "react";
import {
  CATEGORY_ORDER,
  FACILITIES,
  type BookingMode,
  type Facility,
  type LocationKey,
  type PermissionLevel,
} from "@/app/data/facilities";

const SEED_BY_ID = new Map(FACILITIES.map((f) => [f.id, f]));

const LEVELS: readonly PermissionLevel[] = ["direct", "verification", "letter"];
const MODES: readonly BookingMode[] = ["daily", "session"];
const LOCATIONS: readonly LocationKey[] = [
  "microcontroller-lab",
  "computer-lab",
  "logistics-counter",
  "tedi-1",
  "tedi-2",
  "tedi-3",
  "multimedia-studio",
  "auditorium",
  "field",
];

const isCount = (v: unknown, min = 0): v is number => typeof v === "number" && Number.isInteger(v) && v >= min;
const isIsoDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T => typeof v === "string" && (list as readonly string[]).includes(v);

/** Seed facility + Firestore document → Facility. Data fields come from the document; visual fields stay from the seed. */
function fromDocument(seed: Facility, d: Record<string, unknown>): Facility {
  return {
    ...seed,
    // category, illustration, group, subcategory, multiUnit stay from the seed: they pick the text and drawings
    category: oneOf(CATEGORY_ORDER, d.category) ? d.category : seed.category,
    level: oneOf(LEVELS, d.level) ? d.level : seed.level,
    units: isCount(d.units) ? d.units : seed.units,
    capacity: isCount(d.capacity, 1) ? d.capacity : "capacity" in d ? undefined : seed.capacity,
    location: oneOf(LOCATIONS, d.location) ? d.location : "location" in d ? undefined : seed.location,
    // the document is the source of truth for loans: no field = not on loan
    borrowedUntil: isIsoDate(d.borrowedUntil) ? d.borrowedUntil : undefined,
    bookingMode: oneOf(MODES, d.bookingMode) ? d.bookingMode : seed.bookingMode,
    maxDays: isCount(d.maxDays, 1) ? d.maxDays : seed.maxDays,
    maxHours: isCount(d.maxHours, 1) && d.maxHours <= 9 ? d.maxHours : seed.maxHours,
  };
}

/** Same data (seed and Firestore fields are all primitives or number arrays) → true. */
function sameFacility(a: Facility, b: Facility) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof Facility>;
  for (const k of keys) {
    const x = a[k], y = b[k];
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length || x.some((v, i) => v !== y[i])) return false;
    } else if (x !== y) return false;
  }
  return true;
}

/* ---------------------------------- store ---------------------------------- */

type Snapshot = { list: readonly Facility[]; byId: ReadonlyMap<string, Facility>; live: boolean };

const SEED_SNAPSHOT: Snapshot = { list: FACILITIES, byId: SEED_BY_ID, live: false };
let snapshot = SEED_SNAPSHOT;
const listeners = new Set<() => void>();
let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  // loaded on demand so server modules that import this file never start the Firebase SDK
  void Promise.all([import("firebase/firestore"), import("./firestore")]).then(([{ collection, onSnapshot }, { db }]) => {
    onSnapshot(
      collection(db, "facilities"),
      (result) => {
        if (result.empty) return; // not seeded yet: keep the built-in data
        const order = new Map(FACILITIES.map((f, i) => [f.id, i]));
        const rows = result.docs.flatMap((doc) => {
          const seed = SEED_BY_ID.get(doc.id);
          if (!seed) return [];
          const data = doc.data();
          return [{ facility: fromDocument(seed, data), order: typeof data.order === "number" ? data.order : order.get(doc.id)! }];
        });
        rows.sort((a, b) => a.order - b.order);
        // Structural sharing: an unchanged facility keeps its previous object, so components and effects that
        // depend on it (e.g. the letter preview, which re-renders the .docx) do not re-run for nothing.
        const list = rows.map(({ facility }) => {
          const previous = snapshot.byId.get(facility.id);
          return previous && sameFacility(previous, facility) ? previous : facility;
        });
        const unchanged = list.length === snapshot.list.length && list.every((f, i) => f === snapshot.list[i]);
        if (unchanged && snapshot.live) return;
        snapshot = unchanged ? { ...snapshot, live: true } : { list, byId: new Map(list.map((f) => [f.id, f])), live: true };
        if (!unchanged) listeners.forEach((l) => l());
      },
      (error) => console.warn("[facilities] using built-in data:", error.code),
    );
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SEED_SNAPSHOT;

/* ---------------------------------- reads ---------------------------------- */

export const useFacilities = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).list;

/** Live version of `f`; `f` itself while loading or when the document is missing. */
export function useLiveFacility(f: Facility): Facility {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).byId.get(f.id) ?? f;
}

export const useFacilityById = (id: string) => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).byId.get(id);

/** Outside React: the latest known version (seed data on the server). */
export const currentFacility = (id: string) => snapshot.byId.get(id) ?? SEED_BY_ID.get(id);
