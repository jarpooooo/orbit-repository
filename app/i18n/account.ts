// app/i18n/account.ts
// Account (user) button and menu in the navbar, plus the sign-in / sign-up error messages (lib/auth.ts).

import type { AuthErrorKey, SessionRole } from "@/app/lib/auth";
import type { Locale } from "./locale";

const id = {
  signIn: "Masuk",
  /** account button label when signed in */
  account: (name: string) => `Akun ${name}`,
  signOut: "Keluar",
  roles: { student: "Mahasiswa", staff: "Petugas lab", admin: "Admin" } as Record<SessionRole, string>,
  unverified: "Email belum diverifikasi",
  myRequests: "Pengajuan saya",
  adminPanel: "Panel admin",
  errors: {
    wrongCredentials: "Email atau kata sandi salah.",
    emailInUse: "Email ini sudah terdaftar. Silakan masuk.",
    weakPassword: "Kata sandi terlalu lemah.",
    domainNotAllowed: "Gunakan akun UGM (@mail.ugm.ac.id untuk mahasiswa, @ugm.ac.id untuk petugas).",
    network: "Koneksi bermasalah. Coba lagi.",
    tooManyRequests: "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
    popupBlocked: "Pop-up Google diblokir browser. Izinkan pop-up untuk situs ini.",
    unknown: "Gagal masuk. Coba lagi.",
  } as Record<AuthErrorKey, string>,
};

const en: typeof id = {
  signIn: "Sign in",
  account: (name) => `${name}'s account`,
  signOut: "Sign out",
  roles: { student: "Student", staff: "Lab staff", admin: "Admin" },
  unverified: "Email not verified yet",
  myRequests: "My requests",
  adminPanel: "Admin panel",
  errors: {
    wrongCredentials: "Wrong email or password.",
    emailInUse: "This email is already registered. Please sign in.",
    weakPassword: "The password is too weak.",
    domainNotAllowed: "Use a UGM account (@mail.ugm.ac.id for students, @ugm.ac.id for staff).",
    network: "Connection problem. Try again.",
    tooManyRequests: "Too many attempts. Wait a moment and try again.",
    popupBlocked: "The browser blocked the Google pop-up. Allow pop-ups for this site.",
    unknown: "Could not sign in. Try again.",
  },
};

export const ACCOUNT_TEXT: Record<Locale, typeof id> = { id, en };
