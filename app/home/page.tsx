import type { Metadata } from "next";
import HomeContent from "@/app/components/home/home-content";

// /home has the same content as "/" → canonical to "/" so it is not treated as duplicate content
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function HomeAliasPage() {
  return <HomeContent />;
}
