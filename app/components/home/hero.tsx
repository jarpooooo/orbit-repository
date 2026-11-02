// app/components/home/hero.tsx
//
// Home page hero (Figma node 1:3069, desktop 1440px): headline, CTAs, search form, and the scrolling marquee.
// Colors = theme tokens from colors.css (light = exact Figma). Fonts = font-display / font-sans from typography.css.
// Assets (exported from Figma): public/img/hero/*.svg
// Text: HOME_TEXT.hero (app/i18n/home.ts), Indonesian / English.
// Client component because the search form navigates with the router.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { UI_ICON_DEFAULTS, UI_ICONS } from "@/app/design/icon-map";
import type { SubcategoryKey } from "@/app/data/facilities";
import { HOME_TEXT } from "@/app/i18n/home";
import { useText } from "@/app/components/layout/language";

const BUTTON =
  "inline-flex h-[58px] items-center justify-center whitespace-nowrap rounded-2xl border-2 border-b-[6px] border-line-strong px-[26px] text-[17px] font-extrabold leading-[1.2] text-on-accent transition-[filter,transform] hover:brightness-95 active:translate-y-[3px] active:border-b-[3px]";

/** Options of the category select (labels in HOME_TEXT.hero.categories). */
const CATEGORY_OPTIONS: readonly SubcategoryKey[] = [
  "mikrokontroler",
  "perangkat-jaringan",
  "alat-ukur",
  "ruang-diskusi",
  "kursi-pc-lab",
  "kamera-acara",
];

function HeroSearch() {
  const t = useText(HOME_TEXT).hero;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const Chevron = UI_ICONS.dropdown;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("kategori", category);
    const qs = params.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog");
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex w-full max-w-[580px] flex-wrap items-center gap-[10px] rounded-[20px] border-2 border-line-strong bg-surface p-[10px] shadow-[6px_6px_0_0_var(--color-shadow-interactive)] sm:flex-nowrap"
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchLabel}
        className="h-12 min-w-0 basis-full rounded-xl bg-transparent pl-[14px] text-[16px] leading-[1.55] text-ink-body outline-none placeholder:text-ink-placeholder focus-visible:ring-2 focus-visible:ring-focus sm:flex-1 sm:basis-0"
      />

      <div className="relative min-w-0 flex-1 sm:flex-none">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label={t.categoryLabel}
          className="h-12 w-full cursor-pointer appearance-none rounded-xl border-[1.5px] border-line bg-surface-field pl-3 pr-9 text-[15px] leading-[1.5] text-ink outline-none focus-visible:border-focus"
        >
          <option value="">{t.allCategories}</option>
          {CATEGORY_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {t.categories[key]}
            </option>
          ))}
        </select>
        <Chevron
          {...UI_ICON_DEFAULTS}
          size={16}
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
        />
      </div>

      <button
        type="submit"
        className="h-12 shrink-0 rounded-xl bg-brand-interactive px-[22px] text-[16px] font-extrabold leading-[1.3] text-on-interactive transition-colors hover:bg-brand-interactive-hover"
      >
        {t.searchButton}
      </button>
    </form>
  );
}

function MarqueeGroup({ items, hidden }: { items: readonly string[]; hidden?: boolean }) {
  // repeated twice per group so a group is always wider than the screen (ultrawide included)
  const group = [...items, ...items];
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10">
      {group.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-center gap-6 sm:gap-10">
          <span>{item}</span>
          <span aria-hidden className="font-normal">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

function Marquee() {
  const t = useText(HOME_TEXT).hero;
  return (
    <div
      role="region"
      aria-label={t.marqueeLabel}
      className="pt-marquee font-display overflow-hidden border-y-[3px] border-line-strong bg-brand-secondary py-[10px] text-[20px] leading-[1.05] text-on-secondary sm:py-[14px] sm:text-[26px]"
    >
      {/* keyframes live with the component so globals.css does not need editing */}
      <style>{`
        @keyframes pt-marquee-move {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .pt-marquee-track {
          animation: pt-marquee-move 40s linear infinite;
          will-change: transform;
        }
        .pt-marquee:hover .pt-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .pt-marquee-track { animation: none; }
        }
      `}</style>

      <div className="pt-marquee-track flex w-max whitespace-nowrap">
        <MarqueeGroup items={t.marquee} />
        <MarqueeGroup items={t.marquee} hidden />
      </div>
    </div>
  );
}

export default function Hero() {
  const t = useText(HOME_TEXT).hero;
  return (
    <>
      <section className="relative overflow-hidden bg-page">
        {/* Decorations (behind the content) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 top-[88px] sm:top-[104px]">
          <Image
            src="/img/hero/cincin-kuning.svg"
            alt=""
            width={260}
            height={260}
            className="absolute -right-10 -top-8 size-[130px] sm:-right-14 sm:-top-10 sm:size-[190px] xl:-right-20 xl:-top-[60px] xl:size-[260px]"
          />
          <Image
            src="/img/hero/lengkung-ungu.svg"
            alt=""
            width={120}
            height={200}
            className="absolute -left-10 top-[140px] hidden h-[150px] w-[90px] md:block xl:-left-[50px] xl:h-[200px] xl:w-[120px]"
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-[1440px] items-center gap-10 px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[136px] lg:grid-cols-[minmax(0,620px)_minmax(0,560px)] lg:justify-between xl:px-20 xl:pb-20">
          {/* Text */}
          <div className="flex w-full flex-col items-start gap-[22px]">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-line-strong bg-surface px-4 py-2 text-[12px] font-bold leading-[1.3] text-ink sm:text-[14px]">
              <span aria-hidden className="size-3 shrink-0 rounded-full border-2 border-line-strong bg-status-available" />
              {t.department}
            </span>

            <h1
              className="font-display text-[44px] font-normal leading-none tracking-[0.005em] text-ink sm:text-[56px] xl:text-[80px]"
              style={{ textShadow: "4px 4px 0 var(--color-heading-lift)" }}
            >
              {t.title}
            </h1>

            <p className="max-w-[560px] text-[17px] font-normal leading-[1.6] text-ink-body sm:text-[19px]">{t.lead}</p>

            <div className="flex flex-wrap gap-[14px]">
              <Link href="/catalog" className={`${BUTTON} bg-brand-primary`}>
                {t.startBorrowing}
              </Link>
              <Link href="/how-to-borrow" className={`${BUTTON} bg-brand-secondary`}>
                {t.howToBorrow}
              </Link>
            </div>

            <HeroSearch />
          </div>

          {/* DTEDI building illustration. Dark mode: sits on a lit panel (navy lines + white fills in the SVG). */}
          <div className="mx-auto w-full max-w-[400px] sm:max-w-[560px] lg:max-w-none dark:rounded-[28px] dark:border-2 dark:border-line-strong dark:bg-showcase dark:p-4 dark:shadow-[6px_6px_0_0_var(--color-shadow)] dark:sm:p-6">
            <Image
              src="/img/hero/gedung-dtedi.svg"
              alt={t.illustrationAlt}
              width={560}
              height={500}
              preload
              className="h-auto w-full"
            />
          </div>
        </div>
      </section>
      <Marquee />
    </>
  );
}
