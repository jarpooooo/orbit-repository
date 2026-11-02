// src/lib/design/color-variants.ts
//
// Variant = tema kelas Tailwind per WARNA (bukan per peran/komponen).
// Pengelompokan berdasarkan makna ada di semantic-colors.ts.
// Token (royal-700, hijau-bg, shadow-hard-*, dst.) didefinisikan di colors.css.

export type ColorVariant =
  | "navy"
  | "royal"
  | "periwinkle"
  | "grape"
  | "mint"
  | "sun"
  | "tangerine"
  | "slate";

export interface ColorVariantTheme {
  base: string;

  text: string;
  textHover: string;
  textGroupHover: string;

  bg: string;
  bgHover: string;
  bgLight: string;
  bgLightHover: string;
  bgLightGroupHover: string;
  bgNormal: string;
  bgNormalHover: string;
  bgNormalGroupHover: string;
  bgDark: string;
  bgDarkHover: string;
  bgDarkGroupHover: string;

  /** teks di atas `bg` solid */
  onBg: string;
  /** hard shadow dari Figma */
  shadow: string;

  border: string;
  borderHover: string;
  borderGroupHover: string;

  badgeText: string;
  badgeBg: string;
  badgeBgGroupHover: string;

  icon: string;
  iconHover: string;
}

export const COLOR_VARIANTS: Record<ColorVariant, ColorVariantTheme> = {
  // Navy #0d2a4b
  navy: {
    base: "navy",

    text: "text-navy-900",
    textHover: "hover:text-navy-900",
    textGroupHover: "group-hover:text-navy-900",

    bg: "bg-navy-900",
    bgHover: "hover:bg-navy-800",
    bgLight: "bg-navy-100",
    bgLightHover: "hover:bg-navy-200",
    bgLightGroupHover: "group-hover:bg-navy-200",
    bgNormal: "bg-navy-800",
    bgNormalHover: "hover:bg-navy-800",
    bgNormalGroupHover: "group-hover:bg-navy-800",
    bgDark: "bg-navy-900",
    bgDarkHover: "hover:bg-navy-900",
    bgDarkGroupHover: "group-hover:bg-navy-900",

    onBg: "text-white",
    shadow: "shadow-hard-navy",

    border: "border-navy-900",
    borderHover: "hover:border-navy-800",
    borderGroupHover: "group-hover:border-navy-800",

    badgeText: "text-navy-900",
    badgeBg: "bg-navy-100",
    badgeBgGroupHover: "group-hover:bg-navy-100",

    icon: "text-navy-900",
    iconHover: "group-hover:text-navy-900",
  },

  // Biru #1f4fd8
  royal: {
    base: "royal",

    text: "text-royal-700",
    textHover: "hover:text-royal-700",
    textGroupHover: "group-hover:text-royal-700",

    bg: "bg-royal-700",
    bgHover: "hover:bg-royal-800",
    bgLight: "bg-royal-100",
    bgLightHover: "hover:bg-royal-200",
    bgLightGroupHover: "group-hover:bg-royal-200",
    bgNormal: "bg-royal-600",
    bgNormalHover: "hover:bg-royal-600",
    bgNormalGroupHover: "group-hover:bg-royal-600",
    bgDark: "bg-royal-900",
    bgDarkHover: "hover:bg-royal-900",
    bgDarkGroupHover: "group-hover:bg-royal-900",

    onBg: "text-white",
    shadow: "shadow-hard-royal",

    border: "border-royal-700",
    borderHover: "hover:border-royal-800",
    borderGroupHover: "group-hover:border-royal-800",

    badgeText: "text-royal-800",
    badgeBg: "bg-royal-100",
    badgeBgGroupHover: "group-hover:bg-royal-100",

    icon: "text-royal-700",
    iconHover: "group-hover:text-royal-800",
  },

  // Periwinkle #6c98ff
  periwinkle: {
    base: "periwinkle",

    text: "text-periwinkle-700",
    textHover: "hover:text-periwinkle-700",
    textGroupHover: "group-hover:text-periwinkle-700",

    bg: "bg-periwinkle-400",
    bgHover: "hover:bg-periwinkle-500",
    bgLight: "bg-periwinkle-100",
    bgLightHover: "hover:bg-periwinkle-200",
    bgLightGroupHover: "group-hover:bg-periwinkle-200",
    bgNormal: "bg-periwinkle-500",
    bgNormalHover: "hover:bg-periwinkle-500",
    bgNormalGroupHover: "group-hover:bg-periwinkle-500",
    bgDark: "bg-periwinkle-900",
    bgDarkHover: "hover:bg-periwinkle-900",
    bgDarkGroupHover: "group-hover:bg-periwinkle-900",

    onBg: "text-navy-900",
    shadow: "shadow-hard-navy",

    border: "border-periwinkle-400",
    borderHover: "hover:border-periwinkle-500",
    borderGroupHover: "group-hover:border-periwinkle-500",

    badgeText: "text-periwinkle-800",
    badgeBg: "bg-periwinkle-100",
    badgeBgGroupHover: "group-hover:bg-periwinkle-100",

    icon: "text-periwinkle-700",
    iconHover: "group-hover:text-periwinkle-800",
  },

  // Ungu #5b3bb5
  grape: {
    base: "grape",

    text: "text-grape-700",
    textHover: "hover:text-grape-700",
    textGroupHover: "group-hover:text-grape-700",

    bg: "bg-grape-700",
    bgHover: "hover:bg-grape-800",
    bgLight: "bg-grape-100",
    bgLightHover: "hover:bg-grape-200",
    bgLightGroupHover: "group-hover:bg-grape-200",
    bgNormal: "bg-grape-600",
    bgNormalHover: "hover:bg-grape-600",
    bgNormalGroupHover: "group-hover:bg-grape-600",
    bgDark: "bg-grape-900",
    bgDarkHover: "hover:bg-grape-900",
    bgDarkGroupHover: "group-hover:bg-grape-900",

    onBg: "text-white",
    shadow: "shadow-hard-grape",

    border: "border-grape-700",
    borderHover: "hover:border-grape-800",
    borderGroupHover: "group-hover:border-grape-800",

    badgeText: "text-grape-800",
    badgeBg: "bg-grape-100",
    badgeBgGroupHover: "group-hover:bg-grape-100",

    icon: "text-grape-700",
    iconHover: "group-hover:text-grape-800",
  },

  // Mint #2ee6b0
  mint: {
    base: "mint",

    text: "text-mint-700",
    textHover: "hover:text-mint-700",
    textGroupHover: "group-hover:text-mint-700",

    bg: "bg-mint-300",
    bgHover: "hover:bg-mint-400",
    bgLight: "bg-mint-100",
    bgLightHover: "hover:bg-mint-200",
    bgLightGroupHover: "group-hover:bg-mint-200",
    bgNormal: "bg-mint-400",
    bgNormalHover: "hover:bg-mint-400",
    bgNormalGroupHover: "group-hover:bg-mint-400",
    bgDark: "bg-mint-900",
    bgDarkHover: "hover:bg-mint-900",
    bgDarkGroupHover: "group-hover:bg-mint-900",

    onBg: "text-navy-900",
    shadow: "shadow-hard-navy",

    border: "border-mint-300",
    borderHover: "hover:border-mint-400",
    borderGroupHover: "group-hover:border-mint-400",

    badgeText: "text-hijau-fg",
    badgeBg: "bg-hijau-bg",
    badgeBgGroupHover: "group-hover:bg-hijau-bg",

    icon: "text-mint-700",
    iconHover: "group-hover:text-mint-800",
  },

  // Kuning #ffd43b
  sun: {
    base: "sun",

    text: "text-sun-700",
    textHover: "hover:text-sun-700",
    textGroupHover: "group-hover:text-sun-700",

    bg: "bg-sun-200",
    bgHover: "hover:bg-sun-300",
    bgLight: "bg-sun-100",
    bgLightHover: "hover:bg-sun-200",
    bgLightGroupHover: "group-hover:bg-sun-200",
    bgNormal: "bg-sun-300",
    bgNormalHover: "hover:bg-sun-300",
    bgNormalGroupHover: "group-hover:bg-sun-300",
    bgDark: "bg-sun-900",
    bgDarkHover: "hover:bg-sun-900",
    bgDarkGroupHover: "group-hover:bg-sun-900",

    onBg: "text-navy-900",
    shadow: "shadow-hard-sun",

    border: "border-sun-200",
    borderHover: "hover:border-sun-300",
    borderGroupHover: "group-hover:border-sun-300",

    badgeText: "text-kuning-fg",
    badgeBg: "bg-kuning-bg",
    badgeBgGroupHover: "group-hover:bg-kuning-bg",

    icon: "text-sun-700",
    iconHover: "group-hover:text-sun-800",
  },

  // Oranye #f2862e
  tangerine: {
    base: "tangerine",

    text: "text-tangerine-700",
    textHover: "hover:text-tangerine-700",
    textGroupHover: "group-hover:text-tangerine-700",

    bg: "bg-tangerine-400",
    bgHover: "hover:bg-tangerine-500",
    bgLight: "bg-tangerine-100",
    bgLightHover: "hover:bg-tangerine-200",
    bgLightGroupHover: "group-hover:bg-tangerine-200",
    bgNormal: "bg-tangerine-500",
    bgNormalHover: "hover:bg-tangerine-500",
    bgNormalGroupHover: "group-hover:bg-tangerine-500",
    bgDark: "bg-tangerine-900",
    bgDarkHover: "hover:bg-tangerine-900",
    bgDarkGroupHover: "group-hover:bg-tangerine-900",

    onBg: "text-navy-900",
    shadow: "shadow-hard-navy",

    border: "border-tangerine-400",
    borderHover: "hover:border-tangerine-500",
    borderGroupHover: "group-hover:border-tangerine-500",

    badgeText: "text-oranye-fg",
    badgeBg: "bg-oranye-bg",
    badgeBgGroupHover: "group-hover:bg-oranye-bg",

    icon: "text-tangerine-700",
    iconHover: "group-hover:text-tangerine-800",
  },

  // Abu #3b4a5c (pasangan status abu)
  slate: {
    base: "slate",

    text: "text-slate-700",
    textHover: "hover:text-slate-700",
    textGroupHover: "group-hover:text-slate-700",

    bg: "bg-slate-700",
    bgHover: "hover:bg-slate-800",
    bgLight: "bg-abu-bg",
    bgLightHover: "hover:bg-slate-200",
    bgLightGroupHover: "group-hover:bg-slate-200",
    bgNormal: "bg-slate-600",
    bgNormalHover: "hover:bg-slate-600",
    bgNormalGroupHover: "group-hover:bg-slate-600",
    bgDark: "bg-slate-900",
    bgDarkHover: "hover:bg-slate-900",
    bgDarkGroupHover: "group-hover:bg-slate-900",

    onBg: "text-white",
    shadow: "shadow-hard-navy",

    border: "border-slate-300",
    borderHover: "hover:border-slate-400",
    borderGroupHover: "group-hover:border-slate-400",

    badgeText: "text-abu-fg",
    badgeBg: "bg-abu-bg",
    badgeBgGroupHover: "group-hover:bg-abu-bg",

    icon: "text-slate-700",
    iconHover: "group-hover:text-slate-800",
  },
};