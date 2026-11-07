// app/components/catalog/facility-detail.tsx  (used by app/catalog/[slug]/page.tsx)
//
// Facility detail content (Figma "03 Detail – Kit ESP32 / Ruang Sidang / Converter HDMI", node 1:722).
// Step 2 of the 5-step flow. "Pilih jadwal" continues to /catalog/[slug]/schedule.
// Text: CATALOG_TEXT.detail (app/i18n/catalog.ts); facility content via localizeFacility (app/i18n/facilities.ts).
// Client component because the text follows the language preference; the page itself stays a server component.

"use client";

import Link from "next/link";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import CategoryBadge from "@/app/components/ui/category-badge";
import FacilityPhotos from "./facility-photos";
import LevelRequirements from "./level-requirements";
import StatusBadge from "@/app/components/ui/status-badge";
import { bookingMode } from "@/app/data/facilities";
import { useFacilityById } from "@/app/lib/facility-store";
import { loginHref } from "@/app/components/layout/auth-gate";
import { useAuth } from "@/app/lib/auth";
import { CATALOG_TEXT } from "@/app/i18n/catalog";
import { localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";

const BUTTON =
  "font-display inline-flex items-center justify-center whitespace-nowrap rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

/** `slug` is validated by the page (notFound) before this renders. */
export default function FacilityDetail({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const original = useFacilityById(slug);
  const auth = useAuth();
  if (!original) return null;
  const f = localizeFacility(original, locale);
  const t = CATALOG_TEXT[locale].detail;

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb items={[{ label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" }, { label: f.name }]} />

        <Stepper active={2} mode={bookingMode(original)} />

        <div className="mt-1 flex flex-col gap-8 lg:flex-row xl:gap-11">
          {/* Photos from Supabase Storage; the illustration is the fallback */}
          <FacilityPhotos facility={f} alt={f.name} />

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

            {/* Requirements of the permission level (project document "Level") */}
            <LevelRequirements level={f.level} />

            {/* Actions */}
            <div className="flex flex-wrap gap-[14px]">
              {/* booking needs an account: signed-out users go to /login and come back to the schedule */}
              <Link
                href={auth.status === "signed-out" ? loginHref(`/catalog/${f.id}/schedule`) : `/catalog/${f.id}/schedule`}
                className={`${BUTTON} bg-brand-primary text-on-primary`}
              >
                {t.chooseSchedule}
              </Link>
              <Link href="/catalog" className={`${BUTTON} bg-surface text-ink`}>
                {t.back}
              </Link>
            </div>
            {auth.status === "signed-out" && <p className="text-[13px] font-bold text-ink-muted-on-page">{t.signInFirst}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
