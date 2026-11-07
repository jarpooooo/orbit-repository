// app/design/semantic-colors.ts
//
// Semantic colors = colors GROUPED BY MEANING, not per component.
// Each group maps one "meaning" to one color variant from color-variants.ts.
// The matching CSS tokens live in colors.css (SEMANTIC section) under the same group names.

import { COLOR_VARIANTS } from "./color-variants";

export const SEMANTIC_COLORS = {
  /** Identity and main color roles (Style Guide: "Navy as ink, four bright accents"). */
  brand: {
    ink: COLOR_VARIANTS.navy, // heading text, lines, button shadows
    primary: COLOR_VARIANTS.tangerine, // primary action
    secondary: COLOR_VARIANTS.sun, // secondary action, highlights, step numbers
    tertiary: COLOR_VARIANTS.periwinkle, // third accent
    accent: COLOR_VARIANTS.grape, // catalog card shadow
    interactive: COLOR_VARIANTS.royal, // search action, arrow icons, bell
  },

  /** Availability and request progress. */
  status: {
    available: COLOR_VARIANTS.mint, // Kosong, Tersedia, Disetujui
    pending: COLOR_VARIANTS.sun, // Menunggu verifikasi, Terbatas
    attention: COLOR_VARIANTS.tangerine, // Surat diperiksa, Sisa 1 slot, Hampir habis
    unavailable: COLOR_VARIANTS.slate, // Terisi, Habis, Sedang dipinjam, Tidak tersedia
  },

  /** Facility permission level (Figma: Langsung / Verifikasi / Butuh surat). Keys match PermissionLevel in facilities.ts. */
  level: {
    direct: COLOR_VARIANTS.mint,
    verification: COLOR_VARIANTS.sun,
    letter: COLOR_VARIANTS.tangerine,
  },

  /** Facility categories (illustration palette). Components use CATEGORY_STYLE (category-style.ts). */
  category: {
    hardware: COLOR_VARIANTS.sun,
    room: COLOR_VARIANTS.mint,
    multimedia: COLOR_VARIANTS.periwinkle,
    logistics: COLOR_VARIANTS.tangerine,
  },

  /** Podium ranks on the "Paling sering dipinjam" page. */
  rank: {
    first: COLOR_VARIANTS.sun,
    second: COLOR_VARIANTS.periwinkle,
    third: COLOR_VARIANTS.tangerine,
  },
} as const;

export type SemanticGroup = keyof typeof SEMANTIC_COLORS;
export type SemanticKey<G extends SemanticGroup> = keyof (typeof SEMANTIC_COLORS)[G];
