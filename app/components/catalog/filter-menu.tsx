// app/components/catalog/filter-menu.tsx
//
// Dropdown filter button on the catalog toolbar ("Lokasi ▾", "Kapasitas ▾", "Tanggal ▾"; Figma 148:1405).
// The button shows the chosen value and turns yellow while a filter is set. The panel closes on Escape,
// on an outside click, and after picking an option. Open state lives in the parent (one menu open at a time).

"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

type Props = {
  label: string;
  /** chosen value; null = filter not set */
  value: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** panel alignment under the button */
  align?: "left" | "right";
  children: ReactNode;
};

export default function FilterMenu({ label, value, open, onOpenChange, align = "left", children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // close on outside click / Escape (state changes happen in the event callbacks, not in the effect body)
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={rootRef} className="relative min-w-0 flex-auto sm:flex-none">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className={[
          "flex h-[52px] w-full items-center justify-center gap-[6px] whitespace-nowrap rounded-[14px] border-2 border-line-strong px-3 text-[13px] font-bold transition-colors sm:gap-2 sm:px-4 sm:text-[14px]",
          value ? "bg-brand-secondary text-on-secondary" : "bg-surface text-ink hover:bg-surface-warm",
        ].join(" ")}
      >
        <span className="truncate">{value ?? label}</span>
        <span aria-hidden className={`text-[12px] ${value ? "text-on-accent-muted" : "text-ink-muted"}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          className={`absolute top-full z-30 mt-2 w-[min(280px,calc(100vw-40px))] rounded-[14px] border-2 border-line-strong bg-surface p-2 shadow-[4px_4px_0_0_var(--color-shadow)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** One choice inside a FilterMenu panel. */
export function FilterOption({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        "flex w-full items-center rounded-[10px] px-3 py-[10px] text-left text-[14px] font-bold transition-colors",
        selected ? "bg-brand-secondary text-on-secondary" : "text-ink hover:bg-surface-warm",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
