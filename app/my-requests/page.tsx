// app/my-requests/page.tsx
//
// "07 Pengajuan saya" (Figma node 1:2300): borrowing history and status.
// Data = the signed-in user's documents in Firestore `requests` (app/lib/requests.ts), live: a new request,
// a cancellation, or a status change by staff shows up without a reload. Signed-in only (layout.tsx).
// "Batalkan" sets the status to "cancelled" (allowed by firestore.rules before the loan starts).
// Text: MY_REQUESTS_TEXT (app/i18n/my-requests.ts); the "when" line is formatted per language from the selection.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import StatusBadge from "@/app/components/ui/status-badge";
import { localizeFacility } from "@/app/i18n/facilities";
import { MY_REQUESTS_TEXT } from "@/app/i18n/my-requests";
import { useLocale } from "@/app/components/layout/language";
import { modeOf } from "@/app/components/catalog/booking/registry";
import { useFacilities } from "@/app/lib/facility-store";
import { useSession } from "@/app/lib/auth";
import { REQUEST_STATUS_COLORS, cancelRequest, isCancellable, useMyRequests } from "@/app/lib/requests";

const PRESS_BUTTON =
  "font-display rounded-[14px] border-2 border-line-strong leading-[normal] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

const PANEL = "w-full rounded-[18px] border-2 border-line-strong bg-surface px-5 py-6 shadow-[4px_4px_0_0_var(--color-shadow)]";

export default function MyRequestsPage() {
  const { locale } = useLocale();
  const t = MY_REQUESTS_TEXT[locale];
  const session = useSession();
  const router = useRouter();
  const state = useMyRequests();
  const facilities = useFacilities();
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (session?.role === "admin") {
      router.replace("/admin");
    }
  }, [session, router]);

  async function cancel(code: string) {
    if (!window.confirm(t.confirmCancel(code))) return;
    setPending(code);
    setFailed(null);
    try {
      await cancelRequest(code);
    } catch {
      setFailed(code);
    } finally {
      setPending(null);
    }
  }

  const rows =
    state.status === "ready"
      ? state.requests.flatMap((request) => {
          const facility = facilities.find((f) => f.id === request.facilityId);
          return facility ? [{ request, facility: localizeFacility(facility, locale) }] : [];
        })
      : [];

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px] xl:pb-[90px]">
      <div className="mx-auto flex max-w-[1160px] flex-col items-start gap-5">
        <Breadcrumb items={[{ label: t.title }]} />

        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px] xl:text-[56px]">{t.title}</h1>
        <p className="text-[16px] text-ink-body sm:text-[18px]">{t.lead}</p>

        {state.status === "loading" && (
          <p role="status" className={`${PANEL} text-[15px] font-bold text-ink-muted`}>
            {t.loading}
          </p>
        )}
        {state.status === "error" && (
          <p role="alert" className={`${PANEL} text-[15px] font-bold text-status-attention-fg`}>
            {t.loadFailed}
          </p>
        )}
        {state.status === "ready" && rows.length === 0 && (
          <div className={`${PANEL} flex flex-col gap-2`}>
            <h2 className="font-display text-[26px] font-normal leading-none text-ink">{t.emptyTitle}</h2>
            <p className="text-[15px] text-ink-body">{t.emptyText}</p>
          </div>
        )}
        {failed && (
          <p role="alert" className="text-[14px] font-bold text-status-attention-fg">
            {t.cancelFailed(failed)}
          </p>
        )}

        {rows.length > 0 && (
          <ul aria-live="polite" className="flex w-full flex-col gap-5">
            {rows.map(({ request, facility }) => {
              const when = modeOf(request.selection).line(request.selection, facility, locale);
              const busy = pending === request.code;
              return (
                <li
                  key={request.code}
                  className="flex flex-wrap items-center gap-x-[18px] gap-y-3 rounded-[18px] border-2 border-line-strong bg-surface px-4 py-4 shadow-[3px_3px_0_0_var(--color-shadow)] sm:px-5 sm:shadow-[4px_4px_0_0_var(--color-shadow)]"
                >
                  <span className={`shrink-0 rounded-[14px] border-2 border-line-strong p-2 ${CATEGORY_STYLE[facility.category].panel}`}>
                    <FacilityIllustration id={facility.illustration} size={60} className="size-[52px] sm:size-[60px]" />
                  </span>

                  <div className="flex min-w-[180px] flex-1 flex-col gap-[2px] leading-[normal]">
                    <span className="text-[13px] font-bold text-ink-muted">{request.code}</span>
                    <Link href={`/catalog/${facility.id}`} className="font-display text-[22px] text-ink hover:underline sm:text-[24px]">
                      {facility.name}
                    </Link>
                    <span className="text-[13px] font-normal text-ink-muted">{when}</span>
                  </div>

                  <div className="ml-auto flex shrink-0 items-center gap-[18px]">
                    <StatusBadge status={REQUEST_STATUS_COLORS[request.status] ?? "borrowed"} label={t.statuses[request.status] ?? request.status} />
                    {isCancellable(request) && (
                      <button
                        type="button"
                        aria-label={t.cancelLabel(request.code)}
                        disabled={busy}
                        onClick={() => void cancel(request.code)}
                        className={`${PRESS_BUTTON} bg-surface text-ink px-[14px] py-[7px] text-[14px] disabled:opacity-60`}
                      >
                        {busy ? t.cancelling : t.cancel}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <Link href="/catalog" className={`${PRESS_BUTTON} flex items-center justify-center bg-brand-secondary text-on-secondary px-[22px] py-[11px] text-[17px]`}>
          {t.newRequest}
        </Link>
      </div>
    </main>
  );
}
