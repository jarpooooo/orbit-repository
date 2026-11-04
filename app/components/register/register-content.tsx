// app/components/register/register-content.tsx
//
// Register UI (Figma node 125:1297). UI only: the backend handles accounts (handleSignUp).
// The student card photo is checked (type, 2 MB) but not uploaded anywhere yet.

"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useText } from "@/app/components/layout/language";
import { AuthField, AuthLayout, BUTTON, GoogleButton, OrDivider, describedBy, fieldClass } from "@/app/components/auth/auth-parts";
import { REGISTER_TEXT } from "@/app/i18n/register";

/** TODO: replace with the real study programs of DTEDI (value = what the backend expects). */
const PROGRAMS: { value: string; label: string }[] = [{ value: "d4-trpl", label: "D4 TRPL" }];
const OTHER_PROGRAM = "other";
/** Cohort years offered in the list. */
const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
const NIM_PATTERN = /^\d{2}\/\d{6}\/[A-Z]{2}\/\d{5}$/;
const EMAIL_PATTERN = /^[^\s@]+@mail\.ugm\.ac\.id$/i;
const MAX_KTM_BYTES = 2 * 1024 * 1024;

type FieldName = "name" | "nim" | "program" | "year" | "email" | "password" | "agree" | "ktm";
type ErrorKey = "errName" | "errNim" | "errProgram" | "errYear" | "errEmail" | "errPassword" | "errAgree" | "errKtmType" | "errKtmSize";
type Errors = Partial<Record<FieldName, ErrorKey>>;

const isStrong = (pw: string) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);

export default function RegisterContent() {
  const t = useText(REGISTER_TEXT);
  const uid = useId();
  const ids: Record<FieldName, string> = {
    name: `${uid}-name`,
    nim: `${uid}-nim`,
    program: `${uid}-program`,
    year: `${uid}-year`,
    email: `${uid}-email`,
    password: `${uid}-password`,
    agree: `${uid}-agree`,
    ktm: `${uid}-ktm`,
  };
  const ktmInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", nim: "", program: "", year: "", email: "", password: "" });
  const [ktm, setKtm] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // TODO(backend): send the sign-up request here (email or Google), then redirect to /login or home.
  function handleSignUp() {}

  function pickKtm(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setKtm(null);
      setErrors((e) => ({ ...e, ktm: "errKtmType" }));
    } else if (file.size > MAX_KTM_BYTES) {
      setKtm(null);
      setErrors((e) => ({ ...e, ktm: "errKtmSize" }));
    } else {
      setKtm(file);
      setErrors((e) => ({ ...e, ktm: undefined }));
    }
    if (ktmInput.current) ktmInput.current.value = "";
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: Errors = {};
    if (form.name.trim().length < 3) e.name = "errName";
    if (!NIM_PATTERN.test(form.nim.trim())) e.nim = "errNim";
    if (!form.program) e.program = "errProgram";
    if (!form.year) e.year = "errYear";
    if (!EMAIL_PATTERN.test(form.email.trim())) e.email = "errEmail";
    if (!isStrong(form.password)) e.password = "errPassword";
    if (!agree) e.agree = "errAgree";
    if (ktm === null && errors.ktm) e.ktm = errors.ktm; // keep a pending photo error
    setErrors(e);

    const order: FieldName[] = ["name", "nim", "program", "year", "email", "password", "ktm", "agree"];
    const first = order.find((k) => e[k]);
    if (first) return document.getElementById(ids[first])?.focus();
    handleSignUp();
  }

  const err = (k: FieldName) => (errors[k] ? t[errors[k]] : undefined);
  const strength = form.password ? (isStrong(form.password) ? t.strong : t.weak) : "";

  const select = (key: "program" | "year", placeholder: string, options: { value: string; label: string }[]) => (
    <div className="relative">
      <select
        id={ids[key]}
        value={form[key]}
        onChange={set(key)}
        aria-invalid={!!err(key)}
        aria-describedby={describedBy(ids[key], err(key))}
        className={`${fieldClass(!!err(key))} appearance-none pr-9`}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-ink">{o.label}</option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink-muted">▾</span>
    </div>
  );

  return (
    <AuthLayout titleId={`${uid}-title`} panel={{ badge: t.badge, title: t.welcomeTitle, body: t.welcomeBody }}>
      <h1 id={`${uid}-title`} className="font-display text-[34px] font-normal leading-none text-ink sm:text-[40px]">{t.title}</h1>
      <p className="text-[14px] text-ink-body">{t.hint}</p>

      <GoogleButton label={t.google} onClick={handleSignUp} />
      <OrDivider label={t.divider} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AuthField id={ids.name} label={t.nameLabel} error={err("name")}>
            <input
              id={ids.name}
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
              placeholder={t.namePlaceholder}
              aria-invalid={!!err("name")}
              aria-describedby={describedBy(ids.name, err("name"))}
              className={fieldClass(!!err("name"))}
            />
          </AuthField>
          <AuthField id={ids.nim} label={t.nimLabel} error={err("nim")}>
            <input
              id={ids.nim}
              value={form.nim}
              onChange={(e) => setForm((f) => ({ ...f, nim: e.target.value.toUpperCase() }))}
              maxLength={20}
              placeholder={t.nimPlaceholder}
              aria-invalid={!!err("nim")}
              aria-describedby={describedBy(ids.nim, err("nim"))}
              className={fieldClass(!!err("nim"))}
            />
          </AuthField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_130px]">
          <AuthField id={ids.program} label={t.programLabel} error={err("program")}>
            {select("program", t.programPlaceholder, [...PROGRAMS, { value: OTHER_PROGRAM, label: t.programOther }])}
          </AuthField>
          <AuthField id={ids.year} label={t.yearLabel} error={err("year")}>
            {select("year", t.yearPlaceholder, YEARS.map((y) => ({ value: String(y), label: String(y) })))}
          </AuthField>
        </div>

        <AuthField id={ids.email} label={t.emailLabel} hint={t.emailHint} error={err("email")}>
          <input
            id={ids.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={form.email}
            onChange={set("email")}
            placeholder={t.emailPlaceholder}
            aria-invalid={!!err("email")}
            aria-describedby={describedBy(ids.email, err("email"), t.emailHint)}
            className={fieldClass(!!err("email"))}
          />
        </AuthField>

        <AuthField id={ids.password} label={t.passwordLabel} hint={t.passwordHint} error={err("password")}>
          <div className="relative">
            <input
              id={ids.password}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              placeholder={t.passwordPlaceholder}
              aria-invalid={!!err("password")}
              aria-describedby={describedBy(ids.password, err("password"), t.passwordHint)}
              className={`${fieldClass(!!err("password"))} pr-36`}
            />
            <span className="absolute right-[14px] top-1/2 flex -translate-y-1/2 items-center gap-3 text-[12px] font-bold">
              {strength && <span aria-live="polite" className={isStrong(form.password) ? "text-ink" : "text-ink-muted"}>{strength}</span>}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="text-ink-muted hover:text-ink"
              >
                {showPassword ? t.hide : t.show}
              </button>
            </span>
          </div>
        </AuthField>

        {/* Student card photo (optional) */}
        <div className="flex flex-col gap-[6px]">
          <div className={`flex flex-wrap items-center gap-3 rounded-[14px] border-2 border-dashed bg-surface-row px-[14px] py-3 ${errors.ktm ? "border-status-orange-fg" : "border-line-strong"}`}>
            <input ref={ktmInput} type="file" accept="image/*" className="sr-only" tabIndex={-1} onChange={(e) => pickKtm(e.target.files?.[0])} />
            <button
              id={ids.ktm}
              type="button"
              onClick={() => ktmInput.current?.click()}
              className="rounded-[10px] border-2 border-on-accent bg-brand-secondary px-3 py-[6px] text-[12px] font-extrabold text-on-secondary transition-transform hover:-translate-y-0.5"
            >
              {ktm ? t.ktmChange : t.ktmButton}
            </button>
            <div className="flex min-w-0 flex-col gap-[2px]">
              <p className="text-[13px] font-extrabold text-ink">{t.ktmTitle}</p>
              <p className="break-words text-[12px] text-ink-body">{ktm ? ktm.name : t.ktmHint}</p>
            </div>
          </div>
          {errors.ktm && <p role="alert" className="text-[12px] font-bold text-status-orange-fg">⚠ {t[errors.ktm]}</p>}
        </div>

        <div className="flex flex-col gap-[6px]">
          <label className="flex cursor-pointer items-start gap-2">
            <input id={ids.agree} type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="peer sr-only" />
            <span
              aria-hidden
              className="mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-line-strong bg-surface text-[11px] font-extrabold text-transparent peer-checked:bg-brand-interactive peer-checked:text-on-interactive peer-focus-visible:shadow-[0_0_0_3px_var(--color-focus-halo)]"
            >
              ✓
            </span>
            <span className="text-[13px] leading-[1.5] text-ink-body">{t.agree}</span>
          </label>
          {err("agree") && <p role="alert" className="text-[12px] font-bold text-status-orange-fg">⚠ {err("agree")}</p>}
        </div>

        <button type="submit" className={`${BUTTON} h-[49px] bg-brand-primary text-on-primary`}>{t.submit}</button>
      </form>

      <p className="text-[14px] font-bold">
        <span className="font-normal text-ink-body">{t.haveAccount}</span>{" "}
        <Link href="/login" className="text-link hover:underline">{t.login} →</Link>
      </p>
    </AuthLayout>
  );
}