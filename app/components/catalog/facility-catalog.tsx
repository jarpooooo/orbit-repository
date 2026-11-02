// app/components/catalog/facility-catalog.tsx  (used by app/catalog/page.tsx)
//
// "Katalog fasilitas" page (Figma 02 Katalog – Semua / Hardware / Ruang / Logistik, node 1:205).
// One component for 4 frames: the Semua / Hardware / Ruang / Logistik chips filter the cards.
// Also honors ?q= (from the navbar / hero) and ?kategori= (from the "Mau pinjam apa hari ini?" cards).
// Illustrations: FACILITY_ILLUSTRATIONS from icon-map (public/img/illustrations/*.svg).
// Text: CATALOG_TEXT.list (app/i18n/catalog.ts); facility content via localizeFacility (app/i18n/facilities.ts).
// Client component: ?q= and ?kategori= are read by the server page and passed in as props.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { FACILITY_ILLUSTRATIONS, UI_ICON_DEFAULTS, UI_ICONS } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import StatusBadge from "@/app/components/ui/status-badge";
import {
  FACILITIES,
  FACILITY_GROUPS,
  SUBCATEGORIES,
  isSubcategory,
  type Facility,
  type FacilityGroup,
  type SubcategoryKey,
} from "@/app/data/facilities";
import { CATALOG_TEXT } from "@/app/i18n/catalog";
import { COMMON_TEXT } from "@/app/i18n/common";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";

type Filter = "all" | FacilityGroup;
const FILTERS: readonly Filter[] = ["all", ...FACILITY_GROUPS];

/** ?kategori= value for each group (kept Indonesian: it is part of the public URL). */
const GROUP_PARAMS: Record<FacilityGroup, string> = { hardware: "hardware", room: "ruang", logistics: "logistik" };

const COUNTS: Record<Filter, number> = {
  all: FACILITIES.length,
  hardware: FACILITIES.filter((f) => f.group === "hardware").length,
  room: FACILITIES.filter((f) => f.group === "room").length,
  logistics: FACILITIES.filter((f) => f.group === "logistics").length,
};

/** ?kategori= holds either a group (hardware) or a subcategory from the home page cards (mikrokontroler). */
function resolveCategoryParam(param?: string): { filter: Filter; subcategory: SubcategoryKey | null } {
  const key = (param ?? "").toLowerCase();
  const group = FACILITY_GROUPS.find((g) => GROUP_PARAMS[g] === key);
  if (group) return { filter: group, subcategory: null };
  if (isSubcategory(key)) return { filter: SUBCATEGORIES[key].group, subcategory: key };
  return { filter: "all", subcategory: null };
}

function FacilityCard({ facility, groupLabel }: { facility: Facility; groupLabel: string }) {
  const unavailable = facility.status === "borrowed";
  return (
    <li className="min-w-0">
      <Link
        href={`/catalog/${facility.slug}`}
        className={[
          "flex h-full overflow-hidden rounded-[20px] border-2 border-line-strong bg-surface-warm transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus",
          unavailable
            ? "shadow-[4px_4px_0_0_var(--color-shadow-muted)] sm:shadow-[6px_6px_0_0_var(--color-shadow-muted)]"
            : "shadow-[4px_4px_0_0_var(--color-shadow-accent)] sm:shadow-[6px_6px_0_0_var(--color-shadow-accent)]",
        ].join(" ")}
      >
        {/* illustration panel: only the background and image fade; the divider keeps the full outline color */}
        <div
          className={`flex w-[104px] shrink-0 items-center justify-center border-r-2 border-line-strong p-[10px] sm:w-[152px] sm:p-[14px] ${unavailable ? "bg-sun-200/60" : "bg-sun-200"}`}
        >
          <Image
            src={FACILITY_ILLUSTRATIONS[facility.illustration]}
            alt=""
            width={100}
            height={100}
            className={`size-[72px] sm:size-[100px] ${unavailable ? "opacity-60" : ""}`}
          />
        </div>

        {/* body */}
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 p-4">
          <span className="text-[12px] font-extrabold uppercase leading-none text-ink-accent">{groupLabel}</span>
          <h3 className="font-display text-[20px] font-normal leading-[1.1] text-ink sm:text-[22px]">{facility.name}</h3>
          <p className="text-[14px] font-normal leading-[21px] text-ink-body">{facility.description}</p>
          <div className="flex flex-wrap items-center gap-x-[10px] gap-y-2">
            <StatusBadge status={facility.status} leading="leading-none" />
            {facility.meta && <span className="whitespace-nowrap text-[13px] font-bold text-ink-muted">{facility.meta}</span>}
          </div>
        </div>
      </Link>
    </li>
  );
}

type Props = {
  /** from ?q= */
  initialQuery?: string;
  /** from ?kategori= (hardware | ruang | logistik | mikrokontroler | ...) */
  initialCategory?: string;
};

export default function FacilityCatalog({ initialQuery = "", initialCategory }: Props) {
  const { locale } = useLocale();
  const t = CATALOG_TEXT[locale].list;
  const common = COMMON_TEXT[locale];
  const subcategoryLabels = FACILITY_TEXT[locale].subcategories;
  const filterLabel = (f: Filter) => (f === "all" ? common.all : common.groups[f]);
  const initial = resolveCategoryParam(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<Filter>(initial.filter);
  const [subcategory, setSubcategory] = useState<SubcategoryKey | null>(initial.subcategory);

  const SearchIcon = UI_ICONS.search;

  // search matches the text in the current language and the Indonesian original (names, location)
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return FACILITIES.map((f) => ({ original: f, shown: localizeFacility(f, locale) })).filter(
      ({ original: f, shown }) =>
        (filter === "all" || f.group === filter) &&
        (!subcategory || f.subcategory === subcategory) &&
        (!term ||
          `${shown.name} ${shown.description} ${shown.location} ${f.name} ${f.location} ${common.groups[f.group]}`.toLowerCase().includes(term)),
    );
  }, [query, filter, subcategory, locale, common]);

  // keep the URL shareable without triggering a navigation
  const syncUrl = (nextQuery: string, nextFilter: Filter, nextSubcategory: SubcategoryKey | null) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    const category = nextSubcategory ?? (nextFilter === "all" ? "" : GROUP_PARAMS[nextFilter]);
    if (category) params.set("kategori", category);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-[72px]">
      <div className="mx-auto max-w-[1160px]">
        <Breadcrumb items={[{ label: LAYOUT_TEXT[locale].pages.catalog }]} />

        <h1 className="font-display mt-[18px] text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">
          {t.title}
        </h1>
        <p className="mt-[18px] text-[16px] font-normal leading-[1.5] text-ink-body sm:text-[18px]">
          {t.lead}
        </p>

        {/* Toolbar */}
        <div className="mt-[18px] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex h-[46px] w-full items-center gap-2 rounded-[14px] border-2 border-line-strong bg-surface px-4 focus-within:border-focus lg:max-w-[420px]"
          >
            <SearchIcon {...UI_ICON_DEFAULTS} size={18} aria-hidden className="shrink-0 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                syncUrl(e.target.value, filter, subcategory);
              }}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-placeholder"
            />
          </form>

          <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-[14px]">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setFilter(f);
                    setSubcategory(null);
                    syncUrl(query, f, null);
                  }}
                  className={[
                    "inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-line-strong px-[18px] py-2 transition-colors",
                    active ? "bg-brand-secondary shadow-[0_3px_0_0_var(--color-shadow)]" : "bg-surface hover:bg-surface-warm",
                  ].join(" ")}
                >
                  <span className={`text-[15px] font-extrabold leading-none ${active ? "text-on-secondary" : "text-ink"}`}>{filterLabel(f)}</span>
                  <span className={`text-[13px] font-bold leading-none ${active ? "text-on-accent-muted" : "text-ink-muted"}`}>{COUNTS[f]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory filter coming from the home page */}
        {subcategory && (
          <p className="mt-4 text-[14px] font-bold text-ink-body">
            {t.subcategory} {subcategoryLabels[subcategory]}{" "}
            <button
              type="button"
              onClick={() => {
                setSubcategory(null);
                syncUrl(query, filter, null);
              }}
              className="ml-1 text-link underline underline-offset-2"
            >
              {t.clearSubcategory}
            </button>
          </p>
        )}

        {/* Card grid */}
        {visible.length > 0 ? (
          <ul className="mt-8 grid grid-cols-1 gap-[22px] lg:grid-cols-2 lg:gap-[26px] xl:mt-10">
            {visible.map(({ shown }) => (
              <FacilityCard key={shown.slug} facility={shown} groupLabel={common.groups[shown.group]} />
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[20px] border-2 border-dashed border-line-strong bg-surface/60 p-8 text-center xl:mt-10">
            <p className="font-display text-[24px] leading-[1.1] text-ink">{t.emptyTitle}</p>
            <p className="mt-2 text-[15px] text-ink-body">{t.emptyText}</p>
          </div>
        )}
      </div>
    </main>
  );
}
