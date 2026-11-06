// app/components/layout/smooth-scroll.tsx  (used by app/layout.tsx)
//
// Smooth page scrolling with Lenis (https://github.com/darkroomengineering/lenis), on the window (root).
// - Native scroll stays the source of truth: sticky elements, motion's useScroll, and Next's scroll-to-top on
//   navigation keep working; Lenis only smooths wheel / trackpad input (touch stays native).
// - prefers-reduced-motion → no smoothing, programmatic scrolls jump (respectReducedMotion, default on).
// - Inner scroll areas opt out with `data-lenis-prevent` (mobile menu panel, notification list, letter paper).
//   No `allowNestedScroll`: it measures every element under the pointer on each wheel event (layout reads
//   in the middle of the animation), which made the glide stutter.
// - Scroll locks call lenis.stop() / start() (navbar mobile menu); useLenis() gives the instance anywhere.
//
// Tuning: a mouse wheel sends separate notches (~100px each). Each notch speeds the page up, then the lerp
// slows it down until the next notch, so a high lerp feels like steps. 0.08 keeps the speed between notches
// close to even (≈30% less speed change than 0.12) while the page still settles in about 1.4 s.
// Smoothness is only representative in a production build (`npm run build && npm start`); dev mode is slower.

"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import type { ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 1,
        anchors: { offset: -120 }, // #hash links scroll smoothly and land below the fixed navbar
        stopInertiaOnNavigate: true, // a click on an internal link stops the glide before the next page
      }}
    >
      {children}
    </ReactLenis>
  );
}
