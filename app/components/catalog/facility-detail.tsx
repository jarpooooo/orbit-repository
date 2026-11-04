// app/components/catalog/facility-detail.tsx  (used by app/catalog/[slug]/page.tsx)
//
// Facility detail content (Figma "03 Detail – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:722).
// Step 2 of the 5-step flow. "Pilih jadwal" continues to /catalog/[slug]/schedule.
// Text: CATALOG_TEXT.detail (app/i18n/catalog.ts); facility content via localizeFacility (app/i18n/facilities.ts).
// Client component because the text follows the language preference; the page itself stays a server component.

"use client";

import Link from "next/link";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import CategoryBadge from "@/app/components/ui/category-badge";
import FacilityIllustration, { LetterMark } from "@/app/components/ui/facility-illustration";
import StatusBadge from "@/app/components/ui/status-badge";
import { STATUS_STYLES, bookingMode, getFacility } from "@/app/data/facilities";
import { CATALOG_TEXT } from "@/app/i18n/catalog";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";

const BUTTON =
  "font-display inline-flex items-center justify-center whitespace-nowrap rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

/** `slug` is validated by the page (notFound) before this renders. */
export default function FacilityDetail({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const original = getFacility(slug);
  if (!original) return null;
  const f = localizeFacility(original, locale);
  const t = CATALOG_TEXT[locale].detail;
  const note = FACILITY_TEXT[locale].permissionNotes[f.level];

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb items={[{ label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" }, { label: f.name }]} />

        <Stepper active={2} mode={bookingMode(original)} />

        <div className="mt-1 flex flex-col gap-8 lg:flex-row xl:gap-11">
          {/* Illustration panel */}
          <div
            className={`flex h-[260px] w-full shrink-0 items-center justify-center rounded-[22px] border-2 border-line-strong p-8 shadow-[5px_5px_0_0_var(--color-shadow-accent)] sm:h-[340px] sm:shadow-[7px_7px_0_0_var(--color-shadow-accent)] lg:h-[400px] lg:w-[420px] xl:w-[520px] ${CATEGORY_STYLE[f.category].panel}`}
          >
            <FacilityIllustration id={f.illustration} size={260} preload className="size-[180px] sm:size-[240px] xl:size-[260px]" />
          </div>

          {/* Info */}
          <div className="flex min-w-0 flex-1 flex-col items-start gap-[14px]">
            <CategoryBadge category={f.category} />
            <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[54px]">{f.name}</h1>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={f.status} leading="leading-none" />
              <span className="text-[14px] font-bold text-ink-muted-on-page">{f.availability}</span>
            </div>

            <p className="text-[16px] font-normal leading-[26px] text-ink-body sm:text-[17px]">{f.description}</p>

            {/* Specs */}
            <dl className="w-full overflow-hidden rounded-2xl border-2 border-line-strong bg-surface text-[14px]">
              {f.specs.map(([label, value], i) => (
                <div key={label} className={`flex gap-4 px-4 py-[10px] ${i % 2 === 0 ? "bg-surface-row" : "bg-surface"}`}>
                  <dt className="w-[104px] shrink-0 font-extrabold text-ink sm:w-[130px]">{label}</dt>
                  <dd className="min-w-0 flex-1 text-ink-body">{value}</dd>
                </div>
              ))}
            </dl>

            {/* Permission note ("letter" level: marked with the signed-letter illustration) */}
            <div
              className={`flex w-full items-center gap-3 rounded-2xl border-2 border-line-strong p-[14px] text-[14px] ${STATUS_STYLES[f.level].box}`}
            >
              {f.level === "letter" && <LetterMark />}
              <p className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-[10px]">
                <span className="shrink-0 font-extrabold text-ink">{note.title}</span>
                <span className="text-ink-body">{note.text}</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-[14px]">
              <Link href={`/catalog/${f.id}/schedule`} className={`${BUTTON} bg-brand-primary text-on-primary`}>
                {t.chooseSchedule}
              </Link>
              <Link href="/catalog" className={`${BUTTON} bg-surface text-ink`}>
                {t.back}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
