// app/components/home/category-picker.tsx
//
// "Mau pinjam apa hari ini?" section (Figma node 1:3241, desktop 1440px).
// 6 category cards + filter chips (Semua / Hardware / Ruang / Logistik).
// Card layout lives in CATEGORIES below; card text lives in HOME_TEXT.categoryPicker (app/i18n/home.ts).
// Illustrations: CATEGORY_ILLUSTRATIONS from icon-map (public/img/illustrations/*.svg).

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORY_ILLUSTRATIONS, UI_ICONS, type CategoryIllustrationKey } from "@/app/design/icon-map";
import { FACILITY_GROUPS, type FacilityGroup, type SubcategoryKey } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { HOME_TEXT } from "@/app/i18n/home";
import { useLocale } from "@/app/components/layout/language";

type Tone = "yellow" | "mint" | "periwinkle";

// Decorative illustration panels: fixed accent fills, the same in both themes (navy SVG lines stay readable).
const TONE_CLASSES: Record<Tone, string> = {
  yellow: "bg-sun-200",
  mint: "bg-mint-300",
  periwinkle: "bg-periwinkle-400",
};

const CATEGORIES: readonly {
  /** ?kategori= value on the catalog page */
  subcategory: SubcategoryKey;
  illustration: CategoryIllustrationKey;
  group: FacilityGroup;
  tone: Tone;
}[] = [
  { subcategory: "mikrokontroler", illustration: "mikrokontroler", group: "hardware", tone: "yellow" },
  { subcategory: "perangkat-jaringan", illustration: "perangkat-jaringan", group: "hardware", tone: "mint" },
  { subcategory: "alat-ukur", illustration: "alat-ukur", group: "hardware", tone: "periwinkle" },
  { subcategory: "ruang-diskusi", illustration: "ruang-diskusi", group: "room", tone: "yellow" },
  { subcategory: "kursi-pc-lab", illustration: "kursi", group: "room", tone: "mint" },
  { subcategory: "kamera-acara", illustration: "kamera", group: "logistics", tone: "periwinkle" },
];

type Filter = "all" | FacilityGroup;
const FILTERS: readonly Filter[] = ["all", ...FACILITY_GROUPS];

export default function CategoryPicker() {
  const { locale } = useLocale();
  const t = HOME_TEXT[locale].categoryPicker;
  const common = COMMON_TEXT[locale];
  const filterLabel = (f: Filter) => (f === "all" ? common.all : common.groups[f]);
  const [filter, setFilter] = useState<Filter>("all");
  const GoTo = UI_ICONS.goTo;
  const visible = CATEGORIES.filter((c) => filter === "all" || c.group === filter);

  return (
    <section
      id="mau-pinjam"
      className="rounded-t-[32px] border-t-[3px] border-line-strong bg-surface px-5 pb-14 pt-12 sm:px-8 sm:pb-16 sm:pt-16 md:rounded-t-[48px] xl:px-[110px] xl:pb-[91px] xl:pt-[94px]"
    >
      <div className="mx-auto max-w-[1220px]">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-[10px]">
            <h2 className="font-display text-[34px] font-normal leading-none text-ink sm:text-[42px] xl:text-[52px]">
              {t.title}
            </h2>
            <p className="max-w-[479px] text-[16px] font-normal leading-[1.6] text-ink-body sm:text-[19px]">
              {t.lead}
            </p>
          </div>

          <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={[
                    "h-11 rounded-full border-2 border-line-strong px-[18px] text-[16px] font-bold leading-[1.3] transition-colors",
                    active ? "bg-ink text-on-ink" : "bg-surface text-ink hover:bg-surface-warm",
                  ].join(" ")}
                >
                  {filterLabel(f)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card grid */}
        <ul className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 xl:mt-10 xl:grid-cols-3">
          {visible.map((c) => (
            <li key={c.subcategory} className="min-w-0">
              <Link
                href={`/catalog?kategori=${c.subcategory}`}
                className="group flex h-full min-h-[200px] overflow-hidden rounded-[22px] border-2 border-line-strong bg-surface-warm shadow-[5px_5px_0_0_var(--color-shadow-accent)] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:min-h-[230px] sm:shadow-[8px_8px_0_0_var(--color-shadow-accent)]"
              >
                {/* illustration panel */}
                <div
                  className={`flex w-[116px] shrink-0 items-center justify-center border-r-2 border-line-strong sm:w-[160px] ${TONE_CLASSES[c.tone]}`}
                >
                  <Image
                    src={CATEGORY_ILLUSTRATIONS[c.illustration]}
                    alt=""
                    width={120}
                    height={120}
                    className="size-[84px] sm:size-[120px]"
                  />
                </div>

                {/* body */}
                <div className="flex min-w-0 flex-1 flex-col items-start gap-[14px] p-4 sm:p-[22px]">
                  <div className="flex w-full items-start gap-[10px]">
                    <h3 className="font-display min-w-0 flex-1 break-words text-[22px] font-normal leading-[1.05] text-ink sm:text-[26px]">
                      {t.cards[c.subcategory].title}
                    </h3>
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-interactive text-on-interactive transition-colors group-hover:bg-brand-interactive-hover sm:size-[46px]"
                    >
                      <GoTo size={20} strokeWidth={2.5} />
                    </span>
                  </div>

                  <p className="w-full border-b-[1.5px] border-line-warm pb-[14px] text-[14px] font-normal leading-[1.5] text-ink-body sm:text-[15px]">
                    {t.cards[c.subcategory].description}
                  </p>

                  <span className="rounded-[10px] border-2 border-line-strong px-[14px] py-[7px] text-[14px] font-bold leading-[1.3] text-ink">
                    {common.groups[c.group]}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
