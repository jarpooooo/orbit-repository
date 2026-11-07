// app/components/layout/footer.tsx
//
// PinjamTEDI footer (Figma node 1:2982, desktop 1440px).
// The table/shelf (top + legs) is drawn in code in <ShelfTable />.
// Colors = theme tokens from colors.css. The shelf background follows the theme (surface).
// Text: LAYOUT_TEXT.footer and LAYOUT_TEXT.pages (app/i18n/site-layout.ts).
//
// Client component: the shelf and the "Kembali ke atas" button only show on the home page ("/").

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLenis } from "lenis/react";
import { SITE } from "@/app/data/site";
import {
  BRAND_ICONS,
  FOOTER_SOCIALS,
  FOOTER_STRIP_ILLUSTRATIONS,
  UI_ICON_DEFAULTS,
  UI_ICONS,
} from "@/app/design/icon-map";
import { LAYOUT_TEXT, type FooterColumnKey, type PageKey } from "@/app/i18n/site-layout";
import { useText } from "./language";


const SOCIAL_LINKS: Record<(typeof FOOTER_SOCIALS)[number], string> = {
  instagram: "#",
  youtube: "#",
  tiktok: "#",
  x: "#",
  linkedin: "#",
};

/** Link columns; titles and link labels come from LAYOUT_TEXT (footer.columns / pages). */
const LINK_COLUMNS: readonly { column: FooterColumnKey; links: readonly { page: PageKey; href: string; file?: true }[] }[] = [
  {
    column: "explore",
    links: [
      { page: "home", href: "/" },
      { page: "catalog", href: "/catalog" },
      { page: "roomSchedule", href: "/room-schedule" },
      { page: "howToBorrow", href: "/how-to-borrow" },
    ],
  },
  {
    column: "borrowing",
    links: [
      { page: "myRequests", href: "/my-requests" },
      { page: "mostBorrowed", href: "/room-schedule/most-borrowed" },
      { page: "rules", href: "/how-to-borrow#ketentuan" },
    ],
  },
  {
    column: "help",
    links: [
      // the sample letter is the blank .docx template; the help desk is the WhatsApp number
      { page: "guide", href: "/how-to-borrow" },
      { page: "sampleLetter", href: "/templates/permission-letter.docx", file: true },
      { page: "helpDesk", href: "https://wa.me/6281329814848", file: true },
    ],
  },
];

/* Shelf area in Figma: 1220px (1440 - 2×110). Every table size is scaled against this number. */
const SHELF_DESKTOP = 1220;
const SHELF_GAP = 34;

/**
 * Table (shelf) from Figma "Rak barang":
 *  - Top  : height 16, radius 8, outline border 3, yellow fill, full width.
 *  - Legs : 2 blocks 14×26 in the footer color, 60px from the edges (= 4.9% of the shelf width).
 * Sizes shrink with the shelf width through container queries (cqw).
 * Must be rendered INSIDE an `@container` element.
 */
function ShelfTable() {
  return (
    <>
      {/* table top */}
      <div
        className="w-full rounded-lg border-2 border-line-strong bg-brand-secondary md:border-[3px]"
        style={{ height: "min(16px, max(10px, 1.31cqw))" }}
      />
      {/* table legs: attached to the navy footer below */}
      <div className="flex justify-between" style={{ paddingInline: "4.9cqw" }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-surface-inverse"
            style={{
              width: "min(14px, max(8px, 1.15cqw))",
              height: "min(26px, max(14px, 2.13cqw))",
            }}
          />
        ))}
      </div>
    </>
  );
}

function Shelf() {
  const items = FOOTER_STRIP_ILLUSTRATIONS;
  const mobileItems = items.filter((i) => i.mobile);
  // reference width (px): all items (md+) vs. mobile items only → used for scaling
  const baseAll = items.reduce((sum, i) => sum + i.size, 0) + SHELF_GAP * (items.length - 1);
  const baseMobile = mobileItems.reduce((sum, i) => sum + i.size, 0) + SHELF_GAP * (mobileItems.length - 1);

  return (
    <div
      aria-hidden
      className="bg-surface px-5 pt-8 sm:px-8 md:pt-12 xl:px-[110px]"
      style={{ "--base": baseMobile, "--base-md": baseAll } as React.CSSProperties}
    >
      {/* shelf area = container query */}
      <div className="@container mx-auto" style={{ maxWidth: SHELF_DESKTOP }}>
        {/* items on the table */}
        <div
          className="flex items-end justify-center [--b:var(--base)] md:[--b:var(--base-md)]"
          style={{ gap: `min(${SHELF_GAP}px, calc(${SHELF_GAP} / var(--b) * 100cqw))` }}
        >
          {items.map((item) => (
            <Image
              key={item.key}
              src={item.src}
              alt=""
              width={120}
              height={120}
              className={item.mobile ? "" : "max-md:hidden"}
              style={{
                width: `min(${item.size}px, calc(${item.size} / var(--b) * 100cqw))`,
                height: "auto",
              }}
            />
          ))}
        </div>

        <ShelfTable />
      </div>
    </div>
  );
}

export default function Footer() {
  const isHome = usePathname() === "/";
  const lenis = useLenis();
  const text = useText(LAYOUT_TEXT);
  const t = text.footer;
  const BackToTopIcon = UI_ICONS.backToTop;
  const contactRows = [
    { Icon: UI_ICONS.location, text: SITE.address },
    { Icon: UI_ICONS.hours, text: t.hours },
    { Icon: UI_ICONS.phone, text: t.helpdesk },
  ];

  return (
    <footer className="bg-surface-inverse text-ink-on-inverse">
      {isHome && <Shelf />}

      {/* Content */}
      <div className="flex flex-col gap-12 px-5 pb-12 pt-12 sm:px-8 md:pt-16 xl:flex-row xl:justify-between xl:px-[110px]">
        {/* Identity */}
        <div className="flex w-full max-w-[480px] flex-col gap-[22px]">
          <p className="font-display text-[44px] font-normal leading-none text-white sm:text-[60px]">PinjamTEDI</p>

          <p className="text-[17px] font-normal leading-[1.6] sm:text-[19px]">
            {t.tagline.map((line, i) => (
              <span key={line} className="block">
                {line}
                {i < t.tagline.length - 1 && <span className="sr-only">, </span>}
              </span>
            ))}
          </p>

          <ul className="flex flex-col gap-[14px] text-[16px] font-normal leading-[1.55]">
            {contactRows.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-[14px]">
                <Icon {...UI_ICON_DEFAULTS} size={24} aria-hidden className="mt-px shrink-0 text-brand-secondary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <ul className="flex flex-wrap gap-3 pt-2" aria-label={t.socialLabel}>
            {FOOTER_SOCIALS.map((name) => {
              const icon = BRAND_ICONS[name];
              return (
                <li key={name}>
                  <a
                    href={SOCIAL_LINKS[name]}
                    aria-label={icon.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-[54px] items-center justify-center rounded-[14px] border-b-[5px] border-royal-edge bg-brand-interactive transition-transform hover:-translate-y-0.5 active:translate-y-[3px] active:border-b-2"
                  >
                    <Image src={icon.src} alt="" width={24} height={24} className="size-6" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Links */}
        <nav
          aria-label={t.linksLabel}
          className="grid grid-cols-2 gap-x-8 gap-y-10 pt-3 sm:grid-cols-3 md:gap-x-14 xl:flex xl:gap-14"
        >
          {LINK_COLUMNS.map((column) => (
            <div key={column.column} className="flex flex-col gap-4 whitespace-nowrap">
              <p className="text-[19px] font-extrabold leading-[1.3] text-brand-secondary">{t.columns[column.column]}</p>
              <ul className="flex flex-col gap-4">
                {column.links.map((link) => (
                  <li key={link.page}>
                    {link.file ? (
                      // a file or mailto: a plain link (next/link would prefetch it as a page)
                      <a
                        href={link.href}
                        download={link.href.endsWith(".docx") ? "contoh-surat-izin-pinjamtedi.docx" : undefined}
                        {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-[16px] font-normal leading-[1.55] transition-colors hover:text-white hover:underline"
                      >
                        {text.pages[link.page]}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[16px] font-normal leading-[1.55] transition-colors hover:text-white hover:underline"
                      >
                        {text.pages[link.page]}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Copyright */}
      <div className="px-5 pb-9 sm:px-8 xl:px-[110px]">
        <div className="h-[2px] w-full bg-line-inverse" />
        <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px] font-normal leading-[1.5]">
            {t.copyright}
          </p>
          {isHome && (
            <button
              type="button"
              onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-brand-secondary px-4 py-[10px] text-[16px] font-extrabold leading-[1.3] text-on-secondary transition-[filter] hover:brightness-95"
            >
              {t.backToTop}
              <BackToTopIcon {...UI_ICON_DEFAULTS} size={20} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}