// app/components/ui/status-badge.tsx
//
// Pill badge with a colored dot ("Verifikasi", "Perlu surat", "Disetujui", ...).
// Colors come from STATUS_STYLES in facilities.ts; the default text from FACILITY_TEXT.statuses
// (app/i18n/facilities.ts) in the current language. `label` overrides the text.

"use client";

import { STATUS_STYLES, type AvailabilityStatus } from "@/app/data/facilities";
import { FACILITY_TEXT } from "@/app/i18n/facilities";
import { useText } from "@/app/components/layout/language";

type Props = {
  status: AvailabilityStatus;
  label?: string;
  /** "leading-none" for the tighter Figma variant on cards and the Detail page */
  leading?: "leading-none" | "leading-[normal]";
};

export default function StatusBadge({ status, label, leading = "leading-[normal]" }: Props) {
  const statuses = useText(FACILITY_TEXT).statuses;
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-[6px] whitespace-nowrap rounded-full border-2 border-line-strong px-[11px] py-[3px] text-[12.5px] font-extrabold ${leading} ${style.box} ${style.text}`}
    >
      <span aria-hidden className={`size-2 rounded-full ${style.dot}`} />
      {label ?? statuses[status]}
    </span>
  );
}
