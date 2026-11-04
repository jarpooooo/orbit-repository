// app/components/catalog/booking/daily-scheduler.tsx
//
// "Kapan kamu pinjam?" (Figma 2.2 "Schedule · Pilih tanggal", node 149:1396) for "daily" facilities.
// - Two-week calendar (Mon–Sun) with ‹ › paging, up to MAX_MONTHS_AHEAD ahead.
// - Picking works in two explicit steps, shown by the AMBIL / KEMBALI tiles (also buttons):
//     1. "Ambil": a click sets the pick-up day, then the calendar switches to "Kembali".
//     2. "Kembali": a click sets / moves the return day. Days the loan cannot reach (beyond maxDays, past a
//        sold-out day) are dimmed, and hovering a reachable day previews the range.
//   Clicking a day before the pick-up day, or the AMBIL tile, changes the pick-up day instead.
//   A day shows a stock dot (aman / sedikit / habis); "Habis" and "Tutup" days cannot start or end a loan.
//   Closed days in the middle are fine (the item stays with the borrower). Rules: validateSelection().
// - "Jumlah unit" stepper capped by the stock for the whole loan.
// - Draft summary with "Lanjut isi data" → /catalog/[id]/request?ambil=&kembali=&jumlah=.
// Availability: getDailyAvailability() (app/data/availability.ts). Text: BOOKING_TEXT.daily.

"use client";

import { useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import { UI_ICONS, illustrationFrame } from "@/app/design/icon-map";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import { getDailyAvailability, type StockLevel } from "@/app/data/availability";
import { maxDays } from "@/app/data/facilities";
import { formatTimeRange } from "@/app/i18n/common";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import { useLocale } from "@/app/components/layout/language";
import {
  PICKUP_HOURS,
  RETURN_BEFORE,
  firstPickupDate,
  isHandoverDay,
  lastBookableDate,
  loanDays,
  toSelectionQuery,
  unitsFreeBetween,
  validateSelection,
  type DailySelection,
} from "@/app/lib/booking";
import { addDays, dateNames, startOfWeek, toIsoDate } from "@/app/lib/date";
import { ASIDE, ContinueButton, QuantityStepper, SECTION_TITLE, SummaryRows, moveFocus } from "./parts";
import { dayLabel } from "./describe";
import type { SchedulerProps } from "./registry";

const WINDOW_DAYS = 14;
const CONTROL =
  "inline-flex size-9 items-center justify-center rounded-[10px] border-2 border-line-strong bg-surface text-ink transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0";

/** Stock dot under the day number. */
const DOT: Record<Exclude<StockLevel, "closed">, string> = {
  ok: "bg-status-available",
  low: "bg-status-attention",
  out: "bg-stock-out",
};

type Editing = "pickup" | "return";

export default function DailyScheduler({ facility: original, now }: SchedulerProps) {
  const { locale } = useLocale();
  const f = localizeFacility(original, locale);
  const text = BOOKING_TEXT[locale];
  const t = text.daily;
  const names = dateNames(locale);
  const PrevIcon = UI_ICONS.back;
  const NextIcon = UI_ICONS.next;
  const CalendarIcon = UI_ICONS.calendar;
  const ClockIcon = UI_ICONS.hours;
  const ArrowIcon = UI_ICONS.next;
  const limit = maxDays(original);

  const minIso = toIsoDate(firstPickupDate(now));
  const maxIso = toIsoDate(lastBookableDate(now));
  const inRange = (iso: string) => iso >= minIso && iso <= maxIso;
  /** a loan can start or end on this day */
  const handover = (iso: string) => inRange(iso) && isHandoverDay(f.id, iso);

  // default: the first possible pick-up day; the return day is chosen next
  const [pickup, setPickup] = useState<string | null>(
    () => Array.from({ length: 60 }, (_, i) => toIsoDate(addDays(firstPickupDate(now), i))).find(handover) ?? null,
  );
  const [returnDate, setReturnDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(() => (pickup ? "return" : "pickup"));
  const [hovered, setHovered] = useState<string | null>(null);
  const [wanted, setWanted] = useState(1);
  const [windowStart, setWindowStart] = useState(() => startOfWeek(firstPickupDate(now)));

  /** `iso` can be the return day for the current pick-up day */
  const reachable = (iso: string) =>
    !!pickup && iso >= pickup && !validateSelection({ mode: "daily", pickupDate: pickup, returnDate: iso, units: 1 }, original, now);

  const choose = (iso: string) => {
    if (!handover(iso)) return;
    if (editing === "pickup" || !pickup || iso < pickup) {
      setPickup(iso);
      // keep the return day only if it still makes a valid loan with the new pick-up day
      if (returnDate && validateSelection({ mode: "daily", pickupDate: iso, returnDate, units: 1 }, original, now)) setReturnDate(null);
      setEditing("return");
      return;
    }
    if (reachable(iso)) setReturnDate(iso);
  };

  const days = Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(windowStart, i));
  const first = days[0];
  const last = days[WINDOW_DAYS - 1];
  const rangeTitle =
    first.getMonth() === last.getMonth()
      ? `${names.months[last.getMonth()]} ${last.getFullYear()}`
      : `${names.months[first.getMonth()]} – ${names.months[last.getMonth()]} ${last.getFullYear()}`;
  const prevDisabled = toIsoDate(windowStart) <= minIso;
  const nextDisabled = toIsoDate(addDays(windowStart, WINDOW_DAYS)) > maxIso;

  // range shown in the calendar: the chosen one, or a preview up to the hovered day
  const previewEnd = editing === "return" && hovered && reachable(hovered) ? hovered : returnDate;

  const stock = pickup && returnDate ? unitsFreeBetween(f.id, pickup, returnDate) : pickup ? unitsFreeBetween(f.id, pickup, pickup) : 0;
  const units = stock === 0 ? 0 : Math.min(Math.max(wanted, 1), stock);
  const selection: DailySelection | null = pickup && returnDate ? { mode: "daily", pickupDate: pickup, returnDate, units } : null;
  const error = selection ? validateSelection(selection, original, now) : pickup ? "returnRequired" : "pickupRequired";

  // roving focus: the day being edited (or the first usable day of the window) is the tab stop
  const isoDays = days.map(toIsoDate);
  const tabStop = isoDays.find((iso) => iso === (editing === "return" ? (returnDate ?? pickup) : pickup)) ?? isoDays.find(handover);

  const deposit = original.level === "direct" ? FACILITY_TEXT[locale].deposit.none : FACILITY_TEXT[locale].deposit.studentId;
  const quantityLabel = FACILITY_TEXT[locale].quantity(units, f.unit);
  const frame = illustrationFrame(f.illustration);

  const tiles = [
    {
      key: "pickup" as const,
      label: t.pickupTile,
      action: t.editPickup,
      date: pickup,
      hint: t.pickupHint(formatTimeRange(PICKUP_HOURS, locale)),
      Icon: CalendarIcon,
      iconClass: "bg-brand-secondary text-on-secondary",
    },
    {
      key: "return" as const,
      label: t.returnTile,
      action: t.editReturn,
      date: returnDate,
      hint: t.returnHint(formatTimeRange(RETURN_BEFORE, locale)),
      Icon: ClockIcon,
      iconClass: "bg-surface text-ink",
    },
  ];

  return (
    <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[52px]">{t.title}</h1>
          <p className="text-[16px] text-ink-body sm:text-[17px]">{t.lead(limit)}</p>
        </div>

        {/* Calendar */}
        <section
          aria-label={t.calendarLabel}
          className="rounded-[20px] border-2 border-line-strong bg-surface p-4 shadow-[5px_5px_0_0_var(--color-shadow)] sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 aria-live="polite" className="font-display text-[20px] font-normal leading-[normal] text-ink">
              {rangeTitle}
            </h2>
            <div className="flex gap-2">
              <button type="button" aria-label={t.prevRange} disabled={prevDisabled} onClick={() => setWindowStart(addDays(windowStart, -WINDOW_DAYS))} className={CONTROL}>
                <PrevIcon size={16} strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" aria-label={t.nextRange} disabled={nextDisabled} onClick={() => setWindowStart(addDays(windowStart, WINDOW_DAYS))} className={CONTROL}>
                <NextIcon size={16} strokeWidth={2.5} aria-hidden />
              </button>
            </div>
          </div>

          {/* what the next click does */}
          <p aria-live="polite" className="mt-2 text-[13px] font-bold text-ink-body">
            {editing === "pickup" ? t.pickPickup : t.pickReturn(limit)}
          </p>

          <div data-nav-root className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2.5" onPointerLeave={() => setHovered(null)}>
            {[1, 2, 3, 4, 5, 6, 0].map((wd) => (
              <span key={wd} aria-hidden className="pb-1 text-center text-[12px] font-bold text-ink-muted sm:text-[13px]">
                {names.daysShort[wd]}
              </span>
            ))}
            {days.map((d) => {
              const iso = toIsoDate(d);
              const avail = getDailyAvailability(f.id, iso);
              const outOfRange = !inRange(iso);
              const closedOrOut = !outOfRange && avail.units === 0;
              // while choosing the return day, days after the pick-up day that the loan cannot reach
              const beyondReach = editing === "return" && !!pickup && iso > pickup && !closedOrOut && !outOfRange && !reachable(iso);
              const blocked = outOfRange || closedOrOut || beyondReach;
              const isPickup = iso === pickup;
              const isReturn = iso === returnDate && returnDate !== pickup;
              const sameDayReturn = isPickup && returnDate === pickup;
              const between = !!pickup && !!previewEnd && iso > pickup && iso < previewEnd;
              const isPreviewEnd = !isReturn && iso === previewEnd && iso !== pickup;
              const tag = isPickup ? (sameDayReturn ? `${t.pickupTag} · ${t.returnTag}` : t.pickupTag) : isReturn ? t.returnTag : null;
              const stateLabel = outOfRange ? null : beyondReach ? t.outOfReach : t.stock[avail.level];
              return (
                <button
                  key={iso}
                  type="button"
                  data-nav
                  tabIndex={iso === tabStop ? 0 : -1}
                  aria-disabled={blocked || undefined}
                  aria-pressed={isPickup || isReturn}
                  aria-label={[dayLabel(iso, locale, true), stateLabel, tag].filter(Boolean).join(", ")}
                  onClick={() => choose(iso)}
                  onPointerEnter={() => setHovered(iso)}
                  onFocus={() => setHovered(iso)}
                  onKeyDown={(e) => moveFocus(e, 7)}
                  className={[
                    "flex h-[60px] flex-col items-center justify-center gap-[3px] rounded-[12px] border-2 leading-none transition-transform sm:h-[68px]",
                    isPickup || isReturn
                      ? "border-line-strong bg-brand-secondary text-on-secondary shadow-[0_4px_0_0_var(--color-shadow)]"
                      : between || isPreviewEnd
                        ? `border-line-strong bg-surface-row text-ink ${isPreviewEnd ? "border-dashed" : ""}`
                        : closedOrOut || outOfRange
                          ? `cursor-not-allowed border-line bg-status-unavailable-bg text-ink-muted ${outOfRange ? "opacity-50" : ""}`
                          : beyondReach
                            ? "cursor-not-allowed border-line bg-surface text-ink-muted opacity-50"
                            : "border-line-strong bg-surface text-ink hover:-translate-y-0.5",
                  ].join(" ")}
                >
                  <span className="font-display text-[20px] sm:text-[22px]">{d.getDate()}</span>
                  {tag ? (
                    <span className="text-center text-[10px] font-extrabold leading-tight sm:text-[12px]">{tag}</span>
                  ) : outOfRange ? (
                    <span className="h-2" />
                  ) : avail.level === "closed" ? (
                    <span className="text-[10px] font-bold sm:text-[12px]">{t.stock.closed}</span>
                  ) : avail.level === "out" ? (
                    <span className="text-[10px] font-extrabold text-stock-out-fg sm:text-[12px]">{t.stock.out}</span>
                  ) : (
                    <span aria-hidden className={`size-2 rounded-full border-[1.5px] border-line-strong ${DOT[avail.level]}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-ink-muted sm:text-[13px]">
            {(["ok", "low", "out"] as const).map((level) => (
              <li key={level} className="flex items-center gap-[6px]">
                <span aria-hidden className={`size-2 rounded-full ${DOT[level]}`} />
                {t.stock[level]}
              </li>
            ))}
          </ul>
        </section>

        {/* Pick-up / return tiles: also switch what the calendar is choosing */}
        <div role="group" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tiles.map(({ key, label, action, date, hint, Icon, iconClass }) => {
            const active = editing === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                aria-label={`${action}: ${date ? dayLabel(date, locale) : t.notChosen}`}
                disabled={key === "return" && !pickup}
                onClick={() => setEditing(key)}
                className={[
                  "flex items-center gap-4 rounded-[16px] border-2 px-5 py-4 text-left transition-transform disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-line-strong bg-surface-row shadow-[0_4px_0_0_var(--color-shadow)]"
                    : "border-line-strong bg-surface hover:-translate-y-0.5",
                ].join(" ")}
              >
                <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-[10px] border-2 border-line-strong ${iconClass}`}>
                  <Icon size={20} strokeWidth={2.25} />
                </span>
                <span className="flex min-w-0 flex-col gap-[2px] leading-[normal]">
                  <span className="text-[11px] font-extrabold text-ink-muted">
                    {label}
                    {active && <span className="ml-2 text-link">· {t.choosing}</span>}
                  </span>
                  <span className="font-display text-[20px] text-ink">{date ? dayLabel(date, locale) : t.notChosen}</span>
                  <span className="text-[13px] text-ink-body">{hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Units */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className={SECTION_TITLE}>{t.unitsTitle}</h2>
            <p className="text-[13px] text-ink-muted-on-page">{t.unitsAvailable(stock)}</p>
          </div>
          <QuantityStepper
            value={units}
            min={stock === 0 ? 0 : 1}
            max={stock}
            onChange={setWanted}
            labels={{ decrease: text.schedule.decrease, increase: text.schedule.increase, value: t.unitsTitle }}
          />
        </div>
      </div>

      {/* Draft summary */}
      <aside className={ASIDE}>
        <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.summaryTitle}</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className={`flex size-[72px] shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong ${CATEGORY_STYLE[f.category].panel}`}>
            <FacilityIllustration id={f.illustration} size={frame} className="size-[54px]" />
          </span>
          <span className="flex min-w-0 flex-col gap-1 leading-[normal]">
            <span className="font-display text-[20px] text-ink">{f.name}</span>
            <span className="text-[13px] text-ink-muted">{selection ? t.loanMeta(loanDays(selection), quantityLabel) : "-"}</span>
          </span>
        </div>
        <div className="mt-4 rounded-[14px] bg-surface-field px-4 py-1">
          <SummaryRows
            divided
            rows={[
              [text.summaryRows.pickup, pickup ? dayLabel(pickup, locale) : "-"],
              [text.summaryRows.return, returnDate ? dayLabel(returnDate, locale) : "-"],
              [text.summaryRows.deposit, deposit],
            ]}
          />
        </div>
        <p className="mt-4 text-[12px] leading-[1.5] text-ink-muted">{t.cancelNote(formatTimeRange(PICKUP_HOURS.split("–")[1], locale))}</p>
        <ContinueButton
          href={selection && !error ? `/catalog/${f.id}/request?${toSelectionQuery(selection)}` : null}
          label={t.continue}
          error={error ? text.scheduleErrors[error] : null}
          icon={<ArrowIcon size={18} strokeWidth={2.5} aria-hidden />}
        />
      </aside>
    </div>
  );
}
