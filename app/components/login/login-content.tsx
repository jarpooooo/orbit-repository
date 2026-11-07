// app/components/login/login-content.tsx
//
// Login UI (Figma node 125:1130). Sign-in with Firebase Auth (app/lib/auth.ts): Google, email + password,
// or the demo accounts (local emulators only). All actions go through handleSignIn().
// After a successful sign-in → ?next= (same-site path) or the home page.

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useText } from "@/app/components/layout/language";
import { DEMO_ENABLED, roleForEmail, sendPasswordReset, signInDemo, signInWithEmail, signInWithGoogle, type AuthErrorKey } from "@/app/lib/auth";
import { ACCOUNT_TEXT } from "@/app/i18n/account";
import { AuthField, AuthLayout, BUTTON, GoogleButton, OrDivider, describedBy, fieldClass } from "@/app/components/auth/auth-parts";
import { LOGIN_TEXT } from "@/app/i18n/login";

type SignInKind = "email" | "google" | "demo-student" | "demo-staff";
type Fields = { email: string; password: string };
type FieldErrors = Partial<Record<keyof Fields, "errorEmail" | "errorPassword">>;

export default function LoginContent() {
  const t = useText(LOGIN_TEXT);
  const errorsText = useText(ACCOUNT_TEXT).errors;
  const router = useRouter();
  const titleId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [fields, setFields] = useState<Fields>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState<SignInKind | null>(null);
  const [result, setResult] = useState<AuthErrorKey | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // "Lupa kata sandi?": Firebase emails a reset link to the address typed in the email field
  async function handleForgot() {
    setResult(null);
    setNotice(null);
    const email = fields.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors((e) => ({ ...e, email: "errorEmail" }));
      setNotice(t.forgotNeedEmail);
      document.getElementById(emailId)?.focus();
      return;
    }
    const outcome = await sendPasswordReset(email);
    if (outcome === null) setNotice(t.forgotSent(email));
    else if (outcome !== "cancelled") setResult(outcome);
  }

  async function handleSignIn(kind: SignInKind) {
    if (pending) return;
    setPending(kind);
    setResult(null);
    setNotice(null);
    const outcome =
      kind === "google"
        ? await signInWithGoogle(remember)
        : kind === "email"
          ? await signInWithEmail(fields.email, fields.password, remember)
          : await signInDemo(kind === "demo-staff" ? "staff" : "student");
    setPending(null);
    if (outcome === null) {
      // only same-site paths, so ?next= cannot send people to another website
      const next = new URLSearchParams(window.location.search).get("next");
      const isAdmin = kind === "email" && roleForEmail(fields.email) === "admin";
      const target = next?.startsWith("/") && !next.startsWith("//") ? next : (isAdmin ? "/admin" : "/");
      router.push(target);
      return;
    }
    if (outcome !== "cancelled") setResult(outcome);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!/^\S+@\S+\.\S+$/.test(fields.email.trim())) next.email = "errorEmail";
    if (fields.password.length === 0) next.password = "errorPassword";
    setErrors(next);
    if (next.email) return document.getElementById(emailId)?.focus();
    if (next.password) return document.getElementById(passwordId)?.focus();
    handleSignIn("email");
  }

  const emailError = errors.email && t[errors.email];
  const passwordError = errors.password && t[errors.password];

  return (
    <AuthLayout titleId={titleId} panel={{ badge: t.badge, title: t.welcomeTitle, body: t.welcomeBody }}>
      <h1 id={titleId} className="font-display text-[34px] font-normal leading-none text-ink sm:text-[40px]">{t.title}</h1>
      <p className="text-[14px] text-ink-body">{t.hint}</p>

      {notice && (
        <p role="status" className="rounded-[12px] border-2 border-line-strong bg-surface-row px-4 py-3 text-[13px] font-bold text-ink">
          {notice}
        </p>
      )}
      {result && (
        <p role="alert" className="rounded-[12px] border-2 border-status-attention-fg bg-status-attention-bg px-4 py-3 text-[13px] font-bold text-status-attention-fg">
          ⚠ {errorsText[result]}
        </p>
      )}

      <GoogleButton label={t.google} onClick={() => handleSignIn("google")} />
      <OrDivider label={t.divider} />

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <AuthField id={emailId} label={t.emailLabel} error={emailError || undefined}>
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
            placeholder={t.emailPlaceholder}
            aria-invalid={!!emailError}
            aria-describedby={describedBy(emailId, emailError || undefined)}
            className={fieldClass(!!emailError)}
          />
        </AuthField>

        <div className="flex flex-col gap-[6px]">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={passwordId} className="text-[13px] font-extrabold text-ink">{t.passwordLabel}</label>
            <button type="button" onClick={() => void handleForgot()} className="text-[12px] font-bold text-link hover:underline">
              {t.forgot}
            </button>
          </div>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={fields.password}
              onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))}
              placeholder={t.passwordPlaceholder}
              aria-invalid={!!passwordError}
              aria-describedby={describedBy(passwordId, passwordError || undefined)}
              className={`${fieldClass(!!passwordError)} pr-24`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[12px] font-bold text-ink-muted hover:text-ink"
            >
              {showPassword ? t.hide : t.show}
            </button>
          </div>
          {passwordError && <p id={`${passwordId}-err`} role="alert" className="text-[12px] font-bold text-status-attention-fg">⚠ {passwordError}</p>}
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-line-strong bg-surface text-[11px] font-extrabold text-transparent peer-checked:bg-brand-interactive peer-checked:text-on-interactive peer-focus-visible:shadow-[0_0_0_3px_var(--color-focus-halo)]"
          >
            ✓
          </span>
          <span className="text-[13px] text-ink-body">{t.remember}</span>
        </label>

        <button type="submit" disabled={!!pending} aria-busy={pending === "email"} className={`${BUTTON} h-[49px] bg-brand-primary text-on-primary disabled:opacity-60`}>
          {pending === "email" ? "…" : t.submit}
        </button>
      </form>

      {/* Demo accounts (local emulators only) */}
      {DEMO_ENABLED && (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border-2 border-line-strong bg-surface-row px-4 py-3">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <p className="text-[13px] font-extrabold text-ink">{t.demoTitle}</p>
          <p className="text-[12px] text-ink-body">{t.demoBody}</p>
        </div>
        <div className="flex gap-2">
          {(["demo-student", "demo-staff"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => handleSignIn(kind)}
              disabled={!!pending}
              className="rounded-[10px] border-2 border-line-strong bg-surface px-[10px] py-[6px] text-[12px] font-extrabold text-ink transition-transform hover:-translate-y-0.5"
            >
              {kind === "demo-student" ? t.student : t.staff}
            </button>
          ))}
        </div>
      </div>
      )}

      <p className="text-[14px] font-bold">
        <span className="font-normal text-ink-body">{t.noAccount}</span>{" "}
        <Link href="/register" className="text-link hover:underline">{t.register} →</Link>
      </p>
    </AuthLayout>
  );
}