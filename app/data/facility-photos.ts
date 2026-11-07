// app/data/facility-photos.ts
//
// Real photos of each facility (detail page). Files live in Supabase Storage, bucket `facility-images`,
// as <folder>/1.webp … <folder>/<count>.webp (uploaded by `npm run photos`, from public/img/fasilitation).
// Facilities without an entry keep the illustration. Rooms with several units share one folder via `group`.

import { publicUrl, PHOTO_BUCKET } from "@/app/lib/supabase";

/** facility id (or room group) → [storage folder, number of photos] */
const PHOTOS: Record<string, readonly [string, number]> = {
  "esp32": ["esp32", 5],
  "arduino-uno": ["arduino-uno", 3],
  "laptop": ["laptop", 5],
  "raspberry-pi": ["rasberry-pi", 5],
  "pc": ["pc", 5],
  "monitor": ["monitor", 4],
  "keyboard": ["keyboard", 5],
  "mouse": ["mouse", 5],
  "nodemcu": ["nodemcu", 5],
  "breadboard": ["breadboard", 2],
  "jumper-cable": ["kabel-jumper", 4],
  "sensor-kit": ["sensor-kit", 4],
  "relay-module": ["relay-modul", 4],
  "servo-motor": ["servo-motor", 4],
  "dc-motor": ["dc-motor", 3],
  "power-supply": ["power-supply", 5],
  "discussion-room": ["ruang-diskusi", 6],
  "computer-lab": ["lab-komputer", 5],
  "classroom": ["ruang-kelas", 5],
  "auditorium": ["auditorium", 5],
  "multimedia-room": ["ruang-multimedia", 5],
  "multipurpose-field": ["lapangan-serbaguna", 5],
  "camera": ["kamera", 5],
  "projector": ["proyektor", 5],
  "microphone": ["mikrofon", 5],
  "speaker": ["speaker", 5],
  "tripod": ["tripod", 5],
  "lighting": ["lighting", 5],
  "sound-system": ["sound-system", 5],
  "tv-display": ["tv-monitor", 5],
  "hdmi-vga-adapter": ["hdmi-vga-adapter", 5],
  "presenter-clicker": ["presenter-clicker", 3],
  "extension-cord": ["stop-kontak", 5],
  "cable-reel": ["kabel-roll", 5],
  "extra-chair": ["kursi-tambahan", 5],
  "whiteboard": ["whiteboard", 5],
  "extra-table": ["meja-tambahan", 5],
};

/** Storage folder + count for every photo set (used by scripts/upload-facility-photos.mjs). */
export const PHOTO_SETS = Object.values(PHOTOS);

/** Photo URLs of a facility (empty when it has none). */
export function facilityPhotos(f: { id: string; group?: string }): string[] {
  const set = PHOTOS[f.group ?? f.id];
  if (!set) return [];
  const [folder, count] = set;
  // rooms of one group share the folder, but each room starts at its own photo ("Ruang Diskusi 2" ≠ "1")
  const unit = f.group ? Number(f.id.slice(f.group.length + 1)) || 1 : 1;
  return Array.from({ length: count }, (_, i) => publicUrl(PHOTO_BUCKET, `${folder}/${((i + unit - 1) % count) + 1}.webp`));
}
