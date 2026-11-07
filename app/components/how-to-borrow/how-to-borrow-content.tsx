// app/components/how-to-borrow/how-to-borrow-content.tsx  (used by app/how-to-borrow/page.tsx)
//
// "Cara Pinjam" page content (Figma node 5:847, mislabeled "08 Notifikasi (panel terbuka)" in Figma):
//   1) 3 permission-level cards (Langsung / Menunggu verifikasi / Butuh surat)
//   2) 5 step cards: Jelajah → Pilih → Jadwal → Ajukan → Ringkasan
//   3) #ketentuan: the borrowing rules (the same list as the request form, BOOKING_TEXT.request.rules);
//      the summary page links here
// Deviation from Figma: the step texts there are shifted by one and steps 4 & 5 are identical,
// so the texts were adjusted to match the step names and the actual app flow.
// Text: HOW_TO_BORROW_TEXT (app/i18n/how-to-borrow.ts), step names from LAYOUT_TEXT.stepper, permission texts
// from FACILITY_TEXT.permissionNotes. Client component because the text follows the language preference.

"use client";

import Breadcrumb from "@/app/components/layout/breadcrumb";
import StatusBadge from "@/app/components/ui/status-badge";
import type { PermissionLevel } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { FACILITY_TEXT } from "@/app/i18n/facilities";
import { HOW_TO_BORROW_TEXT } from "@/app/i18n/how-to-borrow";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";

/** Card order as in Figma. */
const PERMISSION_CARDS: readonly PermissionLevel[] = ["direct", "verification", "letter"];

/** Number chip colors for the 5 steps. */
const STEP_TONES = ["bg-sun-200", "bg-mint-300", "bg-periwinkle-400", "bg-tangerine-400", "bg-tangerine-400"] as const;

export default function HowToBorrowContent() {
  const { locale } = useLocale();
  const t = HOW_TO_BORROW_TEXT[locale];
  const stepNames = LAYOUT_TEXT[locale].stepper.steps;
  const notes = FACILITY_TEXT[locale].permissionNotes;

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px] xl:pb-[90px]">
      <div className="mx-auto flex max-w-[1258px] flex-col items-start gap-5">
        <Breadcrumb items={[{ label: t.title }]} />

        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">{t.title}</h1>
        <p className="max-w-[622px] text-[16px] leading-normal text-ink-body sm:text-[18px]">{t.lead}</p>

        {/* Permission levels */}
        <section aria-labelledby="permission-heading" className="mt-6 w-full sm:mt-10">
          <h2 id="permission-heading" className="sr-only">
            {t.permissionHeading}
          </h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-[35px]">
            {PERMISSION_CARDS.map((level) => (
              <li
                key={level}
                className="flex flex-col items-start gap-2 rounded-[22px] border-2 border-line-strong bg-surface p-[22px] shadow-[5px_5px_0_0_var(--color-shadow-interactive)] sm:shadow-[6px_6px_0_0_var(--color-shadow-interactive)]"
              >
                <StatusBadge status={level} label={t.permissionBadges[level]} />
                <p className="text-[15px] leading-[1.5] text-ink">{notes[level].text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section aria-labelledby="steps-heading" className="mt-6 w-full sm:mt-10">
          <h2 id="steps-heading" className="sr-only">
            {t.stepsHeading}
          </h2>
          <ol className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stepNames.map((name, i) => (
              <li key={name} className="flex flex-col items-start gap-[10px] rounded-[20px] border-2 border-line-inverse-on-page bg-surface-inverse-raised p-6">
                <span
                  className={`font-display flex size-12 items-center justify-center rounded-[14px] text-[24px] leading-[1.05] text-on-accent ${STEP_TONES[i]}`}
                >
                  {i + 1}
                </span>
                <h3 className="text-[20px] font-bold leading-[1.3] text-white">{name}</h3>
                <p className="text-[16px] leading-[1.55] text-ink-on-inverse">{t.stepTexts[i]}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Rules (target of "Lihat ketentuan lengkap" on the summary page) */}
        <section id="ketentuan" aria-labelledby="rules-heading" className="mt-6 w-full scroll-mt-[120px] sm:mt-10">
          <h2 id="rules-heading" className="font-display text-[32px] font-normal leading-none text-ink sm:text-[40px]">
            {t.rulesHeading}
          </h2>
          <p className="mt-2 max-w-[720px] text-[15px] leading-[1.5] text-ink-body sm:text-[17px]">{t.rulesLead}</p>
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-[35px]">
            {(["daily", "session"] as const).map((mode) => (
              <div
                key={mode}
                className="flex flex-col gap-3 rounded-[22px] border-2 border-line-strong bg-surface p-[22px] shadow-[5px_5px_0_0_var(--color-shadow)]"
              >
                <h3 className="font-display text-[22px] font-normal leading-[normal] text-ink">{t.rulesGroups[mode]}</h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-[1.5] text-ink-body">
                  {BOOKING_TEXT[locale].request.rules[mode].map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
