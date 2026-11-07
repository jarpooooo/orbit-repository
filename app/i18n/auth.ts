// app/i18n/auth.ts
// Text shared by the login and register panels (photo collage).

import type { Locale } from "./locale";

const id = {
  photoEsp32: "ESP32",
  photoRoom: "Ruang Diskusi",
  photoPlaceholder: "Foto menyusul",
};

const en: typeof id = {
  photoEsp32: "ESP32",
  photoRoom: "Discussion Room",
  photoPlaceholder: "Photo coming soon",
};

export const AUTH_TEXT: Record<Locale, typeof id> = { id, en };