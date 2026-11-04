// app/components/catalog/booking/parts.tsx
//
// Pieces shared by the two schedulers (daily-scheduler.tsx, session-scheduler.tsx):
// quantity stepper, summary rows, the primary "continue" button, and arrow-key navigation for
// button grids (calendar days, day strip, session slots).

"use client";

import Link from "next/link";
import type { KeyboardEvent, ReactNode } from "react";

export const PRIMARY_BUTTON =
  "font-display flex items-center justify-center gap-2 rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2]";
export const ASIDE =
  "flex w-full flex-col rounded-[20px] border-2 border-line-strong bg-surface p-[22px] shadow-[4px_4px_0_0_var(--color-shadow)] sm:p-6 sm:shadow-[5px_5px_0_0_var(--color-shadow)] lg:sticky lg:top-[124px] lg:w-[380px] lg:shrink-0";
export const SECTION_TITLE = "font-display text-[24px] font-normal leading-[1.05] text-ink sm:text-[26px]";

/** "– 1 +" on yellow (Figma "Jumlah unit" / "Jumlah peserta"). */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  labels,
}: {
  value: number;
  /** 0 when nothing is available (both buttons off) */
  min?: number;
  max: number;
  onChange: (n: number) => void;
  labels: { decrease: string; increase: string; value: string };
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-[14px] border-2 border-line-strong bg-surface">
      <button
        type="button"
        aria-label={labels.decrease}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="font-display size-11 bg-brand-secondary text-[22px] text-on-secondary disabled:opacity-50"
      >
        -
      </button>
      <output aria-label={labels.value} aria-live="polite" className="font-display flex h-11 w-16 items-center justify-center text-[20px] text-ink">
        {value}
      </output>
      <button
        type="button"
        aria-label={labels.increase}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="font-display size-11 bg-brand-secondary text-[22px] text-on-secondary disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}

/** label / value rows of a summary card */
export function SummaryRows({ rows, divided = false }: { rows: readonly (readonly [string, string])[]; divided?: boolean }) {
  return (
    <dl className="flex flex-col">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex items-start justify-between gap-4 py-[9px] text-[14px] leading-[normal] ${divided && i > 0 ? "border-t border-line" : ""}`}
        >
          <dt className="text-ink-muted">{label}</dt>
          <dd className="text-right font-bold text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Orange "continue" link; a disabled look plus the reason when the selection is not valid yet. */
export function ContinueButton({ href, label, error, icon }: { href: string | null; label: string; error?: string | null; icon?: ReactNode }) {
  if (href)
    return (
      <Link
        href={href}
        className={`${PRIMARY_BUTTON} mt-4 bg-brand-primary text-on-primary shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]`}
      >
        {label}
        {icon}
      </Link>
    );
  return (
    <>
      <span aria-disabled className={`${PRIMARY_BUTTON} mt-4 cursor-not-allowed bg-status-unavailable-bg text-ink-muted`}>
        {label}
      </span>
      {error && (
        <p role="status" className="pt-2 text-[13px] text-status-attention-fg">
          {error}
        </p>
      )}
    </>
  );
}

/**
 * Arrow-key navigation inside a set of buttons marked `data-nav` (in DOM order): ←/→ by one, ↑/↓ by `cols`,
 * Home/End to the ends. Focuses the target and returns its index (radio groups also select it), or null.
 */
export function moveFocus(e: KeyboardEvent<HTMLElement>, cols: number): number | null {
  const items = [...(e.currentTarget.closest("[data-nav-root]")?.querySelectorAll<HTMLElement>("[data-nav]") ?? [])];
  const index = items.indexOf(e.currentTarget);
  if (index < 0) return null;
  const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols };
  let next: number | null = null;
  if (e.key in step) next = index + step[e.key];
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = items.length - 1;
  if (next === null || next < 0 || next >= items.length) return null;
  e.preventDefault();
  items[next].focus();
  return next;
}
