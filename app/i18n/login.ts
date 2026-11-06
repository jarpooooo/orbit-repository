// app/i18n/login.ts
// Text for the login page. Indonesian is the source; English must keep the same keys.

import type { Locale } from "./locale";

const id = {
  badge: "Selamat datang lagi",
  welcomeTitle: "Masuk dulu, lalu pinjam tanpa bolak-balik ke lab.",
  welcomeBody: "Katalog dan jadwal tetap bisa dilihat tanpa akun. Login hanya diminta saat kamu mengajukan peminjaman.",
  title: "Masuk",
  hint: "Gunakan akun UGM kamu (@mail.ugm.ac.id).",
  google: "Masuk dengan Google UGM",
  divider: "atau pakai email",
  emailLabel: "Email UGM",
  emailPlaceholder: "nama@mail.ugm.ac.id",
  passwordLabel: "Kata sandi",
  passwordPlaceholder: "Kata sandi",
  forgot: "Lupa kata sandi?",
  forgotNeedEmail: "Isi email UGM kamu dulu, lalu klik “Lupa kata sandi?” lagi.",
  forgotSent: (email: string) => `Kalau ${email} terdaftar, link untuk membuat kata sandi baru sudah dikirim. Cek kotak masuk atau spam.`,
  show: "Lihat",
  hide: "Sembunyikan",
  remember: "Ingat saya di perangkat ini",
  submit: "Masuk",
  demoTitle: "Juri / penguji?",
  demoBody: "Masuk instan sebagai mahasiswa demo atau petugas lab.",
  student: "Mahasiswa",
  staff: "Petugas",
  noAccount: "Belum punya akun?",
  register: "Daftar sekarang",
  errorEmail: "Isi email dengan benar.",
  errorPassword: "Isi kata sandi.",
};

const en: typeof id = {
  badge: "Welcome back",
  welcomeTitle: "Sign in first, then borrow without running back to the lab.",
  welcomeBody: "You can browse the catalog and schedule without an account. Sign-in is only needed when you submit a request.",
  title: "Sign in",
  hint: "Use your UGM account (@mail.ugm.ac.id).",
  google: "Sign in with UGM Google",
  divider: "or use email",
  emailLabel: "UGM email",
  emailPlaceholder: "name@mail.ugm.ac.id",
  passwordLabel: "Password",
  passwordPlaceholder: "Password",
  forgot: "Forgot password?",
  forgotNeedEmail: "Enter your UGM email first, then click “Forgot password?” again.",
  forgotSent: (email: string) => `If ${email} has an account, a link to set a new password is on its way. Check your inbox or spam.`,
  show: "Show",
  hide: "Hide",
  remember: "Remember me on this device",
  submit: "Sign in",
  demoTitle: "Judge / examiner?",
  demoBody: "Sign in instantly as a demo student or lab staff.",
  student: "Student",
  staff: "Staff",
  noAccount: "No account yet?",
  register: "Sign up now",
  errorEmail: "Enter a valid email.",
  errorPassword: "Enter your password.",
};

export const LOGIN_TEXT: Record<Locale, typeof id> = { id, en };