// app/components/catalog/request-form.tsx
//
// "Ajukan" page content (Figma node 1:1342 / 1:1437 / 1:1538).
//  - Query from the Schedule step, per booking mode (daily: ?ambil=&kembali=&jumlah=, session: ?hari=&sesi=&jumlah=);
//    validated with parseSelectionQuery (if broken → ask to pick a schedule again)
//  - "Surat izin dosen" (PDF) upload, plus a link to generate and preview the letter from the form data
//  - Submitting is still simulated (no API). When valid → /catalog/[slug]/summary?kode=PJM-… + the same selection query
// Selection rows come from the booking mode (BOOKING_MODES in booking/registry.tsx).
// Text: BOOKING_TEXT.request (app/i18n/booking-flow.ts). Errors are stored as keys, so they follow a language switch.

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import { bookingMode, type Facility } from "@/app/data/facilities";
import { modeOf } from "./booking/registry";
import CategoryBadge from "@/app/components/ui/category-badge";
import { LetterMark } from "@/app/components/ui/facility-illustration";
import { BOOKING_TEXT, type RequestErrorKey } from "@/app/i18n/booking-flow";
import { localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";
import { REQUEST_STORAGE_KEY, generateRequestCode, parseSelectionQuery, toSelectionQuery } from "@/app/lib/booking";
import { LETTER_DRAFT_STORAGE_KEY, type LetterDraft } from "@/app/lib/permission-letter";

const MAX_PDF_BYTES = 2 * 1024 * 1024; // 2 MB
/** true: the upload box shows for every facility and the PDF is required. false: only for "letter" facilities, and optional. */
const LETTER_REQUIRED_FOR_ALL = true;

type Field = "name" | "studentId" | "studyProgram" | "purpose" | "letter" | "agreement";
type Errors = Partial<Record<Field, RequestErrorKey>>;
/** Order used to focus the first invalid field. */
const FIELD_ORDER: readonly Field[] = ["name", "studentId", "studyProgram", "purpose", "letter", "agreement"];
const fieldId = (field: Field) => `request-${field}`;

const INPUT =
  "h-[45px] w-full rounded-[12px] border-2 bg-surface px-4 text-[15px] text-ink outline-none placeholder:text-ink-placeholder focus:border-focus focus:ring-[3px] focus:ring-periwinkle-400/35";
const ACTION_BUTTON =
  "font-display flex h-[45px] items-center justify-center rounded-[14px] border-2 border-line-strong px-6 text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";
const borderFor = (error?: string) => (error ? "border-status-attention-fg" : "border-line-strong");

const formatFileSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

type PersonalData = { name: string; studentId: string; studyProgram: string; purpose: string };

/** Checks the fields the letter needs. Submitting additionally needs the PDF and the agreement. */
function validatePersonalData(data: PersonalData): Errors {
  const errors: Errors = {};
  if (data.name.trim().length < 3) errors.name = "nameRequired";
  if (!/^\d{6,15}$/.test(data.studentId.trim())) errors.studentId = "studentIdFormat";
  if (data.studyProgram.trim().length < 3) errors.studyProgram = "studyProgramRequired";
  if (data.purpose.trim().length < 5) errors.purpose = "purposeRequired";
  return errors;
}

const focusFirstError = (errors: Errors) => {
  const first = FIELD_ORDER.find((field) => errors[field]);
  if (first) document.getElementById(fieldId(first))?.focus();
  return first;
};

function FormField({ field, label, error, children }: { field: Field; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[6px]">
      <label htmlFor={fieldId(field)} className="text-[13px] font-extrabold leading-[18px] text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${fieldId(field)}-error`} role="alert" className="text-[12px] font-bold text-status-attention-fg">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria props for an input whose error message is rendered by <FormField>. */
const errorProps = (field: Field, error?: string) => ({
  id: fieldId(field),
  "aria-invalid": !!error,
  "aria-describedby": error ? `${fieldId(field)}-error` : undefined,
});

export default function RequestForm({ facility: original }: { facility: Facility }) {
  const { locale } = useLocale();
  const f = localizeFacility(original, locale);
  const text = BOOKING_TEXT[locale];
  const t = text.request;
  const router = useRouter();
  const mode = bookingMode(original);
  const booking = parseSelectionQuery(useSearchParams(), original);

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [studyProgram, setStudyProgram] = useState("");
  const [purpose, setPurpose] = useState("");
  const [letterFile, setLetterFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState<RequestErrorKey | null>(null);
  const [code, setCode] = useState(generateRequestCode); // one code for both the letter and the Summary
  const fileInputRef = useRef<HTMLInputElement>(null);

  // coming back from the preview page → refill the fields
  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(LETTER_DRAFT_STORAGE_KEY) ?? "null") as LetterDraft | null;
      if (draft && draft.slug === f.id) {
        setCode(draft.code);
        setName(draft.name);
        setStudentId(draft.studentId);
        setStudyProgram(draft.studyProgram);
        setPurpose(draft.purpose);
      }
    } catch {
      /* ignore */
    }
  }, [f.id]);

  const showLetterUpload = LETTER_REQUIRED_FOR_ALL || f.level === "letter";
  const scheduleHref = `/catalog/${f.id}/schedule`;
  const personalData = { name, studentId, studyProgram, purpose };

  function selectFile(file: File | undefined) {
    if (!file) return;
    let error: RequestErrorKey | undefined;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) error = "letterNotPdf";
    else if (file.size > MAX_PDF_BYTES) error = "letterTooLarge";
    setLetterFile(error ? null : file);
    setErrors((e) => ({ ...e, letter: error }));
    if (fileInputRef.current) fileInputRef.current.value = ""; // allows picking the same file again
  }

  function openLetterPreview() {
    if (!booking) return;
    // the letter needs personal data + purpose; the agreement and the PDF are not needed
    const personalErrors = validatePersonalData(personalData);
    setErrors((e) => ({
      ...e,
      name: personalErrors.name,
      studentId: personalErrors.studentId,
      studyProgram: personalErrors.studyProgram,
      purpose: personalErrors.purpose,
    }));
    if (focusFirstError(personalErrors)) {
      setPreviewError("completeFirst");
      return;
    }
    setPreviewError(null);
    const draft: LetterDraft = {
      slug: f.id,
      code,
      name: name.trim(),
      studentId: studentId.trim(),
      studyProgram: studyProgram.trim(),
      purpose: purpose.trim(),
    };
    try {
      sessionStorage.setItem(LETTER_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      setPreviewError("storageBlocked");
      return;
    }
    router.push(`/catalog/${f.id}/letter?${toSelectionQuery(booking)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!booking || submitting) return;
    const nextErrors = validatePersonalData(personalData);
    if (LETTER_REQUIRED_FOR_ALL && !letterFile) nextErrors.letter = "letterRequired";
    if (!agreed) nextErrors.agreement = "agreementRequired";
    setErrors(nextErrors);
    if (focusFirstError(nextErrors)) return;

    setSubmitting(true);
    // SIMULATION. Replace with a POST to the API; the real code comes from the server.
    // Name & student ID are kept for the Summary page (this tab only; replace with API data).
    try {
      sessionStorage.setItem(REQUEST_STORAGE_KEY, JSON.stringify({ code, name: name.trim(), studentId: studentId.trim() }));
    } catch {
      /* ignore: the Summary shows "-" */
    }
    router.push(`/catalog/${f.id}/summary?${toSelectionQuery(booking, code)}`);
  }

  const rows = text.summaryRows;
  const summary: (readonly [string, string])[] = booking
    ? [
        [text.modes[mode].nameRow, f.name],
        ...modeOf(booking).rows(booking, f, locale),
        [rows.location, f.location],
      ]
    : [];
  /** error key → message in the current language */
  const message = (key?: RequestErrorKey | null) => (key ? t.errors[key] : undefined);

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb
          items={[
            { label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" },
            { label: f.name, href: `/catalog/${f.id}` },
            { label: text.modes[mode].step, href: scheduleHref },
            { label: text.crumbs.request },
          ]}
        />

        <Stepper active={4} mode={mode} />

        {!booking ? (
          /* query missing / broken (e.g. the link was opened directly) */
          <div className="mt-1 flex max-w-[560px] flex-col items-start gap-4 rounded-[20px] border-2 border-line-strong bg-surface p-6 shadow-[5px_5px_0_0_var(--color-shadow)]">
            <h1 className="font-display text-[28px] leading-none text-ink">{t.noScheduleTitle}</h1>
            <p className="text-[15px] text-ink-body">{t.noScheduleText}</p>
            <Link
              href={scheduleHref}
              className="font-display flex items-center justify-center rounded-[14px] border-2 border-line-strong bg-brand-primary px-[22px] py-[11px] text-[17px] leading-[1.2] text-on-primary shadow-[0_4px_0_0_var(--color-shadow)]"
            >
              {t.chooseSchedule}
            </Link>
          </div>
        ) : (
          <div className="mt-1 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            {/* Form */}
            <form
              onSubmit={onSubmit}
              noValidate
              className="flex min-w-0 flex-1 flex-col gap-5 rounded-[20px] border-2 border-line-strong bg-surface p-5 shadow-[5px_5px_0_0_var(--color-shadow)] sm:p-8 lg:max-w-[740px]"
            >
              <div className="flex flex-col gap-2">
                <h1 className="font-display text-[34px] font-normal leading-none text-ink sm:text-[40px]">{t.title}</h1>
                <p className="text-[15px] text-ink-muted">{t.lead}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField field="name" label={t.fields.name} error={message(errors.name)}>
                  <input
                    {...errorProps("name", errors.name)}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder={t.placeholders.name}
                    className={`${INPUT} ${borderFor(errors.name)}`}
                  />
                </FormField>
                <FormField field="studentId" label={t.fields.studentId} error={message(errors.studentId)}>
                  <input
                    {...errorProps("studentId", errors.studentId)}
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ""))}
                    inputMode="numeric"
                    maxLength={15}
                    placeholder={t.placeholders.studentId}
                    className={`${INPUT} ${borderFor(errors.studentId)}`}
                  />
                </FormField>
              </div>

              <FormField field="studyProgram" label={t.fields.studyProgram} error={message(errors.studyProgram)}>
                <input
                  {...errorProps("studyProgram", errors.studyProgram)}
                  value={studyProgram}
                  onChange={(e) => setStudyProgram(e.target.value)}
                  placeholder={t.placeholders.studyProgram}
                  className={`${INPUT} ${borderFor(errors.studyProgram)}`}
                />
              </FormField>

              <FormField field="purpose" label={t.fields.purpose} error={message(errors.purpose)}>
                <textarea
                  {...errorProps("purpose", errors.purpose)}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                  placeholder={t.placeholders.purpose}
                  className={`${INPUT} h-auto resize-y py-3 ${borderFor(errors.purpose)}`}
                />
              </FormField>

              {showLetterUpload && (
                <div className="flex flex-col gap-[6px]">
                  <span id="request-letter-label" className="text-[13px] font-extrabold leading-[18px] text-ink">
                    {t.fields.letter}
                  </span>
                  <div className={`flex flex-wrap items-center gap-3 rounded-[12px] border-2 bg-surface-warm p-4 ${borderFor(errors.letter)}`}>
                    <LetterMark />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      tabIndex={-1}
                      onChange={(e) => selectFile(e.target.files?.[0])}
                    />
                    <button
                      id={fieldId("letter")}
                      type="button"
                      aria-labelledby="request-letter-label"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 rounded-[10px] border-2 border-line-strong bg-surface px-4 text-[13px] font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                    >
                      {letterFile ? t.replaceFile : t.chooseFile}
                    </button>
                    <span className="min-w-0 break-all text-[14px] text-ink-body">
                      {letterFile ? `${letterFile.name} (${formatFileSize(letterFile.size)})` : t.noFile}
                    </span>
                  </div>
                  {errors.letter && (
                    <p role="alert" className="text-[12px] font-bold text-status-attention-fg">
                      {message(errors.letter)}
                    </p>
                  )}

                  {/* Generate the letter from the data above → preview → download */}
                  <div className="mt-1 flex flex-col items-start gap-2 rounded-[12px] border-2 border-dashed border-line-strong bg-surface p-4">
                    <p className="text-[14px] leading-[1.5] text-ink-body">
                      {t.letterHelp}
                    </p>
                    <button
                      type="button"
                      onClick={openLetterPreview}
                      className="font-display flex h-[40px] items-center justify-center rounded-[12px] border-2 border-line-strong bg-brand-secondary px-5 text-[15px] leading-[1.2] text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--color-shadow)]"
                    >
                      {t.previewLetter}
                    </button>
                    {previewError && (
                      <p role="alert" className="text-[12px] font-bold text-status-attention-fg">
                        {message(previewError)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-[6px]">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id={fieldId("agreement")}
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    aria-hidden
                    className="mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border-2 border-line-strong bg-surface peer-checked:bg-status-available peer-focus-visible:ring-[3px] peer-focus-visible:ring-periwinkle-400 [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7.5l3 3 6-7" stroke="var(--color-on-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-[14px] leading-[22px] text-ink-body">
                    {t.agreement}
                  </span>
                </label>
                {errors.agreement && (
                  <p role="alert" className="text-[12px] font-bold text-status-attention-fg">
                    {message(errors.agreement)}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={submitting} className={`${ACTION_BUTTON} bg-brand-primary text-on-primary disabled:opacity-60`}>
                  {submitting ? t.submitting : t.submit}
                </button>
                <Link href={scheduleHref} className={`${ACTION_BUTTON} bg-surface text-ink`}>
                  {t.back}
                </Link>
              </div>
            </form>

            {/* Request summary */}
            <aside className="flex w-full flex-col gap-[2px] rounded-[20px] border-2 border-line-strong bg-surface p-6 shadow-[4px_4px_0_0_var(--color-shadow)] sm:shadow-[5px_5px_0_0_var(--color-shadow)] lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0">
              <div className="flex items-center justify-between gap-3 pb-1">
                <h2 className="font-display text-[24px] font-normal leading-[normal] text-ink">{t.summaryTitle}</h2>
                <CategoryBadge category={f.category} />
              </div>
              {summary.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal]">
                  <span className="text-ink-muted">{label}</span>
                  <span className="text-right font-bold text-ink">{value}</span>
                </div>
              ))}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
