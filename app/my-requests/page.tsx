// app/my-requests/page.tsx
//
// "07 Pengajuan saya" (Figma node 1:2300): borrowing history and status.
// Data = SAMPLE from Figma (SAMPLE_REQUESTS below), not persisted yet.
// "Batalkan" only changes this page's view (local state, lost on refresh).
// Later, swap SAMPLE_REQUESTS for API data; the row shape stays the same.
// Text: MY_REQUESTS_TEXT (app/i18n/my-requests.ts); the "when" line is formatted per language from date/session/quantity.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FACILITY_ILLUSTRATIONS } from "@/app/design/icon-map";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import StatusBadge from "@/app/components/ui/status-badge";
import { withFacilities, type AvailabilityStatus } from "@/app/data/facilities";
import { FACILITY_TEXT, localizeFacility } from "@/app/i18n/facilities";
import { MY_REQUESTS_TEXT, type RequestStatusKey } from "@/app/i18n/my-requests";
import { useLocale } from "@/app/components/layout/language";
import { sessionLabel } from "@/app/lib/booking";
import { formatShortDate, parseIsoDate } from "@/app/lib/date";

/** Badge color per request status (from STATUS_STYLES: verification=yellow, letter=orange, direct=green, borrowed=gray). */
const STATUS_COLORS: Record<RequestStatusKey, AvailabilityStatus> = {
  verifying: "verification",
  letterReview: "letter",
  approved: "direct",
  cancelled: "borrowed",
};

type BorrowRequest = {
  code: string;
  slug: string;
  /** yyyy-mm-dd */
  date: string;
  /** index into SESSIONS */
  session: number;
  quantity: number;
  status: Exclude<RequestStatusKey, "cancelled">;
  /** requests that have not happened yet can be cancelled */
  cancellable: boolean;
};

// Sample data (from Figma). Newest first.
const SAMPLE_REQUESTS: readonly BorrowRequest[] = [
  { code: "PJM-1026-0016", slug: "converter-hdmi", date: "2026-10-26", session: 0, quantity: 1, status: "approved", cancellable: true },
  { code: "PJM-1026-0015", slug: "ruang-sidang", date: "2026-10-26", session: 0, quantity: 1, status: "letterReview", cancellable: true },
  { code: "PJM-1026-0014", slug: "kit-esp32", date: "2026-10-26", session: 0, quantity: 1, status: "verifying", cancellable: true },
  { code: "PJM-1024-0012", slug: "kit-esp32", date: "2026-10-19", session: 0, quantity: 1, status: "approved", cancellable: false },
];

const REQUESTS = withFacilities(SAMPLE_REQUESTS);

const PRESS_BUTTON =
  "font-display rounded-[14px] border-2 border-line-strong leading-[normal] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

export default function MyRequestsPage() {
  const { locale } = useLocale();
  const t = MY_REQUESTS_TEXT[locale];
  const [cancelledCodes, setCancelledCodes] = useState<ReadonlySet<string>>(new Set());

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px] xl:pb-[90px]">
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-5">
        <Breadcrumb items={[{ label: t.title }]} />

        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">{t.title}</h1>
        <p className="text-[16px] text-ink-body sm:text-[18px]">{t.lead}</p>

        <ul aria-live="polite" className="flex w-full flex-col gap-5">
          {REQUESTS.map((request) => {
            const facility = localizeFacility(request.facility, locale);
            const cancelled = cancelledCodes.has(request.code);
            const status: RequestStatusKey = cancelled ? "cancelled" : request.status;
            const day = parseIsoDate(request.date);
            const when = [
              day ? formatShortDate(day, locale) : request.date,
              sessionLabel(request.session, locale),
              FACILITY_TEXT[locale].quantity(request.quantity, facility.unit),
            ].join(" · ");
            return (
              <li
                key={request.code}
                className="flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-[18px] border-2 border-line-strong bg-surface px-4 py-4 shadow-[3px_3px_0_0_var(--color-shadow)] sm:px-5 sm:shadow-[4px_4px_0_0_var(--color-shadow)]"
              >
                <span className="shrink-0 rounded-[14px] border-2 border-line-strong bg-sun-200 p-2">
                  <Image
                    src={FACILITY_ILLUSTRATIONS[facility.illustration]}
                    alt=""
                    width={60}
                    height={60}
                    className="size-[52px] sm:size-[60px]"
                  />
                </span>

                <div className="flex min-w-[180px] flex-1 flex-col gap-[2px] leading-[normal]">
                  <span className="text-[13px] font-bold text-ink-muted">{request.code}</span>
                  <span className="font-display text-[22px] text-ink sm:text-[24px]">{facility.name}</span>
                  <span className="text-[13px] font-medium text-ink-muted">{when}</span>
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-[18px]">
                  <StatusBadge status={STATUS_COLORS[status]} label={t.statuses[status]} />
                  {request.cancellable && !cancelled && (
                    <button
                      type="button"
                      aria-label={t.cancelLabel(request.code)}
                      onClick={() => setCancelledCodes((codes) => new Set(codes).add(request.code))}
                      className={`${PRESS_BUTTON} bg-surface text-ink px-[14px] py-[7px] text-[14px]`}
                    >
                      {t.cancel}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <Link href="/catalog" className={`${PRESS_BUTTON} flex items-center justify-center bg-brand-secondary text-on-secondary px-[22px] py-[11px] text-[17px]`}>
          {t.newRequest}
        </Link>
      </div>
    </main>
  );
}
