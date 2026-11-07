// app/lib/auth.ts
//
// Sign-in with Firebase Authentication (Google or email + password). The Auth instance comes from
// ./firebase-auth (local emulators when NEXT_PUBLIC_USE_EMULATORS=true).
//
// Performance: this module is imported by the navbar (every page), so it has NO static Firebase import.
// firebase/auth is downloaded after the page is interactive (first useAuth() subscriber), and
// firebase/firestore only when a profile is saved. Until then the state is "loading".
//
// Who may sign in: UGM accounts only. The role follows the email domain:
//   @mail.ugm.ac.id → "student"     @ugm.ac.id → "staff"     ADMIN_EMAILS → "admin"     anything else → signed out again
// The same rule belongs in firestore.rules later (request.auth.token.email), so the role cannot be faked.
//
// Read the state anywhere with useAuth() / useSession(). Errors are returned as AuthErrorKey (text in
// AUTH_TEXT.errors), never as raw Firebase messages.

"use client";

import { useSyncExternalStore } from "react";
import type { User } from "firebase/auth";

/** firebase/auth + the app's Auth instance, loaded once on first use. */
const loadAuth = () => Promise.all([import("firebase/auth"), import("./firebase-auth")]).then(([sdk, { auth }]) => ({ ...sdk, auth }));

export type SessionRole = "student" | "staff" | "admin";

/** Admin accounts (any domain). Must match isAdmin() in firestore.rules. */
export const ADMIN_EMAILS: readonly string[] = ["admin@pinjamtedi.web.app"];
export type Session = { uid: string; role: SessionRole; name: string; email: string; photoUrl: string | null; emailVerified: boolean };

export type AuthState = { status: "loading" } | { status: "signed-out" } | { status: "signed-in"; session: Session };

export type AuthErrorKey =
  | "wrongCredentials"
  | "emailInUse"
  | "weakPassword"
  | "domainNotAllowed"
  | "network"
  | "tooManyRequests"
  | "popupBlocked"
  | "unknown";

/** Email domain → role. Order matters: the more specific domain first. */
const ROLE_BY_DOMAIN: readonly (readonly [domain: string, role: SessionRole])[] = [
  ["mail.ugm.ac.id", "student"],
  ["ugm.ac.id", "staff"],
];

export function roleForEmail(email: string | null | undefined): SessionRole | null {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) return "admin";
  const domain = email?.toLowerCase().split("@")[1];
  return ROLE_BY_DOMAIN.find(([d]) => d === domain)?.[1] ?? null;
}

/* --------------------------------- store --------------------------------- */

const LOADING: AuthState = { status: "loading" };
const SIGNED_OUT: AuthState = { status: "signed-out" };
let state: AuthState = LOADING;
const listeners = new Set<() => void>();

function toState(user: User | null): AuthState {
  const role = roleForEmail(user?.email);
  if (!user || !role) return SIGNED_OUT;
  return {
    status: "signed-in",
    session: {
      uid: user.uid,
      role,
      name: user.displayName || user.email!.split("@")[0],
      email: user.email!,
      photoUrl: user.photoURL,
      emailVerified: role === "admin" ? true : user.emailVerified,
    },
  };
}

// one Firebase listener for the whole app, started on the first subscriber
let started = false;
function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  void loadAuth().then(({ auth, onAuthStateChanged, signOut }) =>
    onAuthStateChanged(auth, (user) => {
      // a non-UGM account that slipped through (e.g. Google popup) is signed out right away
      if (user && !roleForEmail(user.email)) void signOut(auth);
      publish(user);
    }),
  ).catch((error) => {
    // the Auth chunk did not load (offline, blocked): show "signed out" instead of an endless loading state
    console.warn("[auth] could not load Firebase Auth:", error);
    started = false; // the next subscriber tries again
    publish(null);
  });
}

function publish(user: User | null) {
  state = toState(user);
  listeners.forEach((l) => l());
}


function subscribe(onChange: () => void) {
  start();
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/** Auth state; "loading" on the server and until Firebase has restored the session. */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => LOADING);
}

/** The signed-in session, or null (also while loading). */
export function useSession(): Session | null {
  const s = useAuth();
  return s.status === "signed-in" ? s.session : null;
}

/* -------------------------------- actions -------------------------------- */

function errorKey(e: unknown): AuthErrorKey {
  const code = (e as { code?: string })?.code ?? "";
  if (["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found", "auth/invalid-email"].includes(code)) return "wrongCredentials";
  if (code === "auth/email-already-in-use") return "emailInUse";
  if (code === "auth/weak-password") return "weakPassword";
  if (code === "auth/network-request-failed") return "network";
  if (code === "auth/too-many-requests") return "tooManyRequests";
  if (code === "auth/popup-blocked") return "popupBlocked";
  if (code === "domain-not-allowed") return "domainNotAllowed";
  return "unknown";
}

/** null = success; "cancelled" = the user closed the Google popup (show nothing). */
export type AuthResult = null | "cancelled" | AuthErrorKey;

async function run(action: () => Promise<unknown>): Promise<AuthResult> {
  try {
    await action();
    return null;
  } catch (e) {
    const code = (e as { code?: string })?.code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return "cancelled";
    return errorKey(e);
  }
}


const domainError = () => Object.assign(new Error("domain-not-allowed"), { code: "domain-not-allowed" });

/** Google sign-in (popup). Non-UGM accounts are signed out and get "domainNotAllowed". */
export function signInWithGoogle(remember = true) {
  return run(async () => {
    const fb = await loadAuth();
    await fb.setPersistence(fb.auth, remember ? fb.browserLocalPersistence : fb.browserSessionPersistence);
    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user } = await fb.signInWithPopup(fb.auth, provider);
    if (!roleForEmail(user.email)) {
      await fb.signOut(fb.auth);
      throw domainError();
    }
  });
}

export function signInWithEmail(email: string, password: string, remember = true) {
  return run(async () => {
    if (!roleForEmail(email)) throw domainError();
    const fb = await loadAuth();
    await fb.setPersistence(fb.auth, remember ? fb.browserLocalPersistence : fb.browserSessionPersistence);
    await fb.signInWithEmailAndPassword(fb.auth, email.trim(), password);
  });
}

/** Profile fields saved at sign-up (Firestore users/{uid}). */
export type StudentProfile = { name: string; nim: string; program: string; year: string };

async function saveProfile(user: User, profile: StudentProfile) {
  const [{ doc, serverTimestamp, setDoc }, { db }] = await Promise.all([import("firebase/firestore"), import("./firestore")]);
  await setDoc(
    doc(db, "users", user.uid),
    { ...profile, email: user.email, role: roleForEmail(user.email), createdAt: serverTimestamp() },
    { merge: true },
  );
}

/**
 * New account with email + password and its profile in Firestore. The verification email is sent in the
 * background: a slow or failed email does not block the sign-up (it can be sent again later).
 */
export function signUpWithEmail(email: string, password: string, profile: StudentProfile) {
  return run(async () => {
    if (roleForEmail(email) !== "student") throw domainError();
    const fb = await loadAuth();
    const { user } = await fb.createUserWithEmailAndPassword(fb.auth, email.trim(), password);
    await fb.updateProfile(user, { displayName: profile.name });
    publish(user); // updateProfile() does not fire onAuthStateChanged
    await saveProfile(user, profile);
    fb.sendEmailVerification(user).catch(() => {});
  });
}

/** Sign-up with Google: the account comes from Google, the NIM / program / cohort from the form. */
export function signUpWithGoogle(profile: StudentProfile) {
  return run(async () => {
    const fb = await loadAuth();
    const provider = new fb.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user } = await fb.signInWithPopup(fb.auth, provider);
    if (roleForEmail(user.email) !== "student") {
      await fb.signOut(fb.auth);
      throw domainError();
    }
    await saveProfile(user, { ...profile, name: profile.name || user.displayName || "" });
  });
}

/** Sends Firebase's password-reset email. UGM addresses only; unknown accounts also return null (no account probing). */
export function sendPasswordReset(email: string) {
  return run(async () => {
    if (!roleForEmail(email)) throw domainError();
    const fb = await loadAuth();
    try {
      await fb.sendPasswordResetEmail(fb.auth, email.trim());
    } catch (e) {
      if ((e as { code?: string }).code !== "auth/user-not-found") throw e;
    }
  });
}

export const signOut = async () => {
  const fb = await loadAuth();
  await fb.signOut(fb.auth);
};

/* ---------------------------- emulator demo ---------------------------- */

/**
 * Demo accounts for judges without a UGM account: on the local emulators, and online when
 * NEXT_PUBLIC_DEMO_LOGIN=true (set in .github/workflows/*.yml). The account is created on the first click.
 * The password is public (it is in the bundle), so a demo account must never get more rights than a student.
 */
export const DEMO_ENABLED = process.env.NEXT_PUBLIC_USE_EMULATORS === "true" || process.env.NEXT_PUBLIC_DEMO_LOGIN === "true";
/** Demo accounts never include "admin". */
export type DemoRole = Exclude<SessionRole, "admin">;
const DEMO_ACCOUNTS: Record<DemoRole, { email: string; name: string }> = {
  student: { email: "demo.mahasiswa@mail.ugm.ac.id", name: "Mahasiswa Demo" },
  staff: { email: "demo.petugas@ugm.ac.id", name: "Petugas Demo" },
};
const DEMO_PASSWORD = "demo1234";

/** Signs in as a demo account, creating it on the emulator the first time. */
export function signInDemo(role: DemoRole) {
  return run(async () => {
    if (!DEMO_ENABLED) throw domainError();
    const { email, name } = DEMO_ACCOUNTS[role];
    const fb = await loadAuth();
    try {
      await fb.signInWithEmailAndPassword(fb.auth, email, DEMO_PASSWORD);
    } catch {
      const { user } = await fb.createUserWithEmailAndPassword(fb.auth, email, DEMO_PASSWORD);
      await fb.updateProfile(user, { displayName: name });
      publish(user);
    }
  });
}
