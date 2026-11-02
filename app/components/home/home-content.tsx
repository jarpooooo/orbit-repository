// app/components/home/home-content.tsx
//
// Home page sections, shared by "/" and "/home".

import CategoryPicker from "./category-picker";
import Hero from "./hero";
import HowToBorrow from "./how-to-borrow";
import NotificationCta from "./notification-cta";
import TodaySummary from "./today-summary";

export default function HomeContent() {
  return (
    <main>
      <Hero />
      <TodaySummary />
      <CategoryPicker />
      <HowToBorrow />
      <NotificationCta />
    </main>
  );
}
