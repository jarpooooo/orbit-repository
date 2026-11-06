// app/lib/firebase.ts
//
// The Firebase app (config only, small). Each service lives in its own module so a page downloads only
// what it uses:
//   ./firebase-auth  → Auth instance       (loaded lazily by app/lib/auth.ts after the page is interactive)
//   ./firestore      → Firestore instance  (facility store, requests, sign-up profile)
// Config comes from .env.local (NEXT_PUBLIC_FIREBASE_*, at the project root).
//
// Emulators: with NEXT_PUBLIC_USE_EMULATORS=true the app talks to the local Firebase Emulator Suite
// (`npm run emulators`, ports from firebase.json: Auth 9099, Firestore 8080) instead of the real project.
// Data there is fake and stays on this laptop; the Emulator UI is at http://127.0.0.1:4000.

import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** true → use the local emulators (set NEXT_PUBLIC_USE_EMULATORS=true in .env.local) */
export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";

// getApps() prevents a second initialize on hot reload
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/** Emulators are connected once per page load (hot reload re-runs modules; a second connect throws). */
export const emulatorFlags = globalThis as typeof globalThis & { __pinjamtediAuthEmulator?: boolean; __pinjamtediDbEmulator?: boolean };

// Analytics only runs in the browser, and never against the emulators (it would log fake traffic).
// Loaded on demand: nothing calls it yet, so it adds nothing to the pages.
export async function initAnalytics() {
  if (USE_EMULATORS) return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(app) : null;
}
