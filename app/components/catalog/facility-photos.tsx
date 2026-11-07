// app/components/catalog/facility-photos.tsx
//
// Photo gallery on the facility detail page: one large photo + thumbnails (Figma detail mock).
// Photos come from Supabase Storage (app/data/facility-photos.ts). While they load, or if they cannot be
// loaded (no network, bucket not set up), the category illustration stays in place.

"use client";

import { useState } from "react";
import { CATEGORY_STYLE } from "@/app/design/category-style";
import FacilityIllustration from "@/app/components/ui/facility-illustration";
import type { FacilityView } from "@/app/i18n/facilities";
import { facilityPhotos } from "@/app/data/facility-photos";

export default function FacilityPhotos({ facility, alt }: { facility: FacilityView; alt: string }) {
  const photos = facilityPhotos(facility);
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());
  const markFailed = (i: number) => setFailed((s) => new Set(s).add(i));
  const usable = photos.map((src, i) => ({ src, i })).filter(({ i }) => !failed.has(i));
  const main = usable.find(({ i }) => i === current) ?? usable[0];

  const frame =
    "w-full shrink-0 overflow-hidden rounded-[22px] border-2 border-line-strong shadow-[5px_5px_0_0_var(--color-shadow-accent)] sm:shadow-[7px_7px_0_0_var(--color-shadow-accent)]";

  return (
    <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[420px] xl:w-[520px]">
      {main ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote Supabase photo, sized by the frame
        <img
          key={main.src}
          src={main.src}
          alt={alt}
          onError={() => markFailed(main.i)}
          className={`${frame} h-[260px] bg-white object-cover sm:h-[340px] lg:h-[400px]`}
        />
      ) : (
        <div className={`${frame} flex h-[260px] items-center justify-center p-8 sm:h-[340px] lg:h-[400px] ${CATEGORY_STYLE[facility.category].panel}`}>
          <FacilityIllustration id={facility.illustration} size={260} preload className="size-[180px] sm:size-[240px] xl:size-[260px]" />
        </div>
      )}

      {usable.length > 1 && (
        <ul className="flex gap-2">
          {usable.map(({ src, i }) => (
            <li key={src} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`${alt} (${i + 1})`}
                aria-current={main?.i === i}
                className={`block w-full overflow-hidden rounded-[10px] border-2 ${main?.i === i ? "border-line-strong" : "border-line"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" onError={() => markFailed(i)} className="aspect-[4/3] w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
