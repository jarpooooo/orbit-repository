// app/components/ui/category-badge.tsx
//
// Category tag ("HARDWARE", "RUANGAN", ...) on catalog cards, the detail page, and the request flow.
// Outlined chip as in Figma "Mau pinjam apa hari ini?" (white fill, 2px-style navy outline, plain label from
// COMMON_TEXT.categories). Not filled and no dot, so it never reads as a status / permission badge (StatusBadge).

"use client";

import type { FacilityCategory } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { useText } from "@/app/components/layout/language";

export default function CategoryBadge({ category }: { category: FacilityCategory }) {
  const label = useText(COMMON_TEXT).categories[category];
  return (
    <span
      className="inline-flex items-center rounded-lg border-[1.5px] border-line-strong bg-surface px-3 py-1 text-[13px] font-bold leading-[1.3] text-ink"
    >
      {label}
    </span>
  );
}
