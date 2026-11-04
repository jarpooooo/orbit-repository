// app/i18n/facilities.ts
//
// Facility text per language: names and descriptions (keyed by facility id), plus the labels the
// catalog and request flow build around them (statuses, permission notes, locations, specs).
// app/data/facilities.ts holds no display text; localizeFacility() joins the two.
// Adding a facility: add `id` to both `copy` maps below (the English map is typed from the Indonesian one).
// Rooms with several units (computer-lab-1, …) take their name from `roomGroups` + the room number.

import {
  bookingMode,
  countInGroup,
  facilityLocation,
  facilityStatus,
  facilityUnit,
  maxQuantity,
  type AvailabilityStatus,
  type Facility,
  type FacilityCategory,
  type FacilityUnit,
  type LocationKey,
  type PermissionLevel,
  type RoomGroup,
  type SubcategoryKey,
} from "@/app/data/facilities";
import { dateNames, parseIsoDate } from "@/app/lib/date";
import type { Dictionary, Locale } from "./locale";

type Copy = { name: string; description: string };

const id = {
  statuses: { verification: "Verifikasi", letter: "Perlu surat", borrowed: "Sedang dipinjam", direct: "Langsung" } as Record<AvailabilityStatus, string>,
  /** "Catatan izin" box on the Detail page (text exactly as in Figma). */
  permissionNotes: {
    verification: { title: "Verifikasi.", text: "Perlu dicek petugas laboratorium, biasanya kurang dari 1 jam kerja." },
    letter: { title: "Perlu surat.", text: "Wajib melampirkan surat izin bertanda tangan dosen pembimbing." },
    direct: { title: "Langsung.", text: "Langsung disetujui sistem. Tinggal ambil di loket." },
  } as Record<PermissionLevel, { title: string; text: string }>,
  subcategories: {
    mikrokontroler: "Mikro-kontroler",
    "perangkat-jaringan": "Perangkat jaringan",
    "alat-ukur": "Alat ukur",
    "ruang-diskusi": "Ruang diskusi",
    "kursi-pc-lab": "Kursi PC lab",
    "kamera-acara": "Kamera dan acara",
  } as Record<SubcategoryKey, string>,
  /** "3 unit" / "10 orang" */
  quantity: (n: number, unit: FacilityUnit) => `${n} ${unit === "person" ? "orang" : "unit"}`,
  locations: {
    "microcontroller-lab": "Lab Mikrokontroler, Lt. 2",
    "computer-lab": "Lab Komputer, Lt. 2",
    "logistics-counter": "Loket Logistik, Lt. 1",
    "tedi-1": "Gedung TEDI, Lt. 1",
    "tedi-2": "Gedung TEDI, Lt. 2",
    "tedi-3": "Gedung TEDI, Lt. 3",
    "multimedia-studio": "Studio Multimedia, Lt. 1",
    auditorium: "Auditorium, Lt. 1",
    field: "Lapangan Gedung TEDI",
  } as Record<LocationKey, string>,
  /** [dummy] loan length per category */
  maxDuration: { hardware: "3 hari", room: "2 jam per sesi", multimedia: "2 hari", logistics: "1 hari" } as Record<FacilityCategory, string>,
  specLabels: { location: "Lokasi", stock: "Stok", capacity: "Kapasitas", rooms: "Jumlah ruangan", maxDuration: "Durasi maks.", deposit: "Jaminan" },
  deposit: { none: "Tanpa jaminan", studentId: "KTM ditahan" },
  available: (quantity: string) => `${quantity} tersedia`,
  capacity: (quantity: string) => `Kapasitas ${quantity}`,
  rooms: (n: number) => `${n} ruangan`,
  /** "3 ruangan sejenis" on the cards of multi-unit rooms */
  roomsOfType: (n: number) => `${n} ruangan sejenis`,
  returnsOn: (date: string) => `Kembali ${date}`,
  inUseUntil: (date: string) => `Dipakai sampai ${date}`,
  roomGroups: {
    "computer-lab": { name: "Lab Komputer", description: "Ruangan untuk praktikum komputer, pemrograman, dan kegiatan teknis." },
    classroom: { name: "Ruang Kelas", description: "Ruangan untuk pembelajaran, pelatihan, atau kegiatan akademik." },
    "discussion-room": { name: "Ruang Diskusi", description: "Ruangan untuk diskusi kelompok, pengerjaan tugas, dan kolaborasi mahasiswa." },
  } as Record<RoomGroup, Copy>,
  copy: {
    laptop: { name: "Laptop", description: "Untuk nugas, lomba, atau kegiatan akademik" },
    pc: { name: "PC", description: "Komputer untuk praktikum, pengembangan perangkat lunak, dan pengolahan data." },
    monitor: { name: "Monitor", description: "Layar tambahan untuk menunjang pekerjaan komputer" },
    keyboard: { name: "Keyboard", description: "Perangkat input untuk komputer atau PC" },
    mouse: { name: "Mouse", description: "Perangkat input untuk mengoperasikan komputer" },
    esp32: { name: "ESP32", description: "Mikrokontroler dengan Wi-Fi dan Bluetooth untuk proyek IoT." },
    "arduino-uno": { name: "Arduino Uno", description: "Papan mikrokontroler untuk praktikum elektronika dan pemrograman perangkat keras." },
    "raspberry-pi": { name: "Raspberry Pi", description: "Komputer mini untuk proyek IoT, server kecil, dan embedded system." },
    nodemcu: { name: "NodeMCU", description: "Papan pengembangan berbasis ESP8266 untuk proyek IoT dengan konektivitas Wi-Fi." },
    breadboard: { name: "Breadboard", description: "Media perakitan rangkaian elektronik tanpa perlu penyolderan." },
    "jumper-cable": { name: "Kabel Jumper", description: "Kabel penghubung antar-komponen elektronik pada rangkaian." },
    "sensor-kit": { name: "Sensor Kit", description: "Kumpulan sensor untuk membaca data lingkungan, seperti suhu, cahaya, jarak, dan kelembapan." },
    "relay-module": { name: "Relay Module", description: "Modul untuk mengendalikan perangkat listrik melalui sinyal mikrokontroler." },
    "servo-motor": { name: "Servo Motor", description: "Motor dengan pengaturan posisi sudut untuk proyek robotika dan otomasi." },
    "dc-motor": { name: "DC Motor", description: "Motor listrik untuk menggerakkan roda atau mekanisme pada proyek robotika." },
    "power-supply": { name: "Power Supply", description: "Perangkat penyedia tegangan dan arus listrik untuk rangkaian elektronik." },
    "multimedia-room": { name: "Ruang Multimedia", description: "Ruangan untuk produksi konten, fotografi, videografi, dan kegiatan kreatif." },
    auditorium: { name: "Auditorium", description: "Ruangan untuk seminar, kuliah umum, sosialisasi, dan acara dengan banyak peserta." },
    "multipurpose-field": { name: "Lapangan Serbaguna", description: "Area terbuka untuk kegiatan mahasiswa, acara, dan aktivitas bersama." },
    camera: { name: "Kamera", description: "Untuk dokumentasi foto dan video kegiatan." },
    tripod: { name: "Tripod", description: "Penyangga kamera agar pengambilan gambar lebih stabil." },
    lighting: { name: "Lighting", description: "Peralatan pencahayaan untuk produksi foto, video, atau acara." },
    speaker: { name: "Speaker", description: "Perangkat pengeras suara untuk presentasi dan kegiatan." },
    microphone: { name: "Mikrofon", description: "Perangkat untuk menangkap suara pembicara atau pengisi acara." },
    "sound-system": { name: "Sound System", description: "Paket perangkat audio untuk mendukung suara dalam acara atau seminar." },
    projector: { name: "Proyektor", description: "Untuk menampilkan materi presentasi atau visual ke layar yang lebih besar." },
    "tv-display": { name: "TV Display", description: "Layar untuk menampilkan informasi, presentasi, atau konten visual." },
    "hdmi-vga-adapter": { name: "HDMI/VGA Adapter", description: "Adaptor untuk menghubungkan laptop atau perangkat lain ke proyektor dan display." },
    "presenter-clicker": { name: "Presenter Clicker", description: "Pengendali jarak jauh untuk mengganti slide presentasi." },
    whiteboard: { name: "Whiteboard", description: "Papan tulis untuk diskusi, brainstorming, dan penyampaian materi." },
    "extension-cord": { name: "Stop Kontak / Extension Cord", description: "Perpanjangan akses listrik untuk menghubungkan beberapa perangkat." },
    "cable-reel": { name: "Kabel Roll", description: "Kabel listrik gulung untuk menyediakan sumber daya di lokasi yang jauh dari stop kontak." },
    "extra-chair": { name: "Kursi Tambahan", description: "Kursi tambahan untuk memenuhi kebutuhan peserta kegiatan." },
    "extra-table": { name: "Meja Tambahan", description: "Meja tambahan untuk registrasi, perlengkapan acara, atau kebutuhan kegiatan lainnya." },
  },
};

const en: typeof id = {
  statuses: { verification: "Verification", letter: "Letter required", borrowed: "On loan", direct: "Direct" },
  permissionNotes: {
    verification: { title: "Verification.", text: "Checked by the lab staff, usually within 1 working hour." },
    letter: { title: "Letter required.", text: "A permission letter signed by your supervisor is required." },
    direct: { title: "Direct.", text: "Approved by the system right away. Just pick it up at the counter." },
  },
  subcategories: {
    mikrokontroler: "Micro-controllers",
    "perangkat-jaringan": "Network devices",
    "alat-ukur": "Measuring tools",
    "ruang-diskusi": "Discussion rooms",
    "kursi-pc-lab": "PC lab seats",
    "kamera-acara": "Cameras and events",
  },
  quantity: (n, unit) => (unit === "person" ? `${n} ${n === 1 ? "person" : "people"}` : `${n} ${n === 1 ? "unit" : "units"}`),
  locations: {
    "microcontroller-lab": "Microcontroller Lab, 2nd floor",
    "computer-lab": "Computer Lab, 2nd floor",
    "logistics-counter": "Logistics Counter, 1st floor",
    "tedi-1": "TEDI Building, 1st floor",
    "tedi-2": "TEDI Building, 2nd floor",
    "tedi-3": "TEDI Building, 3rd floor",
    "multimedia-studio": "Multimedia Studio, 1st floor",
    auditorium: "Auditorium, 1st floor",
    field: "TEDI Building field",
  },
  maxDuration: { hardware: "3 days", room: "2 hours per session", multimedia: "2 days", logistics: "1 day" },
  specLabels: { location: "Location", stock: "Stock", capacity: "Capacity", rooms: "Rooms", maxDuration: "Max. duration", deposit: "Deposit" },
  deposit: { none: "No deposit", studentId: "Student ID held" },
  available: (quantity) => `${quantity} available`,
  capacity: (quantity) => `Seats ${quantity}`,
  rooms: (n) => `${n} ${n === 1 ? "room" : "rooms"}`,
  roomsOfType: (n) => `${n} rooms of this type`,
  returnsOn: (date) => `Back ${date}`,
  inUseUntil: (date) => `In use until ${date}`,
  roomGroups: {
    "computer-lab": { name: "Computer Lab", description: "A room for computer lab work, programming, and technical activities." },
    classroom: { name: "Classroom", description: "A room for lectures, training, and other academic activities." },
    "discussion-room": { name: "Discussion Room", description: "A room for group discussions, assignments, and student collaboration." },
  },
  copy: {
    laptop: { name: "Laptop", description: "For assignments, competitions, or academic activities." },
    pc: { name: "PC", description: "A computer for lab work, software development, and data processing." },
    monitor: { name: "Monitor", description: "An extra screen to support your computer work." },
    keyboard: { name: "Keyboard", description: "An input device for a computer or PC." },
    mouse: { name: "Mouse", description: "An input device for operating a computer." },
    esp32: { name: "ESP32", description: "A microcontroller with Wi-Fi and Bluetooth for IoT projects." },
    "arduino-uno": { name: "Arduino Uno", description: "A microcontroller board for electronics labs and hardware programming." },
    "raspberry-pi": { name: "Raspberry Pi", description: "A mini computer for IoT projects, small servers, and embedded systems." },
    nodemcu: { name: "NodeMCU", description: "An ESP8266-based development board for IoT projects with Wi-Fi connectivity." },
    breadboard: { name: "Breadboard", description: "A board for building electronic circuits without soldering." },
    "jumper-cable": { name: "Jumper Wires", description: "Wires that connect electronic components in a circuit." },
    "sensor-kit": { name: "Sensor Kit", description: "A set of sensors for reading the environment, such as temperature, light, distance, and humidity." },
    "relay-module": { name: "Relay Module", description: "A module for switching electrical devices from a microcontroller signal." },
    "servo-motor": { name: "Servo Motor", description: "A motor with angle control for robotics and automation projects." },
    "dc-motor": { name: "DC Motor", description: "An electric motor for driving wheels or mechanisms in robotics projects." },
    "power-supply": { name: "Power Supply", description: "A device that provides voltage and current for electronic circuits." },
    "multimedia-room": { name: "Multimedia Room", description: "A room for content production, photography, videography, and creative work." },
    auditorium: { name: "Auditorium", description: "A hall for seminars, public lectures, briefings, and events with many guests." },
    "multipurpose-field": { name: "Multipurpose Field", description: "An open area for student activities, events, and gatherings." },
    camera: { name: "Camera", description: "For photo and video coverage of activities." },
    tripod: { name: "Tripod", description: "A camera stand for steadier shots." },
    lighting: { name: "Lighting", description: "Lighting gear for photo shoots, videos, or events." },
    speaker: { name: "Speaker", description: "A loudspeaker for presentations and activities." },
    microphone: { name: "Microphone", description: "Picks up the voice of speakers or performers." },
    "sound-system": { name: "Sound System", description: "A complete audio set for events and seminars." },
    projector: { name: "Projector", description: "Shows presentations or visuals on a bigger screen." },
    "tv-display": { name: "TV Display", description: "A screen for showing information, presentations, or visual content." },
    "hdmi-vga-adapter": { name: "HDMI/VGA Adapter", description: "Connects a laptop or other device to a projector or display." },
    "presenter-clicker": { name: "Presenter Clicker", description: "A remote for changing presentation slides." },
    whiteboard: { name: "Whiteboard", description: "A board for discussions, brainstorming, and teaching." },
    "extension-cord": { name: "Extension Cord", description: "Extends a power outlet so you can plug in several devices." },
    "cable-reel": { name: "Cable Reel", description: "A reel of power cable for places far from an outlet." },
    "extra-chair": { name: "Extra Chairs", description: "Additional chairs for event participants." },
    "extra-table": { name: "Extra Tables", description: "Additional tables for registration, event equipment, or other needs." },
  },
};

export const FACILITY_TEXT: Dictionary<typeof id> = { id, en };

/** A facility with every display text resolved in one language. Components render this. */
export type FacilityView = Omit<Facility, "location"> & {
  name: string;
  description: string;
  /** location label */
  location: string;
  status: AvailabilityStatus;
  unit: FacilityUnit;
  maxQuantity: number;
  /** text next to the badge on the Detail page: "1 unit tersedia", "Kapasitas 30 orang", "Kembali Sen 16 Nov" */
  availability: string;
  /** small text on the catalog card */
  meta: string;
  /** spec table rows on the Detail page */
  specs: readonly (readonly [label: string, value: string])[];
};

/** Name + description: the copy entry, or for a multi-unit room "<group name> <n>". */
function facilityCopy(f: Facility, t: typeof id): Copy {
  if (f.group) {
    const room = t.roomGroups[f.group];
    return { name: `${room.name} ${f.id.slice(f.group.length + 1)}`, description: room.description };
  }
  return (t.copy as Record<string, Copy>)[f.id] ?? { name: f.id, description: "" };
}

/** "Sen 16 Nov" / "Mon 16 Nov" */
function shortDay(iso: string, locale: Locale) {
  const d = parseIsoDate(iso);
  if (!d) return iso;
  const n = dateNames(locale);
  return `${n.daysShort[d.getDay()]} ${d.getDate()} ${n.monthsShort[d.getMonth()]}`;
}

/** The facility with its display text in the given language. */
export function localizeFacility(f: Facility, locale: Locale): FacilityView {
  const t = FACILITY_TEXT[locale];
  const unit = facilityUnit(f);
  const max = maxQuantity(f);
  const status = facilityStatus(f);
  const isRoom = bookingMode(f) === "session";
  const quantity = t.quantity(max, unit);
  const location = t.locations[facilityLocation(f)];

  const availability = f.borrowedUntil
    ? (isRoom ? t.inUseUntil : t.returnsOn)(shortDay(f.borrowedUntil, locale))
    : isRoom
      ? t.capacity(quantity)
      : t.available(quantity);
  const roomCount = f.group ? countInGroup(f.group) : 0;
  const meta = f.borrowedUntil ? availability : roomCount > 1 ? `${quantity} · ${t.roomsOfType(roomCount)}` : quantity;

  const l = t.specLabels;
  const specs: (readonly [string, string])[] = [[l.location, location]];
  if (isRoom) {
    specs.push([l.capacity, quantity]);
    if (roomCount > 1) specs.push([l.rooms, t.rooms(roomCount)]);
  } else {
    specs.push([l.stock, t.quantity(f.units, unit)]);
  }
  specs.push([l.maxDuration, t.maxDuration[f.category]]);
  if (!isRoom) specs.push([l.deposit, f.level === "direct" ? t.deposit.none : t.deposit.studentId]);

  return { ...f, ...facilityCopy(f, t), location, status, unit, maxQuantity: max, availability, meta, specs };
}
