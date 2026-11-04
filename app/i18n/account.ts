// app/i18n/account.ts
// Label for the account (user) icon in the navbar.

import type { Locale } from "./locale";

const id = {
  signIn: "Masuk",
};

const en: typeof id = {
  signIn: "Sign in",
};

export const ACCOUNT_TEXT: Record<Locale, typeof id> = { id, en };