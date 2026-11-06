// app/components/catalog/level-requirements.tsx
//
// The requirements of a permission level as a checklist (LEVEL_REQUIREMENTS, project document "Level"),
// in a box tinted with the level color. Used on the Detail page and at the top of the request form.
// No visible heading; screen readers get "Syarat meminjam: Butuh surat." from the aria-label.

"use client";

import { UI_ICONS } from "@/app/design/icon-map";
import { LEVEL_REQUIREMENTS, STATUS_STYLES, type PermissionLevel } from "@/app/data/facilities";
import { FACILITY_TEXT } from "@/app/i18n/facilities";
import { useLocale } from "@/app/components/layout/language";

export default function LevelRequirements({ level }: { level: PermissionLevel }) {
  const { locale } = useLocale();
  const t = FACILITY_TEXT[locale];
  const note = t.permissionNotes[level];
  const CheckIcon = UI_ICONS.check;

  return (
    <section
      aria-label={`${t.requirementsTitle}: ${note.title}`}
      className={`flex w-full flex-col gap-3 rounded-2xl border-2 border-line-strong p-[14px] text-[14px] ${STATUS_STYLES[level].box}`}
    >
      <ul className="flex flex-col gap-2">
        {LEVEL_REQUIREMENTS[level].map((requirement) => (
          <li key={requirement} className="flex items-start gap-2 text-ink-body">
            <span aria-hidden className="mt-[1px] flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-surface">
              <CheckIcon className="size-[11px] text-ink" strokeWidth={3.5} />
            </span>
            <span className="min-w-0">{t.requirements[requirement]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
