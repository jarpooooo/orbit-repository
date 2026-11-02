// app/design/fonts.ts
//
// PinjamTEDI fonts (from Figma "Style Guide"):
//   Display  → Lilita One         (H1, H2, H3, card titles; only weight 400 exists)
//   Body/UI  → Plus Jakarta Sans  (body, labels, buttons; weight 400–800)
//
// Use them through the Tailwind utilities `font-display` / `font-sans` (typography.css).

import { Lilita_One, Plus_Jakarta_Sans } from "next/font/google";

export const fontDisplay = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-lilita",
});

export const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"], // Regular, Bold, ExtraBold (the weights used in Figma)
  display: "swap",
  variable: "--font-jakarta",
});

/** Put on <html className={fontVariables}>. */
export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;
