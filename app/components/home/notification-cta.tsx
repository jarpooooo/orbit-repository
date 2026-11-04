// app/components/home/notification-cta.tsx
//
// "Jangan sampai ketinggalan status pengajuan" section (Figma node 1:3282, desktop 1440px).
// Page-colored (sky) card + purple shadow + purple "Aktifkan notifikasi" button.
// No image assets. Text: HOME_TEXT.notificationCta (app/i18n/home.ts).
// Client component because the button requests browser notification permission.

"use client";

import { useState } from "react";
import { HOME_TEXT, type NotificationCtaState } from "@/app/i18n/home";
import { useText } from "@/app/components/layout/language";

type Props = {
  /** Called after the user clicks the button. When omitted, the browser notification permission is requested. */
  onEnable?: () => void | Promise<void>;
};



export default function NotificationCta({ onEnable }: Props) {
  const t = useText(HOME_TEXT).notificationCta;
  const [state, setState] = useState<NotificationCtaState>("idle");

  const enable = async () => {
    if (onEnable) {
      await onEnable();
      setState("on");
      return;
    }
    if (typeof Notification === "undefined") return setState("blocked");
    const result = await Notification.requestPermission();
    setState(result === "granted" ? "on" : "blocked");
  };

  return (
    <section className="bg-surface px-5 pb-14 sm:px-8 sm:pb-16 xl:px-[110px] xl:pb-24">
      <div className="mx-auto flex max-w-[1220px] flex-col gap-6 rounded-[22px] border-2 border-line-strong bg-page px-5 py-8 shadow-[5px_5px_0_0_var(--color-shadow-accent)] sm:rounded-[28px] sm:px-8 sm:py-10 sm:shadow-[8px_8px_0_0_var(--color-shadow-accent)] lg:flex-row lg:items-center lg:justify-between lg:gap-10 xl:px-12 xl:py-11">
        <div className="flex max-w-[620px] flex-col gap-[10px]">
          <h2 className="font-display text-[26px] font-normal leading-[1.05] text-ink sm:text-[30px] xl:text-[34px]">
            {t.title}
          </h2>
          <p className="text-[16px] font-normal leading-[1.6] text-ink-body sm:text-[19px]">
            {t.lead}
          </p>
        </div>

        <button
          type="button"
          onClick={enable}
          disabled={state === "on"}
          aria-live="polite"
          className="inline-flex h-[58px] w-full shrink-0 items-center justify-center rounded-2xl border-2 border-b-[6px] border-line-strong bg-brand-accent px-[26px] text-[17px] font-extrabold leading-[1.2] text-on-brand-accent transition-[filter,transform] hover:brightness-110 active:translate-y-[3px] active:border-b-[3px] disabled:cursor-default disabled:brightness-100 sm:w-auto sm:whitespace-nowrap"
        >
          {t.buttons[state]}
        </button>
      </div>
    </section>
  );
}
