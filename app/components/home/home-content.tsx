// app/components/home/home-content.tsx
//
// Home page sections, shared by "/" and "/home".

import CategoryPicker from "./category-picker";
import Hero from "./hero";
import HowToBorrow from "./how-to-borrow";
import NotificationCta from "./notification-cta";
import TodaySummary from "./today-summary";
import { SignedInOnly } from "@/app/components/layout/auth-gate";

export default function HomeContent() {
  return (
    <main>
      <Hero />
      <TodaySummary />
      <CategoryPicker />
      <HowToBorrow />
      {/* request status notifications only make sense for signed-in users */}
      <SignedInOnly>
        <NotificationCta />
      </SignedInOnly>
    </main>
  );
}
