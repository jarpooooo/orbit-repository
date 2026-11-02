// app/components/layout/notifikasi.tsx
//
// Lonceng + panel notifikasi (Figma "08 Notifikasi (panel terbuka)", panel node 1:2494).
// Satu file: tombol lonceng (titik oranye kalau ada yang belum dibaca) + panel dropdown.
//  - Klik lonceng = buka/tutup. Tutup juga lewat klik di luar, Escape, atau pindah halaman.
//  - "Tandai dibaca" mengubah semua baris jadi sudah dibaca (baris kuning → putih, titik hilang).
//  - Layar < xl: panel melebar penuh di bawah navbar. Layar xl: 360px di bawah lonceng.
// Data NOTIFIKASI = contoh dari Figma (statis, belum ada penyimpanan).
//
// Cara pasang di Navbar.tsx: ganti seluruh blok {/* Lonceng */} <button ...>...</button> dengan <Notifikasi />,
// lalu hapus prop hasUnread / onNotificationClick dan import `Bell` yang tidak terpakai.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

type Notif = { id: string; judul: string; info: string; href: string; baru: boolean };

// Data contoh (teks persis Figma). Nanti ganti dengan data dari API.
const AWAL: readonly Notif[] = [
  { id: "n1", judul: "Menunggu verifikasi: Kit ESP32", info: "PJM-1026-0014 · baru saja", href: "/pengajuan-saya", baru: true },
  { id: "n2", judul: "Kit ESP32 siap diambil", info: "PJM-1024-0012 · Senin 09.00", href: "/pengajuan-saya", baru: false },
  { id: "n3", judul: "Pengingat pengembalian", info: "Converter HDMI · besok 16.00", href: "/pengajuan-saya", baru: false },
];

export default function Notifikasi() {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [daftar, setDaftar] = useState<readonly Notif[]>(AWAL);
  const wadah = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);

  const belumDibaca = daftar.filter((n) => n.baru).length;

  // tutup saat pindah halaman
  useEffect(() => setOpen(false), [pathname]);

  // klik di luar / Escape menutup panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        tombol.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const tandaiSemua = () => setDaftar((d) => d.map((n) => ({ ...n, baru: false })));
  const tandai = (id: string) => setDaftar((d) => d.map((n) => (n.id === id ? { ...n, baru: false } : n)));

  return (
    <div ref={wadah} className="relative">
      {/* Lonceng */}
      <button
        ref={tombol}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={belumDibaca ? `Notifikasi, ${belumDibaca} belum dibaca` : "Notifikasi"}
        className="relative flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-brand-interactive text-on-interactive transition-colors hover:bg-royal-800"
      >
        <Bell size={20} strokeWidth={2.25} aria-hidden />
        {belumDibaca > 0 && <span aria-hidden className="absolute -right-1 -top-1 size-[10px] rounded-full bg-tangerine-300" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          id={panelId}
          role="region"
          aria-label="Notifikasi"
          className={`fixed inset-x-4 top-[76px] z-50 overflow-hidden rounded-[18px] border-2 border-[#0d2a4b] bg-white shadow-[4px_4px_0_0_#0d2a4b] sm:inset-x-8 sm:top-[92px] xl:absolute xl:inset-x-auto xl:right-0 xl:top-[calc(100%+14px)] xl:w-[360px] xl:shadow-[6px_6px_0_0_#0d2a4b] ${sans}`}
        >
          <div className="flex items-center justify-between gap-3 bg-[#ffd43b] px-4 py-3 text-[#0d2a4b]">
            <h2 className={`${display} text-[22px] font-normal leading-[normal]`}>Notifikasi</h2>
            <button
              type="button"
              onClick={tandaiSemua}
              disabled={belumDibaca === 0}
              className="text-[12px] font-extrabold leading-[normal] hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-50"
            >
              Tandai dibaca
            </button>
          </div>

          <ul className="max-h-[60dvh] overflow-y-auto">
            {daftar.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => tandai(n.id)}
                  className={`flex flex-col gap-[2px] px-4 py-3 leading-[normal] transition-colors hover:bg-[#fff4c2] focus-visible:bg-[#fff4c2] ${n.baru ? "bg-[#fff4c2]" : "bg-white"}`}
                >
                  <span className="text-[14px] font-extrabold text-[#0d2a4b]">
                    {n.baru && <span className="sr-only">Belum dibaca. </span>}
                    {n.judul}
                  </span>
                  <span className="text-[12px] text-[#5b6f87]">{n.info}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}