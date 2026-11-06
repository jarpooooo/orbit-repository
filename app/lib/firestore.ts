// app/lib/firestore.ts
//
// The Firestore instance (+ the Firestore emulator when NEXT_PUBLIC_USE_EMULATORS=true).
// Only modules that read or write data import it (requests.ts; facility-store.ts and auth.ts load it lazily),
// so pages without data never download firebase/firestore.

import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { USE_EMULATORS, app, emulatorFlags } from "./firebase";

export const db = getFirestore(app);

if (USE_EMULATORS && !emulatorFlags.__pinjamtediDbEmulator) {
  emulatorFlags.__pinjamtediDbEmulator = true;
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
