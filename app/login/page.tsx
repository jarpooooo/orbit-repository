// app/login/page.tsx
//
// Login page (Figma "00 Masuk (Login)", node 125:1130). Thin server page; the UI is a client component.
// Accounts are handled by the backend, so the form is UI only for now (see handleSignIn in login-content.tsx).

import type { Metadata } from "next";
import LoginContent from "@/app/components/login/login-content";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginContent />;
}