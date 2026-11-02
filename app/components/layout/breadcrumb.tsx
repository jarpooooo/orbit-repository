// app/components/layout/breadcrumb.tsx
//
// Page breadcrumb: always starts at "Beranda" / "Home". The last item (no href) is the current page.
// Sits on the page (sky) background, so it uses ink-muted-on-page.
// Callers pass labels already in the current language; the "Beranda" root comes from LAYOUT_TEXT.pages.

"use client";

import Link from "next/link";
import { UI_ICONS } from "@/app/design/icon-map";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useText } from "./language";

export type Crumb = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  const text = useText(LAYOUT_TEXT);
  const Separator = UI_ICONS.breadcrumbSeparator;
  const crumbs: readonly Crumb[] = [{ label: text.pages.home, href: "/" }, ...items];

  return (
    <nav aria-label={text.breadcrumb.label} className="flex flex-wrap items-center gap-1 text-[14px] font-bold text-ink-muted-on-page">
      {crumbs.map((c, i) => (
        <span key={`${i}-${c.label}`} className="contents">
          {i > 0 && <Separator size={14} strokeWidth={2.5} aria-hidden />}
          {c.href ? (
            <Link href={c.href} className="hover:text-ink hover:underline">
              {c.label}
            </Link>
          ) : (
            <span aria-current="page">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
