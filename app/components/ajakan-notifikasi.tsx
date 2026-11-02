// app/components/home/ajakan-notifikasi.tsx
//
// Section "Jangan sampai ketinggalan status pengajuan" (Figma node 1:3282, desktop 1440px).
// Kartu langit + bayangan ungu + tombol ungu "Aktifkan notifikasi".
// Tanpa aset gambar. Client component karena tombol minta izin notifikasi browser.

"use client";

import { useState } from "react";

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";
const sans = "font-[family-name:var(--font-jakarta,'Plus_Jakarta_Sans')]";

type Props = {
  /** Dipanggil setelah pengguna klik tombol. Kalau kosong, minta izin notifikasi browser. */
  onEnable?: () => void | Promise<void>;
};

export default function AjakanNotifikasi({ onEnable }: Props) {
  const [state, setState] = useState<"idle" | "on" | "blocked">("idle");

  const enable = async () => {
    if (onEnable) {
      await onEnable();
      setState("on");
      return;
    }
    if (typeof Notification === "undefined") return setState("blocked");
    const res = await Notification.requestPermission();
    setState(res === "granted" ? "on" : "blocked");
  };

  const label =
    state === "on" ? "Notifikasi aktif" : state === "blocked" ? "Izin ditolak, cek pengaturan browser" : "Aktifkan notifikasi";

  return (
    <section className={`bg-white px-5 pb-14 sm:px-8 sm:pb-16 xl:px-[110px] xl:pb-24 ${sans}`}>
      <div className="mx-auto flex max-w-[1220px] flex-col gap-6 rounded-[22px] border-2 border-[#0d2a4b] bg-[#d7eefb] px-5 py-8 shadow-[5px_5px_0_0_#5b3bb5] sm:rounded-[28px] sm:px-8 sm:py-10 sm:shadow-[8px_8px_0_0_#5b3bb5] lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:px-12 xl:py-11">
        <div className="flex max-w-[620px] flex-col gap-[10px]">
          <h2 className={`${display} text-[26px] font-normal leading-[1.05] text-[#0d2a4b] sm:text-[30px] xl:text-[34px]`}>
            Jangan sampai ketinggalan status pengajuan
          </h2>
          <p className="text-[16px] font-normal leading-[1.6] text-[#2b3f57] sm:text-[19px]">
            Dapat kabar saat pengajuanmu disetujui, perlu surat, atau sudah waktunya mengembalikan barang.
          </p>
        </div>

        <button
          type="button"
          onClick={enable}
          disabled={state === "on"}
          aria-live="polite"
          className="inline-flex h-[58px] w-full shrink-0 items-center justify-center rounded-2xl border-2 border-b-[6px] border-[#0d2a4b] bg-[#5b3bb5] px-[26px] text-[17px] font-extrabold leading-[1.2] text-white transition-[filter,transform] hover:brightness-110 active:translate-y-[3px] active:border-b-[3px] disabled:cursor-default disabled:brightness-100 sm:w-auto sm:whitespace-nowrap"
        >
          {label}
        </button>
      </div>
    </section>
  );
}