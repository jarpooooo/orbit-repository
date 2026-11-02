@AGENTS.md

# Orbit Repository (PinjamTEDI)

Facility-borrowing web app ("PinjamTEDI"), built from the Figma file "Orbit repository". Prototype: all pages exist, data is simulated (no API yet).

## Stack
- Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript
- Tailwind CSS v4 (CSS-first `@theme`, no tailwind.config), loaded through `@tailwindcss/turbopack`
- `lucide-react` v1 (icons), `motion` (animation), `lenis` (smooth scroll)
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`

Next.js 16 differs from older versions. Read `node_modules/next/dist/docs/` before using a Next API.

## Commands
- `npm run dev`: dev server
- `npm run build`: production build
- `npm run lint`: ESLint (flat config, `eslint-config-next`)

There is no test setup.

## Layout
- Routes are English: `catalog`, `catalog/[slug]/{schedule,request,letter,summary}`, `room-schedule`, `room-schedule/most-borrowed`, `my-requests`, `how-to-borrow`. `next.config.ts` permanently redirects the old Indonesian URLs (`/katalog`, `/jadwal-ruang`, ...). URL query params are still Indonesian (`q`, `kategori`, `hari`, `sesi`, `jumlah`, `kode`).
- `app/layout.tsx`: root layout (Navbar + Footer, site metadata). `app/page.tsx` and `app/home/page.tsx` both render `components/home/home-content.tsx`.
- `app/components/`: `home/` (home sections), `catalog/` (catalog + request flow), `layout/` (navbar, footer, breadcrumb, stepper, ...), `ui/` (small shared pieces such as `status-badge.tsx`).
- `app/data/facilities.ts`: facility data and domain types (`FacilityGroup`, `PermissionLevel`, `AvailabilityStatus`, `STATUS_STYLES`, `GROUP_LABELS`, ...). `app/data/site.ts`: SEO/site info.
- `app/i18n/`: UI text dictionaries (Indonesian / English), see "Language" below.
- `app/lib/`: `date.ts` (date helpers + Indonesian day/month names), `booking.ts` (sessions, booking rules, query parsing), `permission-letter.ts` (fills `public/templates/permission-letter.docx`).
- `app/globals.css`: imports Tailwind, `colors.css`, `typography.css`. Use `font-display` / `font-sans` utilities for fonts.
- `app/design/`: design system
  - `colors.css`: tokens. (1) PALETTE: `navy`, `royal`, `periwinkle`, `grape`, `mint`, `sun`, `tangerine`, `slate`, each 50–950, plus single Figma colors; steps marked `= Figma` match the design exactly. Same in both themes. (2) THEME tokens (`@theme static`), each written once as `light-dark(<light>, <dark>)`. (3) SEMANTIC tokens in `@theme inline` (brand, on-*, status, level, category, rank). (4) SCHEME: `color-scheme` switch and the `dark:` custom variant.
  - `color-variants.ts`: `COLOR_VARIANTS`, a set of Tailwind class strings per color (`text`, `bg*`, `onBg`, `shadow` (hard Figma shadow), `border`, `icon`, plus hover/group-hover forms)
  - `semantic-colors.ts`: `SEMANTIC_COLORS`, which maps meanings (brand, status, level, category, rank, surface, ...) to variants. Group names match the SEMANTIC section of `colors.css`.
  - `icon-map.ts`: `UI_ICONS` (lucide), `BRAND_ICONS` (custom SVG, since lucide v1 has no brand icons), and `*_ILLUSTRATIONS` (SVGs exported from Figma). `[Figma]` marks icons seen in the design; `[+]` marks icons added because they will likely be needed.

## Conventions
- Code is in English: file names, identifiers, types, and comments. User-facing text (labels, headings, messages) stays Indonesian; keep it in label maps (e.g. `GROUP_LABELS`, `STATUS_STYLES`) keyed by English keys (`room`, `logistics`, `verification`, `letter`, `direct`, `borrowed`).
- Exceptions that stay Indonesian because they are external contracts: URL query params, facility slugs and subcategory keys (used in URLs and illustration file names), and the `{{tags}}` inside the .docx template.
- In components, choose colors by meaning (`SEMANTIC_COLORS.status.available`) instead of using raw palette classes. Add new colors to all three files: palette tokens, the variant, then the semantic mapping.
- Tailwind class strings must stay complete literals so Tailwind can detect them; never build class names dynamically.

## Language (Indonesian / English)
- Indonesian is the default and what the server renders. English is a per-browser preference: the "Bahasa · Language" row (ID / EN) in `layout/settings-menu.tsx` saves `pinjamtedi:lang` in localStorage. URLs do not change. `<LanguageScript />` in the root layout's `<head>` sets `lang` / `data-lang` before paint and, for English, holds the page hidden (`data-lang-pending`, `globals.css`) until `<LanguageReady />` lifts it after hydration (~0.2 s; 1.5 s failsafe), so Indonesian text never flashes.
- Text lives in dictionaries in `app/i18n/`: `locale.ts` (types), `common.ts` (shared labels: groups, permission levels, "Semua"), `home.ts` (home sections), `site-layout.ts` (navbar, settings, notifications, shortcut dialog, footer, page names). Never name a file `layout.ts` / `page.tsx` inside `app/`: Next treats it as a route file.
- Write `const id = { ... }` first, then `const en: typeof id = { ... }` so a missing English string is a type error. Keys are English; dynamic text can be a function (`bellLabel: (n) => ...`).
- In components read text with `useText(DICTIONARY)` or `useLocale()` (from `layout/language.tsx`); this makes the component a client component. Data arrays hold keys (`room: "discussionA"`), not display text.
- Translated so far: home page + site chrome (navbar, settings menu, notification panel, shortcut dialog, footer). Other pages still render Indonesian. Page `metadata` (title / description) and text drawn inside SVG illustrations stay Indonesian.

## Dark mode and color tokens
- Light is the default. Dark mode is opt-in through the "Mode gelap" switch in `layout/settings-menu.tsx`, which sets `data-theme="dark"` on `<html>` and saves `pinjamtedi:theme` in localStorage (`layout/theme.tsx`, `useTheme()`). `<ThemeScript />` in the root layout's `<head>` applies the saved choice before the first paint; keep `suppressHydrationWarning` on `<html>`. The OS setting is not used.
- **No raw hex in components.** Use theme tokens, which switch automatically: `bg-page` (sky page), `bg-surface` (white cards), `bg-surface-warm` (cream), `bg-surface-row` (yellow rows), `bg-surface-inverse` (navy blocks), `text-ink` (headings, navy), `text-ink-body`, `text-ink-muted`, `text-link`, `border-line-strong` (the 2px Figma outline), `border-line`, `bg-pair-*-bg` / `text-pair-*-fg` or the semantic `status-*` / `level-*` pairs. Never use `dark:` to swap colors.
- **Decide the role of navy before using it.** Navy as ink (text, outline, shadow on a surface) → `text-ink` / `border-line-strong` / `var(--color-shadow)`; these turn light in dark mode. Navy text ON yellow / orange / mint / periwinkle → `text-on-accent` / `text-on-primary` / `text-on-secondary`; these stay navy. Headings get `text-ink` from the base layer, so a heading on an accent fill needs an explicit `text-on-*`. Muted text on those fills → `text-on-accent-muted`.
- Hard shadows: keep the Figma offsets and use the shadow tokens, e.g. `shadow-[5px_5px_0_0_var(--color-shadow)]`, `var(--color-shadow-accent)` (purple), `var(--color-shadow-interactive)` (blue), or `shadow-hard-*`.
- Accent fills (`bg-brand-primary`, `bg-brand-secondary`, `bg-sun-200`, `bg-mint-300`, `bg-periwinkle-400`, `bg-tangerine-400`, `bg-status-available`) are the same in both themes; the orange CTA stays orange.
- **Adding a color:** add one line to the THEME section of `colors.css` with both values (`--color-x: light-dark(<light>, <dark>)`), check WCAG AA in both themes (4.5:1 text, 3:1 large text and UI parts), then use `bg-x` / `text-x`. Colors that never change go in PALETTE. Add a variant / semantic mapping only when the color has a meaning.
- `dark:` (custom variant) is only for layout differences that exist in one theme, e.g. the lit panel behind the hero illustration. It does not apply in print.
- Lightning CSS compiles `light-dark()` to a polyfill switched on `:root`, so tokens cannot be forced light inside a subtree. Always-light areas use fixed palette classes: the letter paper in `letter-preview.tsx` (`bg-white` + `text-black`) and the QR code in `request-summary.tsx`. `@media print` forces the light theme.
- Deliberate deviations from Figma, for WCAG AA: `ink-muted-on-page` = `#4f6379` for muted text on the sky page (Figma `#5b6f87` is 4.30:1 there); `on-accent-muted` = `#45566b` for muted text on yellow / mint fills (Figma `#5b6f87` is 3.6:1 / 3.2:1). Use `text-ink-muted-on-page` for muted text that sits directly on `bg-page`.
- Illustrations (`public/img`) use navy lines and white fills; they stay readable on the fixed accent panels (yellow / mint / periwinkle). Do not edit the SVG files for dark mode.

## User preferences
<!-- TODO: the preference after "I always prefer..." was cut off in the request. Fill it in here. -->
