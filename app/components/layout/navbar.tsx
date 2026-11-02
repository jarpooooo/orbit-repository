// app/components/layout/navbar.tsx
//
// PinjamTEDI navbar (Figma node 1:3917, desktop 1440px).
// - "Top" state: blends into the background (transparent).
// - "Scrolled" state: floating surface-colored rounded box, shown after scrolling > 24px.
// - >= xl : desktop layout as in Figma. Links are 16px apart (Figma 26px) so the settings gear fits;
//           the "Pinjam sekarang" CTA shows from 1440px (below that the "Katalog" link covers it).
// - <  xl : logo + settings + bell + hamburger; menu, search, and CTA move into a panel.
//           Below sm: 44px buttons and tighter padding; below 360px only the logo mark shows.
//
// Requires: colors.css, typography.css, fonts.ts.
// Asset: /public/img/logo.svg ← exported from Figma, layer "ikon/logo" (46x46).

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
// LazyMotion + m: only loads the basic DOM animation features → smaller JS bundle than the full `motion`
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import NotificationPanel from "./notification-panel";
import SettingsMenu from "./settings-menu";
import { useText } from "./language";
import { LAYOUT_TEXT, type PageKey } from "@/app/i18n/site-layout";

const NAV_LINKS: readonly { page: PageKey; href: string }[] = [
  { page: "catalog", href: "/catalog" },
  { page: "roomSchedule", href: "/room-schedule" },
  { page: "howToBorrow", href: "/how-to-borrow" },
  { page: "myRequests", href: "/my-requests" },
];

const SCROLL_THRESHOLD = 24;
const DESKTOP_QUERY = "(min-width: 1280px)"; // Tailwind `xl`

const CTA_BUTTON =
  "h-12 items-center justify-center rounded-2xl border-2 border-b-[6px] border-line-strong bg-brand-primary text-[17px] font-extrabold leading-[1.2] text-on-primary transition-colors hover:bg-brand-primary-hover active:translate-y-[3px] active:border-b-[3px]";

type SearchFieldProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  className: string;
};

function SearchField({ query, onQueryChange, onSubmit, className }: SearchFieldProps) {
  const t = useText(LAYOUT_TEXT).navbar;
  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={`h-12 items-center gap-2 rounded-[14px] border-[1.5px] border-line bg-surface px-[14px] focus-within:border-focus ${className}`}
    >
      <Search size={18} strokeWidth={2.25} aria-hidden className="shrink-0 text-ink" />
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={t.searchPlaceholder}
        aria-label={t.searchLabel}
        className="w-full bg-transparent text-[15px] leading-[1.5] text-ink-body outline-none placeholder:text-ink-placeholder"
      />
    </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const text = useText(LAYOUT_TEXT);
  const t = text.navbar;
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the panel on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the panel; lock body scroll while the panel is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // viewport grows to desktop → close the panel
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-8 sm:pt-6">
      <div
        className={[
          "mx-auto w-full max-w-[1376px] transition-all duration-300",
          scrolled
            ? "rounded-[20px] border-2 border-line-strong bg-surface px-2 py-2 shadow-[0_4px_0_0_var(--color-shadow)] sm:px-5"
            : "border-2 border-transparent px-0 py-1",
        ].join(" ")}
      >
        <nav aria-label={t.mainNavLabel} className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label={t.homeLinkLabel}>
            <Image src="/img/logo.svg" alt="" width={46} height={46} loading="eager" className="size-10 sm:size-[46px]" />
            <span className="flex flex-col whitespace-nowrap max-[359px]:hidden">
              <span className="font-display text-[22px] leading-[1.05] text-ink sm:text-[26px]">PinjamTEDI</span>
              <span className="hidden text-[12px] font-semibold leading-[1.4] text-ink-body sm:block">
                {t.subtitle}
              </span>
            </span>
          </Link>

          {/* Desktop menu */}
          <ul className="hidden items-center gap-4 whitespace-nowrap text-[16px] font-semibold leading-[1.3] text-ink xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={[
                    "inline-block rounded-full border-2 px-[10px] py-[4px] transition-colors",
                    isActive(l.href)
                      ? "border-line-strong bg-brand-secondary text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)]"
                      : "border-transparent hover:bg-brand-secondary/40",
                  ].join(" ")}
                >
                  {text.pages[l.page]}
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-[10px]">
            <SearchField query={query} onQueryChange={setQuery} onSubmit={onSearch} className="hidden w-[230px] xl:flex" />

            <SettingsMenu />

            <NotificationPanel />

            <Link href="/catalog" className={`${CTA_BUTTON} hidden whitespace-nowrap px-[26px] min-[1440px]:inline-flex`}>
              {t.cta}
            </Link>

            {/* Hamburger (mobile/tablet) */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? t.closeMenu : t.openMenu}
              className="flex size-11 shrink-0 items-center justify-center rounded-[14px] border-2 border-line-strong bg-brand-secondary sm:size-12 text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)] transition-transform active:translate-y-[2px] active:shadow-none xl:hidden"
            >
              {open ? <X size={22} strokeWidth={2.5} aria-hidden /> : <Menu size={22} strokeWidth={2.5} aria-hidden />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile/tablet panel */}
      <LazyMotion features={domAnimation} strict>
        <AnimatePresence>
          {open && (
            <>
              <m.button
                type="button"
                aria-label={t.closeMenu}
                tabIndex={-1}
                onClick={() => setOpen(false)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 -z-10 cursor-default bg-navy-900/40 xl:hidden"
              />
              <m.div
                id={menuId}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mx-auto mt-3 max-h-[calc(100dvh-6.5rem)] w-full max-w-[1376px] overflow-y-auto rounded-3xl border-2 border-line-strong bg-surface p-4 shadow-hard-royal xl:hidden"
              >
                <SearchField query={query} onQueryChange={setQuery} onSubmit={onSearch} className="flex" />

                <ul className="mt-3 flex flex-col gap-2">
                  {NAV_LINKS.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={isActive(l.href) ? "page" : undefined}
                        className={[
                          "flex min-h-12 items-center rounded-2xl border-2 px-4 text-[16px] font-semibold transition-colors",
                          isActive(l.href)
                            ? "border-line-strong bg-brand-secondary text-on-secondary shadow-[0_3px_0_0_var(--color-shadow)]"
                            : "border-transparent text-ink hover:bg-page",
                        ].join(" ")}
                      >
                        {text.pages[l.page]}
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link href="/catalog" className={`${CTA_BUTTON} mt-4 flex w-full`}>
                  {t.cta}
                </Link>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </LazyMotion>
    </header>
  );
}