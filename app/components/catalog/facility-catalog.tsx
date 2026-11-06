// app/components/catalog/facility-catalog.tsx  (used by app/catalog/page.tsx)
//
// "Katalog" page (Figma "1.4 Katalog", node 148:1201).
// - Toolbar: search + Lokasi / Kapasitas / Tanggal filters (filter-menu.tsx), then category tabs (Semua + CATEGORY_ORDER).
// - "Semua" with nothing filtered: one section per category with its first 4 cards and "Lihat semua n" (opens that tab).
//   Any tab, search, or filter: every match, still grouped in category sections.
// - Rooms with several units (computer-lab-1 … n) collapse into one card ("3 ruang · 30 orang"); the card opens
//   the list of those rooms (?grup=), and each room links to its own detail page.
// Everything is driven by app/data/facilities.ts, so a new facility or category needs no edit here.
// URL state (Indonesian params, shareable): ?q= ?kategori= ?grup= ?lokasi= ?kapasitas= ?tanggal=.
// Colors: CATEGORY_STYLE (app/design/category-style.ts). Text: CATALOG_TEXT.list; facility text via localizeFacility.

"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import { UI_ICONS, illustrationFrame, type IllustrationId } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import StatusBadge from "@/app/components/ui/status-badge";
import FilterMenu, { FilterOption } from "./filter-menu";
import {
  CATEGORY_ORDER,
  FACILITIES as SEED_FACILITIES,
  SUBCATEGORIES,
  facilityLocation,
  isRoomGroup,
  isSubcategory,
  type AvailabilityStatus,
  type Facility,
  type FacilityCategory,
  type LocationKey,
  type RoomGroup,
  type SubcategoryKey,
} from "@/app/data/facilities";
import { CATALOG_TEXT } from "@/app/i18n/catalog";
import { COMMON_TEXT } from "@/app/i18n/common";
import { FACILITY_TEXT, localizeFacility, type FacilityView } from "@/app/i18n/facilities";
import type { Locale } from "@/app/i18n/locale";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";
import { dateNames, parseIsoDate } from "@/app/lib/date";
import { useFacilities } from "@/app/lib/facility-store";

type Tab = "all" | FacilityCategory;
const TABS: readonly Tab[] = ["all", ...CATEGORY_ORDER];

/** Cards per category section on the unfiltered "Semua" tab (Figma: 2 rows of 2). */
const PREVIEW_COUNT = 4;

/** ?kategori= value for each category (kept Indonesian: it is part of the public URL). */
const CATEGORY_PARAMS: Record<FacilityCategory, string> = {
  hardware: "hardware",
  room: "ruang",
  multimedia: "multimedia",
  logistics: "logistik",
};

/** Locations that have at least one facility, in data order. */
const LOCATIONS: readonly LocationKey[] = [...new Set(SEED_FACILITIES.map(facilityLocation))];
/** "Kapasitas" choices: minimum seats (rooms only). */
const CAPACITY_OPTIONS = [10, 30, 100] as const;

type Filters = {
  query: string;
  tab: Tab;
  subcategory: SubcategoryKey | null;
  group: RoomGroup | null;
  location: LocationKey | null;
  capacity: number | null;
  /** yyyy-mm-dd */
  date: string | null;
};

type Menu = "location" | "capacity" | "date";

/** One card: a facility, or a multi-unit room type that opens its list of rooms. */
type Entry = {
  key: string;
  category: FacilityCategory;
  illustration: IllustrationId;
  name: string;
  description: string;
  status: AvailabilityStatus;
  meta: string;
  /** what the permission level asks for (FACILITY_TEXT.requirementsShort); level name first while on loan */
  requirements: string;
} & ({ href: string } | { group: RoomGroup });

/* --------------------------------- URL ---------------------------------- */

/** ?kategori= holds either a category (hardware) or a subcategory from the home page cards (mikrokontroler). */
function resolveCategoryParam(param?: string): Pick<Filters, "tab" | "subcategory"> {
  const key = (param ?? "").toLowerCase();
  const category = CATEGORY_ORDER.find((c) => CATEGORY_PARAMS[c] === key);
  if (category) return { tab: category, subcategory: null };
  if (isSubcategory(key)) return { tab: SUBCATEGORIES[key].category, subcategory: key };
  return { tab: "all", subcategory: null };
}

function toQueryString(f: Filters) {
  const params = new URLSearchParams();
  if (f.query.trim()) params.set("q", f.query.trim());
  const category = f.subcategory ?? (f.tab === "all" ? "" : CATEGORY_PARAMS[f.tab]);
  if (category) params.set("kategori", category);
  if (f.group) params.set("grup", f.group);
  if (f.location) params.set("lokasi", f.location);
  if (f.capacity) params.set("kapasitas", String(f.capacity));
  if (f.date) params.set("tanggal", f.date);
  return params.toString();
}

/* ------------------------------- matching ------------------------------- */

/** Data filters (tab, subcategory, room type, location, capacity, date) on the language-neutral facility. */
function passesFilters(f: Facility, filters: Filters) {
  if (filters.tab !== "all" && f.category !== filters.tab) return false;
  if (filters.subcategory && f.subcategory !== filters.subcategory) return false;
  if (filters.group && f.group !== filters.group) return false;
  if (filters.location && facilityLocation(f) !== filters.location) return false;
  if (filters.capacity && (f.category !== "room" || (f.capacity ?? 0) < filters.capacity)) return false;
  // available on the chosen day: not on loan until that day or later
  if (filters.date && f.borrowedUntil && f.borrowedUntil >= filters.date) return false;
  return true;
}

/** Search: the text in the current language plus the Indonesian name / location. */
const searchText = (shown: FacilityView, indonesian: FacilityView, categoryLabel: string) =>
  `${shown.name} ${shown.description} ${shown.location} ${indonesian.name} ${indonesian.location} ${categoryLabel}`.toLowerCase();

/** Facilities → cards. Unless one room type is open, rooms of the same type share one card. */
function toEntries(views: readonly FacilityView[], collapseRooms: boolean, locale: Locale): Entry[] {
  const text = FACILITY_TEXT[locale];
  // the badge shows the level unless the facility is on loan; then the line names it
  const requirementsOf = (level: FacilityView["level"], status: AvailabilityStatus) =>
    status === "borrowed" ? `${text.statuses[level]} · ${text.requirementsShort[level]}` : text.requirementsShort[level];
  const t = CATALOG_TEXT[locale].list;
  const entries: Entry[] = [];
  const grouped = new Map<RoomGroup, FacilityView[]>();
  for (const f of views) {
    if (collapseRooms && f.group) {
      const list = grouped.get(f.group);
      if (list) {
        list.push(f);
        continue;
      }
      grouped.set(f.group, [f]);
      entries.push({ key: `group:${f.group}`, category: f.category, illustration: f.illustration, name: "", description: "", status: f.level, meta: "", requirements: "", group: f.group });
      continue;
    }
    const { id, category, illustration, name, description, status, meta } = f;
    entries.push({ key: id, category, illustration, name, description, status, meta, requirements: requirementsOf(f.level, status), href: `/catalog/${id}` });
  }
  // fill in the room-type cards now that every room is counted
  return entries.map((e) => {
    if (!("group" in e)) return e;
    const rooms = grouped.get(e.group)!;
    const seats = rooms.map((r) => r.maxQuantity);
    const copy = text.roomGroups[e.group];
    const status: AvailabilityStatus = rooms.every((r) => r.status === "borrowed") ? "borrowed" : rooms[0].level;
    return {
      ...e,
      name: copy.name,
      description: copy.description,
      status,
      requirements: requirementsOf(rooms[0].level, status),
      meta: t.groupMeta(rooms.length, Math.min(...seats), Math.max(...seats)),
    };
  });
}

/* --------------------------------- card --------------------------------- */

const CARD =
  "flex h-full w-full overflow-hidden rounded-[20px] border-2 border-line-strong bg-surface-warm text-left transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus";

function CatalogCard({ entry, categoryLabel, onOpenGroup }: { entry: Entry; categoryLabel: string; onOpenGroup: (g: RoomGroup) => void }) {
  const unavailable = entry.status === "borrowed";
  const style = CATEGORY_STYLE[entry.category];
  const frame = illustrationFrame(entry.illustration);
  const className = `${CARD} ${
    unavailable
      ? "shadow-[4px_4px_0_0_var(--color-shadow-muted)] sm:shadow-[6px_6px_0_0_var(--color-shadow-muted)]"
      : "shadow-[4px_4px_0_0_var(--color-shadow-accent)] sm:shadow-[6px_6px_0_0_var(--color-shadow-accent)]"
  }`;
  const content = (
    <>
      {/* illustration panel (fixed accent fill in both themes) + 2px divider */}
      <span
        className={`flex w-[104px] shrink-0 items-center justify-center self-stretch border-r-2 border-line-strong p-[10px] sm:w-[152px] sm:p-[14px] ${unavailable ? style.panelDimmed : style.panel}`}
      >
        <FacilityIllustration
          id={entry.illustration}
          size={frame}
          className={`${frame === 96 ? "size-[69px] sm:size-[96px]" : "size-[72px] sm:size-[100px]"} ${unavailable ? "opacity-60" : ""}`}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-2 p-4">
        <span className="text-[12px] font-extrabold uppercase leading-[normal] text-ink-accent">{categoryLabel}</span>
        <span className="font-display text-[20px] leading-[normal] text-ink sm:text-[22px]">{entry.name}</span>
        <span className="text-[14px] leading-[21px] text-ink-body">{entry.description}</span>
        <span className="flex flex-wrap items-center gap-x-[10px] gap-y-2">
          <StatusBadge status={entry.status} />
          <span className="text-[13px] font-bold leading-[normal] text-ink-muted">{entry.meta}</span>
        </span>
        <span className="text-[12px] font-bold leading-[normal] text-ink-body">{entry.requirements}</span>
      </span>
    </>
  );

  return (
    <li className="min-w-0">
      {"href" in entry ? (
        <Link href={entry.href} className={className}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={() => onOpenGroup(entry.group)} className={className}>
          {content}
        </button>
      )}
    </li>
  );
}

/* -------------------------------- page --------------------------------- */

type Props = {
  /** from ?q= */
  initialQuery?: string;
  /** from ?kategori= (hardware | ruang | multimedia | logistik | mikrokontroler | ...) */
  initialCategory?: string;
  /** from ?grup= (computer-lab | classroom | discussion-room) */
  initialGroup?: string;
  /** from ?lokasi= */
  initialLocation?: string;
  /** from ?kapasitas= */
  initialCapacity?: string;
  /** from ?tanggal= (yyyy-mm-dd) */
  initialDate?: string;
};

export default function FacilityCatalog({ initialQuery = "", initialCategory, initialGroup, initialLocation, initialCapacity, initialDate }: Props) {
  const { locale } = useLocale();
  const t = CATALOG_TEXT[locale].list;
  const common = COMMON_TEXT[locale];
  const facilityText = FACILITY_TEXT[locale];
  const tabLabel = (tab: Tab) => (tab === "all" ? common.all : common.categories[tab]);

  const [filters, setFilters] = useState<Filters>(() => {
    const capacity = Number(initialCapacity);
    return {
      query: initialQuery,
      ...resolveCategoryParam(initialCategory),
      group: initialGroup && isRoomGroup(initialGroup) ? initialGroup : null,
      location: LOCATIONS.find((l) => l === initialLocation) ?? null,
      capacity: (CAPACITY_OPTIONS as readonly number[]).includes(capacity) ? capacity : null,
      date: initialDate && parseIsoDate(initialDate) ? initialDate : null,
    };
  });
  const [openMenu, setOpenMenu] = useState<Menu | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // update state and keep the URL shareable without triggering a navigation
  const update = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const qs = toQueryString(next);
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };
  /** pick a value from a filter menu, then close it */
  const choose = (patch: Partial<Filters>) => {
    update(patch);
    setOpenMenu(null);
  };
  const toggleMenu = (menu: Menu) => (open: boolean) => setOpenMenu(open ? menu : null);

  const SearchIcon = UI_ICONS.search;
  const ArrowIcon = UI_ICONS.next;

  const term = filters.query.trim().toLowerCase();
  const narrowed = filters.tab !== "all" || !!term || !!filters.subcategory || !!filters.group || !!filters.location || !!filters.capacity || !!filters.date;

  const facilities = useFacilities();
  const counts = useMemo(() => {
    const byCategory = Object.fromEntries(CATEGORY_ORDER.map((c) => [c, facilities.filter((f) => f.category === c).length]));
    return { all: facilities.length, ...byCategory } as Record<FacilityCategory | "all", number>;
  }, [facilities]);
  const sections = useMemo(() => {
    const views = facilities.filter((f) => passesFilters(f, filters))
      .map((f) => ({ shown: localizeFacility(f, locale), indonesian: localizeFacility(f, "id") }))
      .filter(({ shown, indonesian }) => !term || searchText(shown, indonesian, common.categories[shown.category]).includes(term))
      .map(({ shown }) => shown);
    const entries = toEntries(views, !filters.group, locale);
    return CATEGORY_ORDER.map((category) => ({ category, entries: entries.filter((e) => e.category === category) })).filter(
      (s) => s.entries.length > 0,
    );
  }, [facilities, filters, term, locale, common]);

  // "12 Nov" on the Tanggal button
  const chosenDay = filters.date ? parseIsoDate(filters.date) : null;
  const formattedDate = chosenDay ? `${chosenDay.getDate()} ${dateNames(locale).monthsShort[chosenDay.getMonth()]}` : null;

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-24">
      <div className="mx-auto max-w-[1160px]">
        <Breadcrumb items={[{ label: LAYOUT_TEXT[locale].pages.catalog }]} />

        {/* Title */}
        <div className="mt-[18px] flex flex-col gap-[6px]">
          <h1 className="font-display text-[40px] font-normal leading-[normal] text-ink sm:text-[48px] xl:text-[52px]">{t.title}</h1>
          <p className="text-[16px] leading-[normal] text-ink-body">{t.lead(facilities.length)}</p>
        </div>

        {/* Search + filters */}
        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="flex h-[52px] min-w-0 flex-1 items-center gap-[10px] rounded-[14px] border-2 border-line-strong bg-surface px-4 focus-within:border-focus"
          >
            <SearchIcon size={20} strokeWidth={2} aria-hidden className="shrink-0 text-ink-muted" />
            <input
              type="search"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-placeholder"
            />
          </form>

          <div role="group" aria-label={t.filters.label} className="flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
            <FilterMenu
              label={t.filters.location}
              value={filters.location && facilityText.locations[filters.location]}
              open={openMenu === "location"}
              onOpenChange={toggleMenu("location")}
            >
              <FilterOption selected={!filters.location} onSelect={() => choose({ location: null })}>
                {t.filters.anyLocation}
              </FilterOption>
              {LOCATIONS.map((l) => (
                <FilterOption key={l} selected={filters.location === l} onSelect={() => choose({ location: l })}>
                  {facilityText.locations[l]}
                </FilterOption>
              ))}
            </FilterMenu>

            <FilterMenu
              label={t.filters.capacity}
              value={filters.capacity ? t.filters.minPeople(filters.capacity) : null}
              open={openMenu === "capacity"}
              onOpenChange={toggleMenu("capacity")}
            >
              <FilterOption selected={!filters.capacity} onSelect={() => choose({ capacity: null })}>
                {t.filters.anyCapacity}
              </FilterOption>
              {CAPACITY_OPTIONS.map((n) => (
                <FilterOption key={n} selected={filters.capacity === n} onSelect={() => choose({ capacity: n })}>
                  {t.filters.minPeople(n)}
                </FilterOption>
              ))}
              <p className="px-3 pb-1 pt-2 text-[12px] text-ink-muted">{t.filters.capacityNote}</p>
            </FilterMenu>

            <FilterMenu label={t.filters.date} value={formattedDate} open={openMenu === "date"} onOpenChange={toggleMenu("date")} align="right">
              <label className="flex flex-col gap-2 p-2 text-[13px] font-bold text-ink">
                {t.filters.dateNote}
                <input
                  type="date"
                  value={filters.date ?? ""}
                  onChange={(e) => update({ date: e.target.value && parseIsoDate(e.target.value) ? e.target.value : null })}
                  className="h-11 rounded-[10px] border-2 border-line-strong bg-surface-field px-3 text-[14px] font-normal text-ink [color-scheme:inherit]"
                />
              </label>
              {filters.date && (
                <FilterOption selected={false} onSelect={() => choose({ date: null })}>
                  {t.filters.clearDate}
                </FilterOption>
              )}
            </FilterMenu>
          </div>
        </div>

        {/* Category tabs */}
        <div ref={tabsRef} role="group" aria-label={t.filterLabel} className="mt-8 flex scroll-mt-[120px] flex-wrap gap-[10px]">
          {TABS.map((tab) => {
            const active = tab === filters.tab;
            return (
              <button
                key={tab}
                type="button"
                aria-pressed={active}
                onClick={() => update({ tab, subcategory: null, group: null })}
                className={[
                  "inline-flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-line-strong px-4 py-[9px] leading-[normal] transition-colors",
                  active ? "bg-ink text-on-ink shadow-[0_3px_0_0_var(--color-shadow)]" : "bg-surface text-ink hover:bg-surface-warm",
                ].join(" ")}
              >
                <span className="text-[14px] font-extrabold">{tabLabel(tab)}</span>
                <span className={`text-[12px] font-bold ${active ? "text-on-ink-highlight" : "text-ink-muted"}`}>{counts[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* Narrowing that came from elsewhere: a home page card (subcategory) or a room-type card (group) */}
        {(filters.subcategory || filters.group) && (
          <p className="mt-4 text-[14px] font-bold text-ink-body">
            {filters.group ? t.group : t.subcategory}{" "}
            {filters.group ? facilityText.roomGroups[filters.group].name : facilityText.subcategories[filters.subcategory!]}{" "}
            <button
              type="button"
              onClick={() => update(filters.group ? { group: null } : { subcategory: null })}
              className="ml-1 text-link underline underline-offset-2"
            >
              {t.clearSubcategory}
            </button>
          </p>
        )}

        {/* Category sections */}
        {sections.length > 0 ? (
          <div className="mt-8 flex flex-col gap-8">
            {sections.map(({ category, entries }) => {
              const limited = !narrowed && entries.length > PREVIEW_COUNT;
              const headingId = `catalog-${category}`;
              return (
                <section key={category} aria-labelledby={headingId} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-[10px]">
                      <span aria-hidden className={`size-[14px] shrink-0 rounded-[4px] border-2 border-line-strong ${CATEGORY_STYLE[category].dot}`} />
                      <h2 id={headingId} className="font-display text-[24px] font-normal leading-[normal] text-ink sm:text-[28px]">
                        {common.categories[category]}
                      </h2>
                    </div>
                    {!narrowed && (
                      <button
                        type="button"
                        onClick={() => {
                          update({ tab: category });
                          tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="flex shrink-0 items-center gap-[6px] text-[14px] font-extrabold leading-[normal] text-link hover:underline"
                      >
                        {t.seeAll(counts[category])}
                        <ArrowIcon size={16} strokeWidth={2.5} aria-hidden />
                      </button>
                    )}
                  </div>

                  <ul className="grid grid-cols-1 gap-[22px] lg:grid-cols-2 lg:gap-6">
                    {(limited ? entries.slice(0, PREVIEW_COUNT) : entries).map((entry) => (
                      <CatalogCard
                        key={entry.key}
                        entry={entry}
                        categoryLabel={common.categories[entry.category]}
                        onOpenGroup={(group) => {
                          update({ tab: "room", subcategory: null, group });
                          tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-[20px] border-2 border-dashed border-line-strong bg-surface/60 p-8 text-center">
            <p className="font-display text-[24px] leading-[1.1] text-ink">{t.emptyTitle}</p>
            <p className="mt-2 text-[15px] text-ink-body">{t.emptyText}</p>
          </div>
        )}
      </div>
    </main>
  );
}
