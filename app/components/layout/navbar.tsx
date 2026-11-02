"use client";

// src/components/layout/Navbar.tsx
//
// Navbar PinjamTEDI (Figma node 1:3917, desktop 1440px).
// - Kondisi "Atas": menyatu dengan latar (transparan).
// - Kondisi "Saat scroll": kotak putih melayang bersudut bulat, muncul setelah scroll > 24px.
// - >= xl : layout desktop persis Figma.
// - <  xl : logo + lonceng + hamburger; menu, cari, dan CTA pindah ke panel.
//
// Butuh: colors.css, typography.css, fonts.ts (weight 600 untuk font-semibold).
// Aset: /public/brand/logo.svg  ← export dari Figma, layer "ikon/logo" (46x46).

import Image from "next/image";
import Notifikasi from "./notifikasi";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent } from "react";
// LazyMotion + m: hanya muat fitur animasi DOM dasar → bundle JS lebih kecil dari `motion` penuh
import { AnimatePresence, LazyMotion, domAnimation, m } from "motion/react";
import { Menu, Search, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Katalog", href: "/katalog" },
  { label: "Jadwal Ruang", href: "/jadwal-ruang" },
  { label: "Cara Pinjam", href: "/cara-pinjam" },
  { label: "Pengajuan Saya", href: "/pengajuan-saya" },
] as const;

const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // state scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // tutup panel saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  // Escape menutup panel; kunci scroll body saat panel terbuka
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // layar melebar ke desktop → tutup panel
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/katalog?q=${encodeURIComponent(q)}` : "/katalog");
    setOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-8 sm:pt-6">
      <div
        className={[
          "mx-auto w-full max-w-[1376px] transition-all duration-300",
          scrolled
            ? "rounded-[20px] border-2 border-border-strong bg-surface px-4 py-2 shadow-[0_4px_0_0_#0d2a4b] sm:px-5"
            : "border-2 border-transparent px-0 py-1",
        ].join(" ")}
      >
        <nav aria-label="Navigasi utama" className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="PinjamTEDI, beranda">
            <Image src="/img/logo.svg" alt="" width={46} height={46} loading="eager" className="size-[46px]" />
            <span className="flex flex-col whitespace-nowrap">
              <span className="font-display text-[26px] leading-[1.05] text-fg-heading">PinjamTEDI</span>
              <span className="hidden text-[12px] font-semibold leading-[1.4] text-fg sm:block">
                DTEDI Sekolah Vokasi UGM
              </span>
            </span>
          </Link>

          {/* Menu desktop */}
          <ul className="hidden items-center gap-[26px] whitespace-nowrap text-[16px] font-semibold leading-[1.3] text-fg-heading xl:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={[
                    "inline-block rounded-full border-2 px-[10px] py-[4px] transition-colors",
                    isActive(l.href)
                      ? "border-border-strong bg-brand-secondary shadow-[0_3px_0_0_#0d2a4b]"
                      : "border-transparent hover:bg-brand-secondary/40",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Aksi */}
          <div className="flex items-center gap-[10px]">
            {/* Cari (desktop) */}
            <form
              role="search"
              onSubmit={onSearch}
              className="hidden h-12 w-[230px] items-center gap-2 rounded-[14px] border-[1.5px] border-border bg-surface px-[14px] focus-within:border-brand-interactive xl:flex"
            >
              <Search size={18} strokeWidth={2.25} aria-hidden className="shrink-0 text-fg-heading" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari"
                aria-label="Cari fasilitas"
                className="w-full bg-transparent text-[15px] leading-[1.5] text-fg outline-none placeholder:text-fg-muted"
              />
            </form>

            {/* Lonceng + panel notifikasi */}
            <Notifikasi />

            {/* CTA (desktop) */}
            <Link
              href="/katalog"
              className="hidden h-12 items-center justify-center whitespace-nowrap rounded-2xl border-2 border-b-[6px] border-border-strong bg-brand-primary px-[26px] text-[17px] font-extrabold leading-[1.2] text-on-primary transition-colors hover:bg-brand-primary-hover active:translate-y-[3px] active:border-b-[3px] xl:inline-flex"
            >
              Pinjam sekarang
            </Link>

            {/* Hamburger (mobile/tablet) */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Tutup menu" : "Buka menu"}
              className="flex size-12 shrink-0 items-center justify-center rounded-[14px] border-2 border-border-strong bg-brand-secondary text-fg-heading shadow-[0_3px_0_0_#0d2a4b] transition-transform active:translate-y-[2px] active:shadow-none xl:hidden"
            >
              {open ? <X size={22} strokeWidth={2.5} aria-hidden /> : <Menu size={22} strokeWidth={2.5} aria-hidden />}
            </button>
          </div>
        </nav>
      </div>

      {/* Panel mobile/tablet */}
      <LazyMotion features={domAnimation} strict>
      <AnimatePresence>
        {open && (
          <>
            <m.button
              type="button"
              aria-label="Tutup menu"
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
              className="mx-auto mt-3 max-h-[calc(100dvh-6.5rem)] w-full max-w-[1376px] overflow-y-auto rounded-3xl border-2 border-border-strong bg-surface p-4 shadow-hard-royal xl:hidden"
            >
              <form
                role="search"
                onSubmit={onSearch}
                className="flex h-12 items-center gap-2 rounded-[14px] border-[1.5px] border-border bg-surface px-[14px] focus-within:border-brand-interactive"
              >
                <Search size={18} strokeWidth={2.25} aria-hidden className="shrink-0 text-fg-heading" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari"
                  aria-label="Cari fasilitas"
                  className="w-full bg-transparent text-[15px] leading-[1.5] text-fg outline-none placeholder:text-fg-muted"
                />
              </form>

              <ul className="mt-3 flex flex-col gap-2">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      className={[
                        "flex min-h-12 items-center rounded-2xl border-2 px-4 text-[16px] font-semibold text-fg-heading transition-colors",
                        isActive(l.href)
                          ? "border-border-strong bg-brand-secondary shadow-[0_3px_0_0_#0d2a4b]"
                          : "border-transparent hover:bg-surface-page",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/katalog"
                className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl border-2 border-b-[6px] border-border-strong bg-brand-primary text-[17px] font-extrabold leading-[1.2] text-on-primary transition-colors hover:bg-brand-primary-hover active:translate-y-[3px] active:border-b-[3px]"
              >
                Pinjam sekarang
              </Link>
            </m.div>
          </>
        )}
      </AnimatePresence>
      </LazyMotion>
    </header>
  );
}