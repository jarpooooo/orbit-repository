// app/i18n/common.ts
//
// Labels shared by several pages.

import type { FacilityCategory, PermissionLevel } from "@/app/data/facilities";
import type { Dictionary, Locale } from "./locale";

const id = {
  /** "Semua" chip in category filters */
  all: "Semua",
  /** facility categories (CATEGORY_ORDER) */
  categories: { hardware: "Hardware", room: "Ruangan", multimedia: "Multimedia", logistics: "Logistik" } as Record<FacilityCategory, string>,
  levels: { direct: "Langsung", verification: "Verifikasi", letter: "Butuh surat" } as Record<PermissionLevel, string>,
  simulatedData: "Data simulasi untuk prototipe.",
};

const en: typeof id = {
  all: "All",
  categories: { hardware: "Hardware", room: "Rooms", multimedia: "Multimedia", logistics: "Logistics" },
  levels: { direct: "Direct", verification: "Verification", letter: "Letter required" },
  simulatedData: "Simulated data for the prototype.",
};

export const COMMON_TEXT: Dictionary<typeof id> = { id, en };

/** Session times are written "08.00–10.00" (Indonesian); English uses "08:00–10:00". */
export const formatTimeRange = (range: string, locale: Locale) =>
  locale === "en" ? range.replaceAll(".", ":") : range;
