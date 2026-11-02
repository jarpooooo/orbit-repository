// src/lib/design/fonts.ts
//
// Font PinjamTEDI (dari Figma "Style Guide"):
//   Display  → Lilita One         (H1, H2, H3, judul kartu; hanya ada weight 400)
//   Body/UI  → Plus Jakarta Sans  (isi, label, tombol; weight 400–800)

import { Lilita_One, Plus_Jakarta_Sans } from "next/font/google";

export const fontDisplay = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lilita",
});

export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"], // Regular, Bold, ExtraBold (sesuai yang dipakai di Figma)
  display: "swap",
  variable: "--font-jakarta",
});

/** Pasang di <html className={fontVariables}>. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;