// scripts/upload-facility-photos.mjs  (npm run photos)
//
// Uploads public/img/fasilitation/kategori_peminjaman/<folder>/* to Supabase Storage, bucket `facility-images`,
// as <folder>/1.webp, 2.webp, … (files sorted by name; the list in app/data/facility-photos.ts must match).
// Needs the bucket from supabase/storage-setup.sql. Key: SUPABASE_SERVICE_ROLE_KEY (Project Settings → API;
// keep it out of git) or, if the bucket allows anon uploads, the publishable key from .env.local.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error("Run with: node --env-file=.env.local scripts/upload-facility-photos.mjs");

// Stock photos that do not show the item (1-based position in the sorted folder). Counts in
// app/data/facility-photos.ts are after this filter.
const EXCLUDE = {
  "arduino-uno": [1, 5], // 1 is an ESP32, 5 a power module
  "breadboard": [3, 4, 5], // modules / soldering mat, no breadboard
  "dc-motor": [4, 5], // capacitors, servo
  "kabel-jumper": [5], // PSU cables
  "monitor": [4], // laptop screen
  "relay-modul": [3], // duplicate of 2
  "sensor-kit": [1], // same photo as esp32/1
  "servo-motor": [5], // no servo
};

const root = path.join("public", "img", "fasilitation", "kategori_peminjaman");
let ok = 0;
let failed = 0;
for (const folder of (await readdir(root, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)) {
  const all = (await readdir(path.join(root, folder))).sort();
  const files = all.filter((_, i) => !(EXCLUDE[folder] ?? []).includes(i + 1));
  // remove files left from an earlier, longer upload
  const stale = all.map((_, i) => `${folder}/${i + 1}.webp`).slice(files.length);
  if (stale.length) {
    await fetch(`${url}/storage/v1/object/facility-images`, {
      method: "DELETE",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: stale }),
    });
  }
  for (const [i, file] of files.entries()) {
    const body = await readFile(path.join(root, folder, file));
    const res = await fetch(`${url}/storage/v1/object/facility-images/${folder}/${i + 1}.webp`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "image/webp", "x-upsert": "true", "cache-control": "max-age=31536000" },
      body,
    });
    if (res.ok) ok++;
    else {
      failed++;
      console.error(`${folder}/${file}: ${res.status} ${await res.text()}`);
    }
  }
}
console.log(`Uploaded ${ok}, failed ${failed}.`);
process.exitCode = failed ? 1 : 0;
