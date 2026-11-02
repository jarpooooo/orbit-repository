// src/lib/design/semantic-colors.ts
//
// Semantic color = PENGELOMPOKAN warna berdasarkan makna, bukan per komponen.
// Tiap grup memetakan satu "makna" ke satu variant warna dari color-variants.ts.
// Token CSS padanannya ada di colors.css (bagian SEMANTIC) dengan nama grup yang sama.

import { COLOR_VARIANTS } from "./color-variants";

export const SEMANTIC_COLORS = {
  /** Identitas dan peran warna utama (Style Guide: "Navy sebagai tinta, empat aksen cerah"). */
  brand: {
    ink: COLOR_VARIANTS.navy, // teks judul, garis, bayangan tombol
    primary: COLOR_VARIANTS.tangerine, // aksi utama
    secondary: COLOR_VARIANTS.sun, // aksi kedua, sorotan, nomor langkah
    tertiary: COLOR_VARIANTS.periwinkle, // aksen ketiga
    accent: COLOR_VARIANTS.grape, // bayangan kartu katalog
    interactive: COLOR_VARIANTS.royal, // aksi pencarian, ikon panah, lonceng
  },

  /** Kondisi ketersediaan dan progres pengajuan. */
  status: {
    available: COLOR_VARIANTS.mint, // Kosong, Tersedia, Disetujui
    pending: COLOR_VARIANTS.sun, // Menunggu verifikasi, Terbatas
    attention: COLOR_VARIANTS.tangerine, // Surat diperiksa, Sisa 1 slot, Hampir habis
    unavailable: COLOR_VARIANTS.slate, // Terisi, Habis, Sedang dipinjam, Tidak tersedia
  },

  /** Tingkat izin fasilitas (dokumen: Umum / Menengah / Mahal; Figma: Langsung / Verifikasi / Perlu surat). */
  level: {
    umum: COLOR_VARIANTS.mint,
    menengah: COLOR_VARIANTS.sun,
    mahal: COLOR_VARIANTS.tangerine,
  },

  /** Kelompok fasilitas. Di Figma semua kategori memakai ungu; ubah per baris bila nanti dibedakan. */
  category: {
    hardware: COLOR_VARIANTS.grape,
    ruang: COLOR_VARIANTS.grape,
    multimedia: COLOR_VARIANTS.grape, // ada di dokumen, belum ada di Figma
    logistik: COLOR_VARIANTS.grape,
  },

  /** Peringkat podium di halaman "Paling sering dipinjam". */
  rank: {
    first: COLOR_VARIANTS.sun,
    second: COLOR_VARIANTS.periwinkle,
    third: COLOR_VARIANTS.tangerine,
  },
} as const;

export type SemanticGroup = keyof typeof SEMANTIC_COLORS;
export type SemanticKey<G extends SemanticGroup> = keyof (typeof SEMANTIC_COLORS)[G];