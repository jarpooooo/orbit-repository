// app/admin/page.tsx
//
// Admin "Data peminjaman" (Figma 5.1, node 149:2677): stat cards (click = filter), search + status chips,
// and the request table with the status actions (Menunggu verifikasi → Setujui / Tolak, Disetujui → Siap diambil).
// Not built yet from the design: sidebar sections, request detail, returns, fines. Only the statuses the app stores exist.
// Rules: firestore.rules (isAdmin). Text: ADMIN_TEXT (app/i18n/admin.ts).

"use client";

import { useState } from "react";
import Breadcrumb from "@/app/components/layout/breadcrumb";
import { useLocale } from "@/app/components/layout/language";
import { modeOf } from "@/app/components/catalog/booking/registry";
import StatusBadge from "@/app/components/ui/status-badge";
import { localizeFacility } from "@/app/i18n/facilities";
import { ADMIN_TEXT } from "@/app/i18n/admin";
import type { RequestStatusKey } from "@/app/i18n/my-requests";
import { useFacilities } from "@/app/lib/facility-store";
import { REQUEST_STATUS_COLORS, setRequestStatus, useAllRequests } from "@/app/lib/requests";

const BUTTON =
  "rounded-[10px] border-2 border-line-strong px-3 py-[5px] text-[13px] font-extrabold leading-[normal] transition-transform active:translate-y-[1px] disabled:opacity-60";
const PANEL = "w-full rounded-[18px] border-2 border-line-strong bg-surface px-5 py-6 shadow-[4px_4px_0_0_var(--color-shadow)]";
const CHIPS: readonly RequestStatusKey[] = ["verifying", "approved", "readyPickup", "rejected", "cancelled"];

type Filter = RequestStatusKey | "all";

export default function AdminPage() {
  const { locale } = useLocale();
  const t = ADMIN_TEXT[locale];
  const state = useAllRequests();
  const facilities = useFacilities();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  async function change(code: string, status: RequestStatusKey, actionLabel: string) {
    if (!window.confirm(t.confirm(actionLabel, code))) return;
    setPending(code);
    setFailed(null);
    try {
      await setRequestStatus(code, status);
    } catch {
      setFailed(code);
    } finally {
      setPending(null);
    }
  }

  const all = state.status === "ready" ? state.requests : [];
  const countOf = (s: RequestStatusKey) => all.filter((r) => r.status === s).length;
  const q = search.trim().toLowerCase();
  const shown = all.filter(
    (r) =>
      (filter === "all" || r.status === filter) &&
      (!q || [r.borrower.name, r.borrower.studentId, r.code].some((v) => v.toLowerCase().includes(q))),
  );

  // stat cards as in Figma: yellow = awaiting, mint = ready, white = total, pink = rejected, navy = cancelled
  const stats: { key: Filter; label: string; n: number; tone: string }[] = [
    { key: "verifying", label: t.statuses.verifying, n: countOf("verifying"), tone: "bg-sun-200 text-on-accent" },
    { key: "readyPickup", label: t.statuses.readyPickup, n: countOf("readyPickup"), tone: "bg-mint-300 text-on-accent" },
    { key: "all", label: t.total, n: all.length, tone: "bg-surface text-ink" },
    { key: "rejected", label: t.statuses.rejected, n: countOf("rejected"), tone: "bg-status-attention-bg text-status-attention-fg" },
    { key: "cancelled", label: t.statuses.cancelled, n: countOf("cancelled"), tone: "bg-surface-inverse text-white" },
  ];

  const th = "px-3 py-2 text-left text-[12px] font-extrabold text-ink-muted";
  const td = "px-3 py-3 align-top";

  return (
    <main className="min-h-screen bg-page px-5 pb-16 pt-[112px] sm:px-8 sm:pb-20 sm:pt-[132px] xl:px-[80px] xl:pb-[90px]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-5">
        <Breadcrumb items={[{ label: t.title }]} />
        <h1 className="font-display text-[40px] font-normal leading-none text-ink sm:text-[48px]">{t.title}</h1>
        <p className="text-[16px] text-ink-body">{t.lead}</p>

        <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-5">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setFilter(s.key)}
              aria-pressed={filter === s.key}
              className={`flex flex-col items-start gap-1 rounded-[16px] border-2 border-line-strong px-4 py-3 text-left shadow-[3px_3px_0_0_var(--color-shadow)] ${s.tone} ${filter === s.key ? "ring-4 ring-focus-halo" : ""}`}
            >
              <span className="font-display text-[34px] leading-none">{s.n}</span>
              <span className="text-[13px] font-extrabold leading-[1.2]">{s.label}</span>
            </button>
          ))}
        </div>

        <section className="flex w-full flex-col gap-4 rounded-[18px] border-2 border-line-strong bg-surface p-4 shadow-[4px_4px_0_0_var(--color-shadow)] sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              aria-label={t.searchLabel}
              className="h-10 min-w-[220px] flex-1 rounded-[10px] border-2 border-line-strong bg-surface-field px-3 text-[14px] text-ink outline-none placeholder:text-ink-placeholder focus:border-brand-interactive sm:max-w-[320px]"
            />
            {(["all", ...CHIPS] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-full border-2 border-line-strong px-3 py-[5px] text-[13px] font-bold ${filter === key ? "bg-brand-primary text-on-primary" : "bg-surface text-ink"}`}
              >
                {key === "all" ? t.all : t.statuses[key]} {key === "all" ? all.length : countOf(key)}
              </button>
            ))}
          </div>

          {state.status === "loading" && <p role="status" className="text-[15px] font-bold text-ink-muted">{t.loading}</p>}
          {state.status === "error" && <p role="alert" className="text-[15px] font-bold text-status-attention-fg">{t.loadFailed}</p>}
          {failed && <p role="alert" className="text-[14px] font-bold text-status-attention-fg">{t.failed(failed)}</p>}
          {state.status === "ready" && shown.length === 0 && <p className="text-[15px] text-ink-body">{t.empty}</p>}

          {shown.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-[13px] text-ink-body">
                <thead>
                  <tr className="border-b-2 border-line bg-surface-row">
                    <th className={th}>{t.columns.borrower}</th>
                    <th className={th}>{t.columns.item}</th>
                    <th className={th}>{t.columns.requirements}</th>
                    <th className={th}>{t.columns.when}</th>
                    <th className={th}>{t.columns.status}</th>
                    <th className={th}>{t.columns.action}</th>
                  </tr>
                </thead>
                <tbody aria-live="polite">
                  {shown.map((r) => {
                    const original = facilities.find((f) => f.id === r.facilityId);
                    if (!original) return null;
                    const f = localizeFacility(original, locale);
                    const busy = pending === r.code;
                    return (
                      <tr key={r.code} className="border-b border-line">
                        <td className={td}>
                          <div className="font-extrabold text-ink">{r.borrower.name}</div>
                          <div className="text-ink-muted">{r.borrower.studentId}</div>
                          <div className="font-bold text-link">{r.code}</div>
                        </td>
                        <td className={td}>
                          <div className="font-extrabold text-ink">{f.name}</div>
                          {r.purpose && <div className="max-w-[200px] text-ink-muted">{r.purpose}</div>}
                        </td>
                        <td className={td}>
                          <div className="flex flex-wrap gap-1">
                            {r.level === "direct" && <span className="text-ink-muted">{t.req.none}</span>}
                            {r.level !== "direct" && <span className="rounded-full border-[1.5px] border-line-strong px-2 py-[1px] text-[12px] font-bold">{t.req.ktm}</span>}
                            {r.level === "letter" && (
                              <span title={r.letterFileName ?? undefined} className="rounded-full border-[1.5px] border-line-strong px-2 py-[1px] text-[12px] font-bold">
                                {t.req.letter}
                              </span>
                            )}
                          </div>
                          {r.letterFileName && <div className="mt-1 max-w-[160px] truncate text-[12px] text-ink-muted">{r.letterFileName}</div>}
                        </td>
                        <td className={td}>{modeOf(r.selection).line(r.selection, f, locale)}</td>
                        <td className={td}>
                          <StatusBadge status={REQUEST_STATUS_COLORS[r.status] ?? "borrowed"} label={t.statuses[r.status] ?? r.status} />
                        </td>
                        <td className={td}>
                          <div className="flex flex-wrap gap-2">
                            {r.status === "verifying" && (
                              <>
                                <button type="button" disabled={busy} onClick={() => void change(r.code, "approved", t.actions.approve)} className={`${BUTTON} bg-mint-300 text-on-accent`}>
                                  {t.actions.approve}
                                </button>
                                <button type="button" disabled={busy} onClick={() => void change(r.code, "rejected", t.actions.reject)} className={`${BUTTON} bg-surface text-ink`}>
                                  {t.actions.reject}
                                </button>
                              </>
                            )}
                            {r.status === "approved" && (
                              <button type="button" disabled={busy} onClick={() => void change(r.code, "readyPickup", t.actions.ready)} className={`${BUTTON} bg-brand-secondary text-on-secondary`}>
                                {t.actions.ready}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {state.status === "ready" && <p className="text-[12px] text-ink-muted">{t.showing(shown.length, all.length)}</p>}
        </section>
      </div>
    </main>
  );
}
