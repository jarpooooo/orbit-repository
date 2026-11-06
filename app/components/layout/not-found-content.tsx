// app/components/layout/not-found-content.tsx  (used by app/not-found.tsx)
//
// 404 content in the site style: big code on a yellow tile, title, two ways out. Client component because
// the text follows the language preference (LAYOUT_TEXT.notFound).

"use client";

import Link from "next/link";
import { useText } from "./language";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";

const BUTTON =
  "font-display flex items-center justify-center rounded-[14px] border-2 border-line-strong px-[22px] py-[11px] text-[17px] leading-[1.2] shadow-[0_4px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_var(--color-shadow)]";

export default function NotFoundContent() {
  const t = useText(LAYOUT_TEXT).notFound;
  return (
    <main className="flex min-h-screen items-center bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pt-[132px] xl:px-[140px]">
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-start gap-5">
        <span
          aria-hidden
          className="font-display rounded-[20px] border-2 border-line-strong bg-brand-secondary px-6 py-2 text-[56px] leading-none text-on-secondary shadow-[5px_5px_0_0_var(--color-shadow)] sm:text-[72px]"
        >
          {t.code}
        </span>
        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[52px]">{t.title}</h1>
        <p className="max-w-[560px] text-[16px] leading-normal text-ink-body sm:text-[18px]">{t.lead}</p>
        <div className="flex flex-wrap gap-[14px]">
          <Link href="/catalog" className={`${BUTTON} bg-brand-primary text-on-primary`}>
            {t.catalog}
          </Link>
          <Link href="/" className={`${BUTTON} bg-surface text-ink`}>
            {t.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
