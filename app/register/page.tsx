// app/register/page.tsx
//
// Register page (Figma "00 Daftar (Register)", node 125:1297). Thin server page; the UI is a client component.
// Accounts are handled by the backend, so the form is UI only for now (see handleSignUp in register-content.tsx).

import type { Metadata } from "next";
import RegisterContent from "@/app/components/register/register-content";

export const metadata: Metadata = {
  title: "Daftar",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterContent />;
}