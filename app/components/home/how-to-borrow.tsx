// app/components/home/how-to-borrow.tsx
//
// "Empat langkah, dari cari sampai ambil" section (Figma node 1:3262, desktop 1440px).
// Inverse (navy) card + yellow shadow, 4 step cards, 3 permission levels (Langsung / Verifikasi / Butuh surat).
// No image assets: numbers, labels, and lines are all CSS.
// Text: HOME_TEXT.howToBorrow (app/i18n/home.ts). Client component because the text follows the language preference.

"use client";

import type { PermissionLevel } from "@/app/data/facilities";
import { COMMON_TEXT } from "@/app/i18n/common";
import { HOME_TEXT, type HomeStepKey } from "@/app/i18n/home";
import { useLocale } from "@/app/components/layout/language";

const STEPS: readonly { no: number; key: HomeStepKey; tone: string }[] = [
  { no: 1, key: "search", tone: "bg-sun-200" },
  { no: 2, key: "schedule", tone: "bg-mint-300" },
  { no: 3, key: "request", tone: "bg-periwinkle-400" },
  { no: 4, key: "pickup", tone: "bg-tangerine-400" },
];

const PERMISSION_LEVELS: readonly { level: PermissionLevel; pill: string }[] = [
  { level: "direct", pill: "bg-level-direct-bg text-level-direct-fg" },
  { level: "verification", pill: "bg-level-verification-bg text-level-verification-fg" },
  { level: "letter", pill: "bg-level-letter-bg text-level-letter-fg" },
];

export default function HowToBorrow() {
  const { locale } = useLocale();
  const t = HOME_TEXT[locale].howToBorrow;
  const levelLabels = COMMON_TEXT[locale].levels;

  return (
    <section id="cara-singkat" className="bg-surface px-5 pb-14 pt-4 sm:px-8 sm:pb-16 xl:px-[110px] xl:pb-24">
      <div className="mx-auto max-w-[1220px] rounded-[24px] border-2 border-line-strong bg-surface-inverse px-5 py-9 shadow-[6px_6px_0_0_var(--color-sun-200)] sm:rounded-[32px] sm:px-8 sm:py-12 sm:shadow-hard-sun xl:px-12 xl:py-14">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-[32px] font-normal leading-none text-white sm:text-[42px] xl:text-[52px]">{t.title}</h2>
          <p className="text-[16px] font-normal leading-[1.6] text-ink-on-inverse sm:text-[19px]">{t.lead}</p>
        </div>

        {/* Steps */}
        <ol className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:mt-10 xl:grid-cols-4 xl:items-start">
          {STEPS.map((s) => (
            <li
              key={s.no}
              className="flex flex-col items-start gap-[10px] rounded-[20px] border-2 border-line-inverse bg-surface-inverse-raised p-5 sm:p-6"
            >
              <span
                aria-hidden
                className={`font-display flex size-12 items-center justify-center rounded-[14px] text-[24px] leading-[1.05] text-on-accent ${s.tone}`}
              >
                {s.no}
              </span>
              <h3 className="text-[20px] font-bold leading-[1.3] text-white">{t.steps[s.key].title}</h3>
              <p className="text-[16px] font-normal leading-[1.55] text-ink-on-inverse">{t.steps[s.key].description}</p>
            </li>
          ))}
        </ol>

        {/* Permission levels */}
        <ul className="mt-8 grid grid-cols-1 gap-5 border-t border-line-inverse pt-[22px] lg:grid-cols-3 lg:gap-4 xl:mt-10">
          {PERMISSION_LEVELS.map((l) => (
            <li key={l.level} className="flex items-start gap-3">
              <span
                className={`shrink-0 whitespace-nowrap rounded-full px-3 py-[5px] text-[14px] font-bold leading-[1.3] ${l.pill}`}
              >
                {levelLabels[l.level]}
              </span>
              <p className="min-w-0 flex-1 text-[15px] font-normal leading-[1.5] text-ink-on-inverse">{t.levels[l.level]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
