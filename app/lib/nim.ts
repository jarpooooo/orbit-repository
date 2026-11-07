// app/lib/nim.ts: the UGM student number (NIM) format, shared by the register page and the request form.
// firestore.rules checks the same pattern (users/{uid}.nim, requests/{code}.borrower.studentId).

/** e.g. 24/541234/SV/25123 */
export const NIM_PATTERN = /^\d{2}\/\d{6}\/[A-Z]{2}\/\d{5}$/;

/** What a typed NIM is checked and saved as: no spaces, upper case. */
export const normalizeNim = (value: string) => value.replace(/\s/g, "").toUpperCase();
