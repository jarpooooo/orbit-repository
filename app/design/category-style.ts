// app/design/category-style.ts
//
// Facility category colors (colors.css: category-* solid accents, category-*-soft / -ink theme pairs).
// The ONE place that turns a category into Tailwind classes: catalog cards, filter chips, and the
// category badges on the detail page and in the request flow all read this map.
// Category color only marks the category; status and permission level keep their own colors (STATUS_STYLES).
// Class strings stay complete literals so Tailwind can detect them.

import type { FacilityCategory } from "@/app/data/facilities";

export type CategoryStyle = {
  /** category tag: soft fill + ink text */
  chip: string;
  /** ink color alone (icons, counts on a soft fill) */
  ink: string;
  /** illustration panel: solid accent, same in both themes (navy SVG lines stay readable) */
  panel: string;
  /** illustration panel while the facility is on loan */
  panelDimmed: string;
  /** small dot on an inactive filter chip */
  dot: string;
  /** active filter chip: solid accent + navy text */
  filterActive: string;
};

export const CATEGORY_STYLE: Record<FacilityCategory, CategoryStyle> = {
  hardware: {
    chip: "bg-category-hardware-soft text-category-hardware-ink",
    ink: "text-category-hardware-ink",
    panel: "bg-category-hardware",
    panelDimmed: "bg-category-hardware/60",
    dot: "bg-category-hardware",
    filterActive: "bg-category-hardware text-on-accent",
  },
  room: {
    chip: "bg-category-room-soft text-category-room-ink",
    ink: "text-category-room-ink",
    panel: "bg-category-room",
    panelDimmed: "bg-category-room/60",
    dot: "bg-category-room",
    filterActive: "bg-category-room text-on-accent",
  },
  multimedia: {
    chip: "bg-category-multimedia-soft text-category-multimedia-ink",
    ink: "text-category-multimedia-ink",
    panel: "bg-category-multimedia",
    panelDimmed: "bg-category-multimedia/60",
    dot: "bg-category-multimedia",
    filterActive: "bg-category-multimedia text-on-accent",
  },
  logistics: {
    chip: "bg-category-logistics-soft text-category-logistics-ink",
    ink: "text-category-logistics-ink",
    panel: "bg-category-logistics",
    panelDimmed: "bg-category-logistics/60",
    dot: "bg-category-logistics",
    filterActive: "bg-category-logistics text-on-accent",
  },
};
