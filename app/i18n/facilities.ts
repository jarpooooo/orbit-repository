// app/i18n/facilities.ts
//
// Facility labels and content per language. app/data/facilities.ts stays the Indonesian source of truth
// (the permission letter always uses it); English text is layered on top with localizeFacility().

import {
  PERMISSION_NOTES,
  STATUS_STYLES,
  SUBCATEGORIES,
  UNIT_LABELS,
  type AvailabilityStatus,
  type Facility,
  type FacilityUnit,
  type PermissionLevel,
  type SubcategoryKey,
} from "@/app/data/facilities";
import type { Dictionary, Locale } from "./locale";

const id = {
  statuses: Object.fromEntries(Object.entries(STATUS_STYLES).map(([key, s]) => [key, s.label])) as Record<AvailabilityStatus, string>,
  permissionNotes: PERMISSION_NOTES as Record<PermissionLevel, { title: string; text: string }>,
  subcategories: Object.fromEntries(Object.entries(SUBCATEGORIES).map(([key, s]) => [key, s.label])) as Record<SubcategoryKey, string>,
  /** "3 unit" / "10 orang" */
  quantity: (n: number, unit: FacilityUnit) => `${n} ${UNIT_LABELS[unit]}`,
};

const en: typeof id = {
  statuses: { verification: "Verification", letter: "Letter required", borrowed: "On loan", direct: "Direct" },
  permissionNotes: {
    verification: { title: "Verification.", text: "Checked by the lab staff, usually within 1 working hour." },
    letter: { title: "Letter required.", text: "A permission letter signed by your supervisor is required." },
    direct: { title: "Direct.", text: "Approved by the system right away. Just pick it up at the counter." },
  },
  subcategories: {
    mikrokontroler: "Micro-controllers",
    "perangkat-jaringan": "Network devices",
    "alat-ukur": "Measuring tools",
    "ruang-diskusi": "Discussion rooms",
    "kursi-pc-lab": "PC lab seats",
    "kamera-acara": "Cameras and events",
  },
  quantity: (n, unit) => (unit === "person" ? `${n} ${n === 1 ? "person" : "people"}` : `${n} ${n === 1 ? "unit" : "units"}`),
};

export const FACILITY_TEXT: Dictionary<typeof id> = { id, en };

/** Fields of a Facility that hold display text. */
type FacilityContent = Pick<Facility, "name" | "description" | "longDescription" | "meta" | "availability" | "location" | "specs">;

/** English content per slug (same simulated data as app/data/facilities.ts). */
const FACILITY_CONTENT_EN: Record<string, FacilityContent> = {
  "kit-esp32": {
    name: "ESP32 Kit",
    description: "A complete IoT development kit with breadboard, jumper wires, and basic sensors.",
    meta: "6 units",
    availability: "6 units available",
    location: "Microcontroller Lab, 2nd floor",
    specs: [["Location", "Microcontroller Lab, 2nd floor"], ["Contents", "ESP32 DevKit, breadboard, 20 jumpers, 3 sensors"], ["Max. duration", "3 days"], ["Deposit", "Student ID held"]],
  },
  "multimeter-digital": {
    name: "Digital Multimeter",
    description: "Measures voltage, current, and resistance for lab work and final projects.",
    meta: "2 units",
    availability: "2 units available",
    location: "Microcontroller Lab, 2nd floor",
    specs: [["Location", "Microcontroller Lab, 2nd floor"], ["Measures", "Voltage, current, resistance"], ["Max. duration", "3 days"], ["Deposit", "Student ID held"]],
  },
  "arduino-uno-r3": {
    name: "Arduino Uno R3",
    description: "Back Mon 26 Oct",
    longDescription: "Arduino Uno R3 microcontroller board for basic lab work and prototypes.",
    availability: "Back Mon 26 Oct",
    location: "Microcontroller Lab, 2nd floor",
    specs: [["Location", "Microcontroller Lab, 2nd floor"], ["Contents", "Arduino Uno R3 board, USB cable"], ["Max. duration", "3 days"], ["Deposit", "Student ID held"]],
  },
  "ruang-diskusi-a": {
    name: "Discussion Room A",
    description: "A small air-conditioned room with a whiteboard for group work and supervision.",
    meta: "10 people",
    availability: "Seats 10 people",
    location: "TEDI Building, 2nd floor",
    specs: [["Location", "TEDI Building, 2nd floor"], ["Capacity", "10 people"], ["Amenities", "Air conditioning, whiteboard"], ["Max. duration", "2 hours per session"]],
  },
  "ruang-sidang": {
    name: "Seminar Room",
    description: "A formal room for thesis defenses, proposal seminars, and student association meetings.",
    meta: "20 people",
    availability: "Seats 20 people",
    location: "TEDI Building, 3rd floor",
    specs: [["Location", "TEDI Building, 3rd floor"], ["Capacity", "20 people"], ["Amenities", "Air conditioning, projector, microphone"], ["Max. duration", "4 hours per session"]],
  },
  "pc-lab-rpl": {
    name: "PC Lab RPL",
    description: "Used by classes until Thu 29 Oct",
    longDescription: "High-spec PCs outside lab hours.",
    meta: "30 people",
    availability: "Used by classes until Thu 29 Oct",
    location: "RPL Lab, 2nd floor",
    specs: [["Location", "RPL Lab, 2nd floor"], ["Capacity", "30 people"], ["Amenities", "High-spec PCs"], ["Max. duration", "2 hours per session"]],
  },
  "converter-hdmi": {
    name: "HDMI Converter",
    description: "HDMI to VGA and USB-C adapters for presenting in any room.",
    meta: "12 units",
    availability: "12 units available",
    location: "Logistics Counter, 1st floor",
    specs: [["Location", "Logistics Counter, 1st floor"], ["Type", "HDMI to VGA, USB-C to HDMI"], ["Max. duration", "1 day"], ["Deposit", "No deposit"]],
  },
  "kamera-mirrorless": {
    name: "Mirrorless Camera",
    description: "A camera for documenting student association events and video projects.",
    meta: "1 unit",
    availability: "1 unit available",
    location: "Logistics Counter, 1st floor",
    specs: [["Location", "Logistics Counter, 1st floor"], ["Contents", "Body, kit lens, spare battery"], ["Max. duration", "2 days"], ["Deposit", "Student ID held"]],
  },
  "proyektor-portabel": {
    name: "Portable Projector",
    description: "Back Wed 28 Oct",
    longDescription: "A portable projector for presentations and student association events.",
    availability: "Back Wed 28 Oct",
    location: "Logistics Counter, 1st floor",
    specs: [["Location", "Logistics Counter, 1st floor"], ["Contents", "Projector, HDMI cable, power cable"], ["Max. duration", "1 day"], ["Deposit", "Student ID held"]],
  },
};

/** The facility with its display text in the given language (Indonesian = unchanged). */
export function localizeFacility(f: Facility, locale: Locale): Facility {
  if (locale === "id") return f;
  const content = FACILITY_CONTENT_EN[f.slug];
  return content ? { ...f, ...content } : f;
}
