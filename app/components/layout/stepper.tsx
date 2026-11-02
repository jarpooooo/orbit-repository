// app/components/layout/stepper.tsx
//
// 5-step flow (Figma "Alur langkah"): Jelajah → Pilih → Jadwal → Ajukan → Ringkasan.
// Used on 4 pages: Detail (active=2), Schedule (3), Request (4), Summary (5).
// Completed = mint dot "•", active = yellow pill + navy number, the rest = surface + gray number.
// The navy number chip sits inside the yellow pill, so it stays navy in both themes.
// Step labels: LAYOUT_TEXT.stepper (app/i18n/site-layout.ts).

"use client";

import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useText } from "./language";

export type StepNumber = 1 | 2 | 3 | 4 | 5;

export default function Stepper({ active }: { active: StepNumber }) {
  const t = useText(LAYOUT_TEXT).stepper;
  return (
    <ol aria-label={t.label} className="flex flex-wrap gap-2">
      {t.steps.map((label, i) => {
        const step = i + 1;
        const done = step < active;
        const current = step === active;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full border-2 border-line-strong py-[5px] pl-2 pr-[14px] ${current ? "bg-brand-secondary" : "bg-surface"}`}
          >
            <span
              aria-hidden
              className={`font-display flex size-6 items-center justify-center rounded-full text-[13px] leading-none ${
                done
                  ? "border-2 border-line-strong bg-status-available text-on-accent"
                  : current
                    ? "bg-navy-900 text-white"
                    : "bg-pair-gray-bg text-ink"
              }`}
            >
              {done ? "•" : step}
            </span>
            <span className={`text-[13px] font-extrabold leading-none ${current ? "text-on-secondary" : "text-ink-muted"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
