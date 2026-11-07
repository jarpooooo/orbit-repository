// app/components/catalog/request-summary.tsx
//
// "Ringkasan" page content (Figma node 1:1633 / 1:1856 / 1:2075): request ticket + "Langkah berikutnya".
// Status & timeline follow the facility's permission level (project document "Level"):
//   direct → "Siap diambil" (green, approved by the system)
//   verification → "Menunggu verifikasi" (yellow, checked by lab staff / TU)
//   letter → "Menunggu verifikasi" (yellow, approved by the person in charge)
// Data from the query: ?kode=PJM-1102-4821 + the selection of the facility's booking mode (from the request form).
// Rows, lead, and the "use" step follow the booking mode (Figma 2.4 per hari / 3.4 per sesi; BOOKING_MODES).
// The saved request (requests/{code}, app/lib/requests.ts) gives the borrower and the live status (e.g. cancelled);
// until it loads, name & student ID come from sessionStorage REQUEST_STORAGE_KEY (written by the form). Empty → "-".
// Text: BOOKING_TEXT.summary (app/i18n/booking-flow.ts); facility content via localizeFacility.
// No QR / pickup code: staff find the request by name or NIM. The "Saat ambil / Saat datang" box lists what to bring,
// one reminder, and links to the full rules (/how-to-borrow#ketentuan).

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import Stepper from "@/app/components/layout/stepper";
import StatusBadge from "@/app/components/ui/status-badge";
import { bookingMode, levelNeeds, type BookingMode, type Facility } from "@/app/data/facilities";
import { modeOf } from "./booking/registry";
import CategoryBadge from "@/app/components/ui/category-badge";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { localizeFacility, type FacilityView } from "@/app/i18n/facilities";
import { useLocale } from "@/app/components/layout/language";
import { REQUEST_STORAGE_KEY, RETURN_BEFORE, parseSubmittedQuery } from "@/app/lib/booking";
import { formatTimeRange } from "@/app/i18n/common";
import { useLiveFacility } from "@/app/lib/facility-store";
import { INITIAL_STATUS, REQUEST_STATUS_COLORS, useRequest } from "@/app/lib/requests";
import { MY_REQUESTS_TEXT } from "@/app/i18n/my-requests";

type SummaryText = (typeof BOOKING_TEXT)["id"]["summary"];

const ACTION_BUTTON =
  "font-display flex items-center justify-center rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

type StepState = "done" | "active" | "upcoming";
type NextStep = { state: StepState; title: string; detail?: string };

function buildNextSteps(f: FacilityView, mode: BookingMode, when: string, until: string, t: SummaryText["steps"]): NextStep[] {
  const use = { daily: levelNeeds(f.level, "depositStudentId") ? t.pickUpDeposit : t.pickUp, session: t.useRoom }[mode];
  const finish: NextStep = { state: "upcoming", title: { daily: t.returnItem, session: t.done }[mode], detail: until };
  const sent: NextStep = { state: "done", title: t.sent, detail: t.justNow };

  if (f.level === "direct") {
    return [sent, { state: "done", title: t.autoApproved, detail: t.justNow }, { state: "active", title: use, detail: when }, finish];
  }
  return [
    sent,
    {
      state: "active",
      title: f.level === "letter" ? t.letterCheck : t.staffCheck,
      detail: t.estimate,
    },
    { state: "upcoming", title: t.decision },
    { state: "upcoming", title: use, detail: when },
  ];
}


function StepMarker({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span aria-hidden className="mt-[1px] flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-status-available">
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M2.5 7.5l3 3 6-7" stroke="var(--color-on-accent)" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={`mt-[1px] size-6 shrink-0 rounded-full border-2 border-line-strong ${state === "active" ? "bg-brand-secondary" : "bg-pair-gray-bg"}`}
    />
  );
}

export default function RequestSummary({ facility: seed }: { facility: Facility }) {
  const original = useLiveFacility(seed);
  const { locale } = useLocale();
  const f = localizeFacility(original, locale);
  const text = BOOKING_TEXT[locale];
  const t = text.summary;
  const mode = bookingMode(original);
  const request = parseSubmittedQuery(useSearchParams(), original);
  const code = request?.code;

  // name & student ID from sessionStorage (browser only → read after mount)
  const [borrower, setBorrower] = useState("-");
  useEffect(() => {
    if (!code) return;
    try {
      const raw = sessionStorage.getItem(REQUEST_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { code?: string; name?: string; studentId?: string };
      if (saved.code === code && saved.name && saved.studentId) setBorrower(`${saved.name} · ${saved.studentId}`);
    } catch {
      /* ignore: shows "-" */
    }
  }, [code]);

  const saved = useRequest(code);
  const shownBorrower = saved ? `${saved.borrower.name} · ${saved.borrower.studentId}` : borrower;
  const cancelled = saved?.status === "cancelled";

  // saved === null: Firestore says this code does not exist (or is not yours); undefined = still loading
  if (!request || saved === null) {
    return (
      <SummaryShell mode={mode}>
        <div className="flex max-w-[560px] flex-col items-start gap-4 rounded-[20px] border-2 border-line-strong bg-surface p-6 shadow-[5px_5px_0_0_var(--color-shadow)]">
          <h1 className="font-display text-[28px] leading-none text-ink">{t.emptyTitle}</h1>
          <p className="text-[15px] text-ink-body">{t.emptyText}</p>
          <Link href="/catalog" className={`${ACTION_BUTTON} bg-brand-primary text-on-primary`}>
            {t.openCatalog}
          </Link>
        </div>
      </SummaryShell>
    );
  }

  const selectionMode = modeOf(request.selection);
  const nextSteps = buildNextSteps(
    f,
    mode,
    selectionMode.useDetail(request.selection, locale),
    selectionMode.finishDetail(request.selection, locale),
    t.steps,
  );
  const details = [...selectionMode.rows(request.selection, f, locale), [text.summaryRows.borrower, shownBorrower] as const];

  return (
    <SummaryShell mode={mode}>
      {/* Success heading */}
      <div className="flex items-center gap-4 sm:gap-[18px]">
        <span className="font-display flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-line-strong bg-status-available text-[20px] text-on-accent shadow-[3px_3px_0_0_var(--color-shadow)] sm:size-[72px] sm:text-[26px] sm:shadow-[4px_4px_0_0_var(--color-shadow)]">
          {t.successBadge}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-display text-[32px] font-normal leading-[1.05] text-ink sm:text-[44px] xl:text-[52px]">
            {t.title}
          </h1>
          <p className="text-[15px] text-ink-body sm:text-[17px]">{t.leads[mode]}</p>
        </div>
      </div>

      {/* Ticket */}
      <section
        aria-label={t.ticketLabel}
        className="w-full overflow-hidden rounded-[22px] border-2 border-line-strong bg-surface shadow-[5px_5px_0_0_var(--color-shadow-accent)] sm:shadow-[7px_7px_0_0_var(--color-shadow-accent)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-secondary px-5 py-[18px] sm:px-7">
          <div className="flex flex-col gap-[2px] text-on-secondary">
            <span className="text-[12px] font-extrabold">{t.codeLabel}</span>
            <span className="font-display text-[28px] leading-[normal] sm:text-[32px]">{request.code}</span>
          </div>
          {cancelled ? (
            <StatusBadge status="borrowed" label={MY_REQUESTS_TEXT[locale].statuses.cancelled} />
          ) : (
            <StatusBadge status={REQUEST_STATUS_COLORS[saved?.status ?? INITIAL_STATUS[f.level]] ?? "verification"} label={saved ? MY_REQUESTS_TEXT[locale].statuses[saved.status] : t.statusLabels[f.level]} />
          )}
        </div>

        <div className="flex flex-col gap-6 p-5 sm:p-7 md:flex-row md:items-start md:gap-[30px]">
          <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
            <div className="flex items-center gap-4">
              <span className={`shrink-0 rounded-[14px] border-2 border-line-strong p-2 ${CATEGORY_STYLE[f.category].panel}`}>
                <FacilityIllustration id={f.illustration} size={64} className="size-14 sm:size-16" />
              </span>
              <div className="flex min-w-0 flex-col items-start gap-[2px]">
                <CategoryBadge category={f.category} />
                <span className="font-display text-[26px] leading-[normal] text-ink sm:text-[30px]">{f.name}</span>
                <span className="text-[14px] font-bold text-ink-muted">{f.location}</span>
              </div>
            </div>
            <dl className="flex flex-col">
              {details.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                  <dt className="text-ink-muted">{label}</dt>
                  <dd className="text-right font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* What to bring when picking up / arriving (no code needed) */}
          <BringBox f={f} mode={mode} t={t.bringBox} returnTime={formatTimeRange(RETURN_BEFORE, locale)} />
        </div>

        {/* Next steps */}
        <div className="flex flex-col gap-[14px] px-5 py-[22px] sm:px-7">
          <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.nextStepsTitle}</h2>
          <ol className="flex flex-col gap-[14px]">
            {nextSteps.map((step) => (
              <li key={step.title} aria-current={step.state === "active" ? "step" : undefined} className="flex items-start gap-[14px]">
                <StepMarker state={step.state} />
                <div className="flex min-w-0 flex-col leading-[normal]">
                  <span className="text-[15px] font-extrabold text-ink">{step.title}</span>
                  {step.detail && <span className="text-[13px] text-ink-muted">{step.detail}</span>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="flex flex-wrap gap-[14px]">
        <Link href="/my-requests" className={`${ACTION_BUTTON} bg-brand-primary text-on-primary`}>
          {t.myRequests}
        </Link>
        <Link href="/catalog" className={`${ACTION_BUTTON} bg-surface text-ink`}>
          {t.borrowAgain}
        </Link>
      </div>
    </SummaryShell>
  );
}

function BringBox({ f, mode, t, returnTime }: { f: FacilityView; mode: BookingMode; t: SummaryText["bringBox"]; returnTime: string }) {
  const bring = [
    levelNeeds(f.level, "depositStudentId") ? t.ktmDeposit : t.ktmShow,
    ...(f.level === "letter" ? [t.letter] : []),
    t.noCode,
  ];
  return (
    <section
      aria-labelledby="summary-bring"
      className="flex w-full flex-col gap-3 rounded-[16px] border-2 border-line-strong bg-surface-warm p-4 md:w-[340px] md:shrink-0"
    >
      <h2 id="summary-bring" className="font-display text-[22px] font-normal leading-[normal] text-ink">
        {t.title[mode]}
      </h2>
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-extrabold text-ink-muted">{t.bring}</span>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-[14px] leading-[1.45] text-ink-body">
          {bring.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <p className="rounded-[12px] bg-surface-row px-3 py-2 text-[13px] leading-[1.45] text-ink">
        <span className="font-extrabold">{t.remember}</span> {t.remind[mode](returnTime)}
      </p>
      <div className="flex flex-col gap-[2px] text-[13px] leading-[1.4]">
        <span className="font-bold text-ink">{t.place[mode](f.location)}</span>
        <span className="text-ink-muted">{t.hours[mode]}</span>
      </div>
      <Link href="/how-to-borrow#ketentuan" className="text-[13px] font-extrabold text-link underline underline-offset-4">
        {t.rulesLink} →
      </Link>
    </section>
  );
}

function SummaryShell({ mode, children }: { mode: BookingMode; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-[22px]">
        <Stepper active={5} mode={mode} />
        {children}
      </div>
    </main>
  );
}
