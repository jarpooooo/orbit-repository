// app/components/ui/facility-illustration.tsx
//
// One facility illustration (public/img/illustrations/*.svg, path from ILLUSTRATIONS in icon-map).
// Decorative: alt is empty, the facility name is always written next to it.
// The SVGs use navy #0d2a4b lines (1.2:1 on the dark surface), so always place them on a fixed
// accent panel (CATEGORY_STYLE[category].panel), which is the same in both themes. Do not edit the SVGs.

import Image from "next/image";
import { ILLUSTRATIONS, type IllustrationId } from "@/app/design/icon-map";

type Props = {
  id: IllustrationId;
  /** intrinsic size in px; the rendered size comes from `className` */
  size: number;
  className?: string;
  /** above-the-fold image (detail page) */
  preload?: boolean;
};

export default function FacilityIllustration({ id, size, className, preload }: Props) {
  return <Image src={ILLUSTRATIONS[id]} alt="" width={size} height={size} preload={preload} className={className} />;
}

/** Marker for the "letter" permission level and the letter flow: the signed-letter illustration on the fixed letter-level fill. */
export function LetterMark() {
  return (
    <span aria-hidden className="shrink-0 rounded-[10px] border-2 border-line-strong bg-level-letter p-1">
      <FacilityIllustration id="surat-bertanda-tangan" size={40} className="size-9" />
    </span>
  );
}
