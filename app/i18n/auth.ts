// app/i18n/auth.ts
// Text shared by the login and register panels (photo collage).

import type { Locale } from "./locale";

const id = {
  photoEsp32: "Kit ESP32",
  photoRoom: "Ruang Sidang",
  sticker: "PJM-1026-0014 · Disetujui",
  photoPlaceholder: "Foto menyusul",
};

const en: typeof id = {
  photoEsp32: "ESP32 Kit",
  photoRoom: "Meeting Room",
  sticker: "PJM-1026-0014 · Approved",
  photoPlaceholder: "Photo coming soon",
};

export const AUTH_TEXT: Record<Locale, typeof id> = { id, en };