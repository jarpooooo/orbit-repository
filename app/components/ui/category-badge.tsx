// app/components/ui/category-badge.tsx
//
// Category tag ("HARDWARE", "RUANGAN", ...) on catalog cards, the detail page, and the request flow.
// Colors from CATEGORY_STYLE (app/design/category-style.ts); label from COMMON_TEXT.categories.
// Squared corners and no dot, so it never reads as a status / permission badge (StatusBadge).

"use client";

import { CATEGORY_STYLE } from "@/app/design/category-style";
import type { FacilityCategory } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { useText } from "@/app/components/layout/language";

export default function CategoryBadge({ category }: { category: FacilityCategory }) {
  const label = useText(COMMON_TEXT).categories[category];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-[3px] text-[12px] font-extrabold uppercase leading-none tracking-[0.02em] ${CATEGORY_STYLE[category].chip}`}
    >
      {label}
    </span>
  );
}
