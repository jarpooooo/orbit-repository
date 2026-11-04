// app/components/auth/auth-parts.tsx
//
// Shared pieces of the login and register pages:
// AuthLayout (form card + navy welcome panel with the photo collage), AuthField, GoogleButton, OrDivider.
// Images are placeholders for now. Put the file path in PHOTOS when the photos exist.

"use client";

import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { useText } from "@/app/components/layout/language";
import { AUTH_TEXT } from "@/app/i18n/auth";

/** e.g. "/img/foto/kit-esp32.png". null = placeholder box. */
const PHOTOS: { esp32: string | null; room: string | null } = { esp32: null, room: null };

const FIELD_BASE =
  "h-12 w-full rounded-[12px] border-2 px-[14px] text-[14px] text-ink outline-none placeholder:text-ink-placeholder focus:border-brand-interactive focus:shadow-[0_0_0_3px_var(--color-focus-halo)]";

/** Class for inputs and selects. bad = error state. */
export const fieldClass = (bad?: boolean) =>
  `${FIELD_BASE} ${bad ? "border-status-orange-fg bg-status-orange-bg" : "border-line-strong bg-surface-field"}`;

export const BUTTON =
  "flex w-full items-center justify-center gap-[10px] rounded-[14px] border-2 border-line-strong px-[22px] text-[15px] font-extrabold leading-[normal] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

export const describedBy = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export function AuthField({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13px] font-extrabold text-ink">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-[12px] font-bold text-status-orange-fg">⚠ {error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function GoogleButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`${BUTTON} h-[49px] bg-surface text-ink`}>
      {/* placeholder for /icons/brand/google.svg (20×20) */}
      <span aria-hidden className="flex size-5 items-center justify-center rounded-full border-2 border-line-strong text-[11px] font-extrabold">G</span>
      {label}
    </button>
  );
}

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" role="separator" aria-label={label}>
      <span className="h-[2px] flex-1 bg-line" />
      <span className="text-[12px] font-bold text-ink-muted">{label}</span>
      <span className="h-[2px] flex-1 bg-line" />
    </div>
  );
}

function Photo({ src, placeholder, className }: { src: string | null; placeholder: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[12px] border-2 border-on-accent bg-surface-warm ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes="190px" className="object-cover" />
      ) : (
        <span className="flex size-full flex-col items-center justify-center gap-1 text-ink-muted">
          <ImageIcon size={26} strokeWidth={2} aria-hidden />
          <span className="text-[11px] font-bold">{placeholder}</span>
        </span>
      )}
    </div>
  );
}

type Panel = { badge: string; title: string; body: string };

/** Page shell: form card first on small screens, welcome panel on the left from lg. */
export function AuthLayout({ titleId, panel, children }: { titleId: string; panel: Panel; children: React.ReactNode }) {
  const t = useText(AUTH_TEXT);
  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[140px]">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
        <section
          aria-labelledby={titleId}
          className="order-1 flex min-w-0 flex-1 flex-col gap-4 rounded-[24px] border-2 border-line-strong bg-surface p-5 shadow-[6px_6px_0_0_var(--color-shadow)] sm:p-8 lg:order-2"
        >
          {children}
        </section>

        <aside className="order-2 flex w-full flex-col gap-5 rounded-[28px] border-2 border-line-strong bg-surface-inverse p-6 shadow-[6px_6px_0_0_var(--color-shadow)] sm:p-9 lg:order-1 lg:w-[520px] lg:shrink-0">
          <span className="w-fit rounded-full border-2 border-on-accent bg-brand-secondary px-3 py-[5px] text-[12px] font-extrabold leading-[normal] text-on-secondary">
            {panel.badge}
          </span>
          <p className="font-display text-[30px] leading-[1.05] text-ink-on-inverse sm:text-[40px]">{panel.title}</p>
          <p className="text-[15px] leading-[1.5] text-ink-on-inverse/80">{panel.body}</p>

          {/* Photo collage: fixed 448×250 like Figma, shown from sm up */}
          <div aria-hidden className="relative hidden h-[250px] w-[448px] max-w-full sm:block">
            <div className="absolute left-[10px] top-[16px] -rotate-4 rounded-[18px] border-2 border-on-accent bg-brand-secondary p-[10px] shadow-[5px_5px_0_0_var(--color-on-accent)]">
              <Photo src={PHOTOS.esp32} placeholder={t.photoPlaceholder} className="h-[130px] w-[170px]" />
              <p className="mt-2 text-[13px] font-extrabold leading-[normal] text-on-accent">{t.photoEsp32}</p>
            </div>
            <div className="absolute left-[222px] top-[10px] rotate-5 rounded-[18px] border-2 border-on-accent bg-[var(--color-mint,#2ee6b0)] p-[10px] shadow-[5px_5px_0_0_var(--color-on-accent)]">
              <Photo src={PHOTOS.room} placeholder={t.photoPlaceholder} className="h-[130px] w-[190px]" />
              <p className="mt-2 text-[13px] font-extrabold leading-[normal] text-on-accent">{t.photoRoom}</p>
            </div>
            <div className="absolute left-[150px] top-[205px] rotate-2 flex items-center gap-2 rounded-[14px] border-2 border-on-accent bg-white px-3 py-2 shadow-[3px_3px_0_0_var(--color-on-accent)]">
              <span className="size-[10px] rounded-full bg-[var(--color-mint,#2ee6b0)]" />
              <span className="whitespace-nowrap text-[12px] font-extrabold leading-[normal] text-on-accent">{t.sticker}</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}