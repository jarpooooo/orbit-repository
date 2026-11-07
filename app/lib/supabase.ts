// app/lib/supabase.ts
//
// Supabase Storage over plain REST (no SDK, so nothing extra is downloaded).
//   facility-images (public bucket) : facility photos, <folder>/<n>.webp, see app/data/facility-photos.ts
//   letters         (private bucket): signed permission letters (PDF) uploaded with a request,
//                                     <uid>/<request code>.pdf. Insert-only: the browser cannot read them back.
// Setup (buckets + policies): supabase/storage-setup.sql. Config: NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY in .env.local.

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const PHOTO_BUCKET = "facility-images";
export const LETTER_BUCKET = "letters";

/** Bump when photos are replaced in Storage, so browsers do not keep showing the old file. */
const PHOTO_VERSION = 2;

/** Public URL of a file in a public bucket. */
export const publicUrl = (bucket: string, path: string) => `${URL_BASE}/storage/v1/object/public/${bucket}/${path}?v=${PHOTO_VERSION}`;

/** Upload a signed letter. Returns true when stored. */
export async function uploadLetter(file: File, uid: string, code: string): Promise<boolean> {
  if (!URL_BASE || !ANON_KEY || !uid) return false;
  try {
    const res = await fetch(`${URL_BASE}/storage/v1/object/${LETTER_BUCKET}/${encodeURIComponent(uid)}/${encodeURIComponent(code)}.pdf`, {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}`, "Content-Type": "application/pdf", "x-upsert": "false" },
      body: file,
    });
    return res.ok;
  } catch {
    return false;
  }
}
