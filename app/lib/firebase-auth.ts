// app/lib/firebase-auth.ts
//
// The Firebase Auth instance (+ the Auth emulator when NEXT_PUBLIC_USE_EMULATORS=true).
// Import it lazily (`await import("./firebase-auth")`) so firebase/auth stays out of the first page load;
// app/lib/auth.ts does this for the whole app.

import { connectAuthEmulator, getAuth } from "firebase/auth";
import { USE_EMULATORS, app, emulatorFlags } from "./firebase";

export const auth = getAuth(app);

if (USE_EMULATORS && !emulatorFlags.__pinjamtediAuthEmulator) {
  emulatorFlags.__pinjamtediAuthEmulator = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
}
