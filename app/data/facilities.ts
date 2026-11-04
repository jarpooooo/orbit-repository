// app/data/facilities.ts
//
// SHARED facility data: used by the Catalog, Detail, Schedule, Request, Summary, and schedule pages.
// Source: Google Doc "Doc persiapan ORBIT REPOSITORY" (sections "Peminjaman" and "Level").
// Language-neutral: names, descriptions, and every other display text live in app/i18n/facilities.ts
// (keyed by facility id), read through localizeFacility().
// Adding a facility = one entry in FACILITIES + its name/description in app/i18n/facilities.ts.
// Later, swap FACILITIES for an API response; the shape stays the same.

import type { IllustrationId } from "@/app/design/icon-map";

export type { IllustrationId };

/* -------------------------------- categories -------------------------------- */

/** Display order of the categories (filters, counts, home cards). */
export const CATEGORY_ORDER = ["hardware", "room", "multimedia", "logistics"] as const;
export type FacilityCategory = (typeof CATEGORY_ORDER)[number];

/**
 * Subcategories (same keys as the home page category cards).
 * The keys are also the ?kategori= values in catalog URLs, so they stay Indonesian.
 * Labels: FACILITY_TEXT.subcategories (app/i18n/facilities.ts).
 */
export const SUBCATEGORIES = {
  mikrokontroler: { category: "hardware" },
  "perangkat-jaringan": { category: "hardware" },
  "alat-ukur": { category: "hardware" },
  "ruang-diskusi": { category: "room" },
  "kursi-pc-lab": { category: "room" },
  "kamera-acara": { category: "multimedia" },
} as const satisfies Record<string, { category: FacilityCategory }>;
export type SubcategoryKey = keyof typeof SUBCATEGORIES;

export const isSubcategory = (key: string): key is SubcategoryKey => key in SUBCATEGORIES;

/** Room types that have several rooms (one entry per room, see `group`). Also the ?grup= catalog param. */
export const ROOM_GROUPS = ["computer-lab", "classroom", "discussion-room"] as const;
export type RoomGroup = (typeof ROOM_GROUPS)[number];

export const isRoomGroup = (key: string): key is RoomGroup => (ROOM_GROUPS as readonly string[]).includes(key);

/* ------------------------------ permission & status ------------------------------ */

/** Permission level (business rule, doc section "Level"). */
export type PermissionLevel = "direct" | "verification" | "letter";
/** Status shown on cards: the permission level, or "borrowed" while the facility is unavailable. */
export type AvailabilityStatus = PermissionLevel | "borrowed";

/** Theme-aware classes (colors.css level-* / status-* tokens), so badges follow light/dark mode. Labels: FACILITY_TEXT.statuses. */
export type StatusStyle = { box: string; text: string; dot: string };

export const STATUS_STYLES: Record<AvailabilityStatus, StatusStyle> = {
  verification: { box: "bg-level-verification-bg", text: "text-level-verification-fg", dot: "bg-level-verification-fg" },
  letter: { box: "bg-level-letter-bg", text: "text-level-letter-fg", dot: "bg-level-letter-fg" },
  borrowed: { box: "bg-status-unavailable-bg", text: "text-status-unavailable-fg", dot: "bg-status-unavailable-fg" },
  direct: { box: "bg-level-direct-bg", text: "text-level-direct-fg", dot: "bg-level-direct-fg" },
};

/* ------------------------------- booking mode ------------------------------- */

/**
 * How a facility is scheduled (Figma flows 2.x and 3.x):
 * - "daily":   pick-up date + return date (equipment; max `maxDays`, quantity = units)
 * - "session": one day + one 2-hour session (rooms; quantity = participants up to `capacity`)
 */
export type BookingMode = "daily" | "session";

/** Default mode per category; a facility can override it with `bookingMode`. */
export const CATEGORY_BOOKING_MODE: Record<FacilityCategory, BookingMode> = {
  hardware: "daily",
  room: "session",
  multimedia: "daily",
  logistics: "daily",
};

/** Default loan length for "daily" facilities (days, pick-up and return day included). */
export const DEFAULT_MAX_DAYS = 3;

/** Default sessions of a "session" facility: indexes into SESSIONS (app/lib/booking.ts), all four 2-hour slots. */
export const DEFAULT_SESSION_IDS: readonly number[] = [0, 1, 2, 3];

/* ---------------------------------- places ---------------------------------- */

/** Pickup / usage location. Labels: FACILITY_TEXT.locations. */
export type LocationKey =
  | "microcontroller-lab"
  | "computer-lab"
  | "logistics-counter"
  | "tedi-1"
  | "tedi-2"
  | "tedi-3"
  | "multimedia-studio"
  | "auditorium"
  | "field";

/** Location used when an entry does not set its own. */
const DEFAULT_LOCATION: Record<FacilityCategory, LocationKey> = {
  hardware: "microcontroller-lab",
  room: "tedi-2",
  multimedia: "logistics-counter",
  logistics: "logistics-counter",
};

/* -------------------------------- facilities -------------------------------- */

export type Facility = {
  /** URL slug (/catalog/[id]) and i18n key */
  id: string;
  category: FacilityCategory;
  level: PermissionLevel;
  illustration: IllustrationId;
  /** units in stock (equipment) or rooms (1 per room entry) */
  units: number;
  /** true when this room type has several rooms; the rooms share `group` */
  multiUnit?: boolean;
  group?: RoomGroup;
  /** rooms: seats; the request asks for people instead of units */
  capacity?: number;
  /** defaults to DEFAULT_LOCATION[category] */
  location?: LocationKey;
  /** home page card this facility belongs to (?kategori=) */
  subcategory?: SubcategoryKey;
  /** [dummy] ISO date: the facility is on loan / in use until then */
  borrowedUntil?: string;
  /** overrides CATEGORY_BOOKING_MODE[category] */
  bookingMode?: BookingMode;
  /** "daily": longest loan in days (default DEFAULT_MAX_DAYS) */
  maxDays?: number;
  /** "session": indexes into SESSIONS (app/lib/booking.ts) this room offers; default all */
  sessions?: readonly number[];
};

/** Several rooms of one type: `<group>-1` … `<group>-n`. Names: FACILITY_TEXT.rooms (e.g. "Lab Komputer 1"). */
const rooms = (group: RoomGroup, count: number, base: Omit<Facility, "id" | "units" | "multiUnit" | "group">): Facility[] =>
  Array.from({ length: count }, (_, i) => ({ ...base, id: `${group}-${i + 1}`, units: 1, multiUnit: true, group }));

// Order inside each category = display order; the first 4 are the catalog preview (as in Figma 1.4).
export const FACILITIES: readonly Facility[] = [
  /* A. Hardware */
  { id: "esp32", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "arduino-uno", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler", borrowedUntil: "2026-11-16" },
  { id: "laptop", category: "hardware", level: "letter", illustration: "catalog/laptop", units: 1, location: "computer-lab" },
  { id: "raspberry-pi", category: "hardware", level: "verification", illustration: "catalog/raspberry-pi", units: 1, subcategory: "mikrokontroler" },
  { id: "pc", category: "hardware", level: "letter", illustration: "catalog/komputer", units: 1, location: "computer-lab" },
  { id: "monitor", category: "hardware", level: "letter", illustration: "catalog/komputer", units: 1, location: "computer-lab" }, // closest: catalog computer (monitor)
  { id: "keyboard", category: "hardware", level: "direct", illustration: "catalog/komputer", units: 1, location: "computer-lab" },
  { id: "mouse", category: "hardware", level: "direct", illustration: "catalog/komputer", units: 1, location: "computer-lab" },
  { id: "nodemcu", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "breadboard", category: "hardware", level: "direct", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "jumper-cable", category: "hardware", level: "direct", illustration: "catalog/kabel-roll", units: 1, subcategory: "mikrokontroler" },
  { id: "sensor-kit", category: "hardware", level: "verification", illustration: "alat-ukur", units: 1, subcategory: "alat-ukur" },
  { id: "relay-module", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "servo-motor", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "dc-motor", category: "hardware", level: "verification", illustration: "catalog/chip", units: 1, subcategory: "mikrokontroler" },
  { id: "power-supply", category: "hardware", level: "verification", illustration: "alat-ukur", units: 1, subcategory: "alat-ukur" },

  /* B. Rooms. [dummy] room counts and capacities */
  ...rooms("discussion-room", 4, { category: "room", level: "verification", illustration: "catalog/ruang-diskusi", capacity: 10, location: "tedi-2", subcategory: "ruang-diskusi" }),
  ...rooms("computer-lab", 3, { category: "room", level: "verification", illustration: "catalog/komputer", capacity: 30, location: "computer-lab", subcategory: "kursi-pc-lab" }),
  ...rooms("classroom", 4, { category: "room", level: "verification", illustration: "catalog/ruang-kelas", capacity: 40, location: "tedi-3", subcategory: "ruang-diskusi" }),
  { id: "auditorium", category: "room", level: "letter", illustration: "catalog/auditorium", units: 1, capacity: 200, location: "auditorium" },
  { id: "multimedia-room", category: "room", level: "verification", illustration: "catalog/kamera", units: 1, capacity: 15, location: "multimedia-studio" },
  { id: "multipurpose-field", category: "room", level: "letter", illustration: "catalog/ruang-diskusi", units: 1, capacity: 300, location: "field" }, // closest

  /* C. Multimedia */
  { id: "camera", category: "multimedia", level: "letter", illustration: "catalog/kamera", units: 1, subcategory: "kamera-acara" },
  { id: "projector", category: "multimedia", level: "letter", illustration: "catalog/proyektor", units: 1, subcategory: "kamera-acara", borrowedUntil: "2026-11-11" },
  { id: "microphone", category: "multimedia", level: "verification", illustration: "catalog/mikrofon", units: 1, subcategory: "kamera-acara" },
  { id: "speaker", category: "multimedia", level: "verification", illustration: "catalog/speaker", units: 1, subcategory: "kamera-acara" },
  { id: "tripod", category: "multimedia", level: "verification", illustration: "catalog/kamera", units: 1, subcategory: "kamera-acara" },
  { id: "lighting", category: "multimedia", level: "letter", illustration: "tv-display", units: 1, subcategory: "kamera-acara" }, // closest
  { id: "sound-system", category: "multimedia", level: "letter", illustration: "catalog/speaker", units: 1, subcategory: "kamera-acara" },
  { id: "tv-display", category: "multimedia", level: "letter", illustration: "tv-display", units: 1, subcategory: "kamera-acara" },
  { id: "hdmi-vga-adapter", category: "multimedia", level: "direct", illustration: "catalog/kabel-roll", units: 1, subcategory: "kamera-acara" },
  { id: "presenter-clicker", category: "multimedia", level: "direct", illustration: "catalog/proyektor", units: 1, subcategory: "kamera-acara" },

  /* D. Logistics */
  { id: "extension-cord", category: "logistics", level: "direct", illustration: "catalog/stop-kontak", units: 1 },
  { id: "cable-reel", category: "logistics", level: "direct", illustration: "catalog/kabel-roll", units: 1 },
  { id: "extra-chair", category: "logistics", level: "verification", illustration: "catalog/kursi", units: 1 },
  { id: "whiteboard", category: "logistics", level: "verification", illustration: "catalog/whiteboard", units: 1 }, // closest
  { id: "extra-table", category: "logistics", level: "verification", illustration: "catalog/ruang-kelas", units: 1 }, // closest: classroom desks
];

/* --------------------------------- lookups --------------------------------- */

const BY_ID = new Map(FACILITIES.map((f) => [f.id, f]));

export const getFacility = (id: string) => BY_ID.get(id);

export const getFacilitiesByCategory = (category: FacilityCategory) => FACILITIES.filter((f) => f.category === category);

/** Number of facilities per category, plus "all". */
export const CATEGORY_COUNTS: Record<FacilityCategory | "all", number> = {
  all: FACILITIES.length,
  ...(Object.fromEntries(CATEGORY_ORDER.map((c) => [c, getFacilitiesByCategory(c).length])) as Record<FacilityCategory, number>),
};

/** Rooms in a multi-unit group ("Lab Komputer" → 3). */
export const countInGroup = (group: RoomGroup) => FACILITIES.filter((f) => f.group === group).length;

/** Looks up several ids at once, skipping unknown ones (for simulated lists keyed by facility id). */
export function withFacilities<T extends { id: string }>(rows: readonly T[]) {
  return rows.flatMap((row) => {
    const facility = getFacility(row.id);
    return facility ? [{ ...row, facility }] : [];
  });
}

/* ------------------------- derived (language-neutral) ------------------------- */

/** "unit" for "daily" facilities, "person" for "session" ones (capacity). */
export type FacilityUnit = "unit" | "person";

export const facilityUnit = (f: Facility): FacilityUnit => (bookingMode(f) === "session" ? "person" : "unit");

/** Maximum quantity that can be requested: seats ("session" mode) or stock ("daily" mode). */
export const maxQuantity = (f: Facility) => (bookingMode(f) === "session" ? (f.capacity ?? 1) : f.units);

export const facilityLocation = (f: Facility): LocationKey => f.location ?? DEFAULT_LOCATION[f.category];

export const facilityStatus = (f: Facility): AvailabilityStatus => (f.borrowedUntil ? "borrowed" : f.level);

export const bookingMode = (f: Facility): BookingMode => f.bookingMode ?? CATEGORY_BOOKING_MODE[f.category];

export const maxDays = (f: Facility) => f.maxDays ?? DEFAULT_MAX_DAYS;

export const facilitySessions = (f: Facility) => f.sessions ?? DEFAULT_SESSION_IDS;
