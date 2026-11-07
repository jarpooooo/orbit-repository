// app/components/catalog/schedule-picker.tsx  (used by app/catalog/[slug]/schedule/page.tsx)
//
// Step 3 of the request flow. Shell only: breadcrumb + stepper, then the Scheduler of the facility's
// booking mode from BOOKING_MODES (booking/registry.tsx):
//   "daily"   → DailyScheduler   (Figma 2.2 "Pilih tanggal": pick-up + return date)
//   "session" → SessionScheduler (Figma 3.2a "Pilih hari" → 3.2b "Pilih jam": one day, then custom hours)
// "Today" is read in the browser after mount so it never differs from the server prerender.

"use client";

import { Suspense, useEffect, useState } from "react";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import Stepper from "@/app/components/layout/stepper";
import { bookingMode, type Facility } from "@/app/data/facilities";
import { BOOKING_TEXT } from "@/app/i18n/booking-flow";
import { localizeFacility } from "@/app/i18n/facilities";
import { LAYOUT_TEXT } from "@/app/i18n/site-layout";
import { useLocale } from "@/app/components/layout/language";
import { modeFor } from "./booking/registry";
import { useLiveFacility } from "@/app/lib/facility-store";

export default function SchedulePicker({ facility: seed }: { facility: Facility }) {
  const facility = useLiveFacility(seed);
  const { locale } = useLocale();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const f = localizeFacility(facility, locale);
  const mode = bookingMode(facility);
  const { Scheduler } = modeFor(facility);

  return (
    <main className="min-h-screen bg-page px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 sm:pt-[132px] xl:px-[140px] xl:pb-20">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-5">
        <Breadcrumb
          items={[
            { label: LAYOUT_TEXT[locale].pages.catalog, href: "/catalog" },
            { label: f.name, href: `/catalog/${f.id}` },
            { label: BOOKING_TEXT[locale].modes[mode].step },
          ]}
        />
        <Stepper active={3} mode={mode} />
        {/* wait for "today" from the browser first (avoids a server vs. client render mismatch) */}
        {/* Suspense: the room scheduler reads its step (?hari=) from the URL */}
        {now && (
          <Suspense>
            <Scheduler facility={facility} now={now} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
