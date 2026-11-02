// app/components/catalog/letter-preview.tsx
//
// Letter preview: the Word template is filled with the form data and rendered as-is with `docx-preview`.
// Requires: docx-preview, docxtemplater, pizzip.
// Data comes from: the draft in sessionStorage (written by the request form) + the ?hari=&sesi=&jumlah= query.
// Theme: the page around the letter follows light/dark mode, but the PAPER is always white with black text
// (fixed white/black classes on the docx container; print forces the light theme in colors.css).
// Language: the UI around the letter follows BOOKING_TEXT.letter; the letter CONTENT is always Indonesian
// (official department document), so it is filled from the original facility data with Indonesian dates/sessions.

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import { formatQuantity, type Facility } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";
import { SESSIONS, parseBookingQuery, toBookingQuery } from "@/app/lib/booking";
import {
  LETTER_DRAFT_STORAGE_KEY,
  downloadBlob,
  fillPermissionLetter,
  letterFileName,
  type LetterData,
  type LetterDraft,
} from "@/app/lib/permission-letter";

const BUTTON =
  "font-display flex h-[45px] items-center justify-center rounded-[14px] border-2 border-line-strong px-6 text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)] disabled:opacity-60";

/** Prints only the letter paper (#letter-paper). */
const PRINT_STYLES = `
  @media print {
    @page { size: A4; margin: 0; }
    body * { visibility: hidden !important; }
    #letter-paper, #letter-paper * { visibility: visible !important; }
    #letter-paper { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; box-shadow: none !important; background: #fff !important; padding: 0 !important; overflow: visible !important; }
    #letter-paper .docx-wrapper { background: #fff !important; padding: 0 !important; }
    #letter-paper .docx-wrapper > section.docx { box-shadow: none !important; margin: 0 !important; }
  }
`;

type RenderStatus = "loading" | "ready" | "failed";

export default function LetterPreview({ facility: f }: { facility: Facility }) {
  const { locale } = useLocale();
  const text = BOOKING_TEXT[locale];
  const t = text.letter;
  const shown = localizeFacility(f, locale); // display name only; the letter uses `f` (Indonesian)
  const booking = parseBookingQuery(useSearchParams(), f.maxQuantity);

  const [data, setData] = useState<LetterData | null | undefined>(undefined); // undefined = not read yet
  const [status, setStatus] = useState<RenderStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const blobRef = useRef<Blob | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const formHref = `/catalog/${f.slug}/request${booking ? `?${toBookingQuery(booking)}` : ""}`;
  const date = booking?.date;
  const session = booking?.session;
  const quantity = booking?.quantity;

  // read the draft written by the form
  useEffect(() => {
    if (date === undefined || session === undefined || quantity === undefined) {
      setData(null);
      return;
    }
    try {
      const draft = JSON.parse(sessionStorage.getItem(LETTER_DRAFT_STORAGE_KEY) ?? "null") as LetterDraft | null;
      if (!draft || draft.slug !== f.slug) return setData(null);
      setData({
        code: draft.code,
        name: draft.name,
        studentId: draft.studentId,
        studyProgram: draft.studyProgram,
        purpose: draft.purpose,
        facility: f.name,
        quantity: formatQuantity(f, quantity),
        date,
        session: SESSIONS[session],
      });
    } catch {
      setData(null);
    }
  }, [f, date, session, quantity]);

  // fill the template → render it
  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const blob = await fillPermissionLetter(data);
        if (cancelled) return;
        blobRef.current = blob;
        const { renderAsync } = await import("docx-preview");
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = "";
        await renderAsync(blob, containerRef.current, undefined, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          experimental: true, // computes tab stops
        });
        if (!cancelled) setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setErrorMessage(e instanceof Error ? e.message : "");
        setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data]);

  // PDF = the browser print dialog, paper area only. Pick "Save as PDF".
  function downloadPdf() {
    if (!data) return;
    const previousTitle = document.title;
    document.title = letterFileName(data.code); // becomes the PDF file name
    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };
    window.addEventListener("afterprint", restoreTitle);
    window.print();
  }

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <style>{PRINT_STYLES}</style>
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb
          items={[
            { label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" },
            { label: shown.name, href: `/catalog/${f.slug}` },
            { label: text.crumbs.request, href: formHref },
            { label: text.crumbs.letter },
          ]}
        />

        <Stepper active={4} />

        {data === undefined ? null : data === null ? (
          <div className="mt-1 flex max-w-[560px] flex-col items-start gap-4 rounded-[20px] border-2 border-line-strong bg-surface p-6 shadow-[5px_5px_0_0_var(--color-shadow)]">
            <h1 className="font-display text-[28px] leading-none text-ink">{t.noDataTitle}</h1>
            <p className="text-[15px] text-ink-body">{t.noDataText}</p>
            <Link href={formHref} className={`${BUTTON} bg-brand-primary text-on-primary`}>
              {t.toForm}
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-[34px] font-normal leading-none text-ink sm:text-[40px]">{t.title}</h1>
              <p className="text-[15px] text-ink-muted-on-page">{t.lead}</p>
              {t.officialNote && <p className="text-[14px] font-bold text-ink-muted-on-page">{t.officialNote}</p>}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={status !== "ready"}
                onClick={() => blobRef.current && downloadBlob(blobRef.current, `${letterFileName(data.code)}.docx`)}
                className={`${BUTTON} bg-brand-secondary text-on-secondary`}
              >
                {t.downloadWord}
              </button>
              <button type="button" disabled={status !== "ready"} onClick={downloadPdf} className={`${BUTTON} bg-status-available text-on-accent`}>
                {t.downloadPdf}
              </button>
              <Link href={formHref} className={`${BUTTON} bg-surface text-ink`}>
                {t.editData}
              </Link>
            </div>

            {status === "loading" && (
              <p role="status" className="text-[15px] font-bold text-ink-muted-on-page">
                {t.preparing}
              </p>
            )}
            {status === "failed" && (
              <p role="alert" className="max-w-[640px] rounded-[12px] border-2 border-status-attention-fg bg-status-attention-bg p-4 text-[14px] font-bold text-status-attention-fg">
                {errorMessage || t.renderFailed}
              </p>
            )}

            {/* paper; can be scrolled sideways on narrow screens */}
            <div
              id="letter-paper"
              className="overflow-x-auto rounded-[20px] border-2 border-line-strong bg-pair-gray-bg p-3 shadow-[5px_5px_0_0_var(--color-shadow)] sm:p-6"
            >
              <div
                ref={containerRef}
                className="text-black [&_.docx-wrapper]:!bg-transparent [&_.docx-wrapper]:!p-0 [&_.docx-wrapper>section.docx]:mx-auto [&_.docx-wrapper>section.docx]:bg-white [&_.docx-wrapper>section.docx]:shadow-md"
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
