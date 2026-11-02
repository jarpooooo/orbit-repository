@AGENTS.md

# Orbit Repository (PinjamTEDI)

Facility-borrowing web app ("PinjamTEDI"), built from the Figma file "Orbit repository". Early stage: the design system is in place; pages are still placeholders.

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
- `app/layout.tsx`: root layout (Geist fonts; metadata is still the create-next-app default)
- `app/page.tsx`: renders `app/home/page.tsx` (placeholder)
- `app/globals.css`: imports Tailwind. `colors.css` is **not imported yet**; add `@import "./design/colors.css";` after the Tailwind import.
- `app/design/`: design system (header comments say `src/lib/design/`, but the files live here)
  - `colors.css`: tokens. (1) PALETTE: `navy`, `royal`, `periwinkle`, `grape`, `mint`, `sun`, `tangerine`, `slate`, each 50–950; steps marked `= Figma` match the design exactly. (2) SEMANTIC tokens in `@theme inline`.
  - `color-variants.ts`: `COLOR_VARIANTS`, a set of Tailwind class strings per color (`text`, `bg*`, `onBg`, `shadow` (hard Figma shadow), `border`, `icon`, plus hover/group-hover forms)
  - `semantic-colors.ts`: `SEMANTIC_COLORS`, which maps meanings (brand, status, level, category, rank, surface, ...) to variants. Group names match the SEMANTIC section of `colors.css`.
  - `icon-map.ts`: `UI_ICONS` (lucide), `BRAND_ICONS` (custom SVG, since lucide v1 has no brand icons), and `*_ILLUSTRATIONS` (SVGs exported from Figma). `[Figma]` marks icons seen in the design; `[+]` marks icons added because they will likely be needed.

## Conventions
- Code comments and domain terms are in Indonesian (e.g. `umum/menengah/mahal`, `ruang`, `logistik`); keep using Indonesian.
- In components, choose colors by meaning (`SEMANTIC_COLORS.status.available`) instead of using raw palette classes. Add new colors to all three files: palette tokens, the variant, then the semantic mapping.
- Tailwind class strings must stay complete literals so Tailwind can detect them; never build class names dynamically.

## User preferences
<!-- TODO: the preference after "I always prefer..." was cut off in the request. Fill it in here. -->
