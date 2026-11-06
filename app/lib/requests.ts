// app/lib/requests.ts
//
// Borrowing requests in Firestore: collection `requests`, document id = request code (PJM-MMDD-NNNN).
// Written by the request form (submitRequest), listed on "Pengajuan saya" (useMyRequests), cancelled there
// (cancelRequest), and read back on the Summary (useRequest). firestore.rules checks every write:
// owner = the signed-in user, initial status from the facility's level, only "cancelled" as a later change.
//
// Document:
//   uid, email, facilityId, level, mode, selection {…the BookingSelection without `mode`…},
//   startDate (first day, yyyy-mm-dd), borrower {name, studentId, studyProgram}, purpose ("" for "direct"),
//   letterFileName ("letter" level only), studentIdDeposit (true unless "direct"),
//   status, createdAt (server time), updatedAt, cancelledAt?

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firestore";
import { useSession } from "./auth";
import { generateRequestCode, selectionStart, type BookingSelection } from "./booking";
import { toIsoDate } from "./date";
import type { AvailabilityStatus, Facility, PermissionLevel } from "@/app/data/facilities";
import type { RequestStatusKey } from "@/app/i18n/my-requests";

/** Status a new request starts with (project document, "Level"): "Siap diambil" or "Menunggu verifikasi". */
export const INITIAL_STATUS: Record<PermissionLevel, RequestStatusKey> = {
  direct: "readyPickup",
  verification: "verifying",
  letter: "verifying",
};

/** Badge color per request status (STATUS_STYLES: verification=yellow, direct=green, borrowed=gray). */
export const REQUEST_STATUS_COLORS: Record<RequestStatusKey, AvailabilityStatus> = {
  readyPickup: "direct",
  verifying: "verification",
  approved: "direct",
  cancelled: "borrowed",
};

/** Statuses the borrower can still cancel (before the loan starts). */
const OPEN_STATUSES: readonly RequestStatusKey[] = ["readyPickup", "verifying"];

export type Borrower = { name: string; studentId: string; studyProgram: string };

export type StoredRequest = {
  code: string;
  facilityId: string;
  level: PermissionLevel;
  selection: BookingSelection;
  startDate: string;
  borrower: Borrower;
  purpose: string;
  status: RequestStatusKey;
  /** null right after writing, until the server time arrives */
  createdAt: Date | null;
};

export const isCancellable = (r: StoredRequest, today = toIsoDate(new Date())) => OPEN_STATUSES.includes(r.status) && r.startDate >= today;

function selectionFields(s: BookingSelection) {
  return s.mode === "daily"
    ? { pickupDate: s.pickupDate, returnDate: s.returnDate, units: s.units }
    : { date: s.date, sessionId: s.sessionId, participants: s.participants };
}

function fromDocument(code: string, d: Record<string, unknown>): StoredRequest | null {
  const sel = d.selection as Record<string, unknown> | undefined;
  if (!sel || typeof d.facilityId !== "string") return null;
  const selection: BookingSelection =
    d.mode === "session"
      ? { mode: "session", date: String(sel.date), sessionId: Number(sel.sessionId), participants: Number(sel.participants) }
      : { mode: "daily", pickupDate: String(sel.pickupDate), returnDate: String(sel.returnDate), units: Number(sel.units) };
  const b = (d.borrower ?? {}) as Record<string, unknown>;
  return {
    code,
    facilityId: d.facilityId,
    level: d.level as PermissionLevel,
    selection,
    startDate: String(d.startDate ?? selectionStart(selection)),
    borrower: { name: String(b.name ?? ""), studentId: String(b.studentId ?? ""), studyProgram: String(b.studyProgram ?? "") },
    purpose: String(d.purpose ?? ""),
    status: d.status as RequestStatusKey,
    createdAt: (d.createdAt as Timestamp | null)?.toDate() ?? null,
  };
}

/* ---------------------------------- write ---------------------------------- */

export type NewRequest = {
  facility: Facility;
  selection: BookingSelection;
  /** code shown on the letter; replaced when it is already taken */
  code: string;
  borrower: Borrower;
  purpose: string;
  letterFileName: string | null;
  /** the level asks to leave the student ID with the manager, and the borrower agreed */
  studentIdDeposit: boolean;
};

export type SubmitResult = { ok: true; code: string } | { ok: false; error: "signedOut" | "failed" };

/**
 * Saves the request with its initial status. The rules refuse to overwrite an existing document,
 * so a taken code (rare: 9000 per day) is retried with a new one.
 */
export async function submitRequest(input: NewRequest, uid: string, email: string): Promise<SubmitResult> {
  if (!uid) return { ok: false, error: "signedOut" };
  const { facility, selection } = input;
  let code = input.code;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await setDoc(doc(db, "requests", code), {
        uid,
        email,
        facilityId: facility.id,
        level: facility.level,
        mode: selection.mode,
        selection: selectionFields(selection),
        startDate: selectionStart(selection),
        borrower: input.borrower,
        purpose: input.purpose,
        letterFileName: input.letterFileName,
        studentIdDeposit: input.studentIdDeposit,
        status: INITIAL_STATUS[facility.level],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { ok: true, code };
    } catch (error) {
      console.warn("[requests] save failed:", (error as { code?: string }).code ?? error);
      code = generateRequestCode();
    }
  }
  return { ok: false, error: "failed" };
}

export async function cancelRequest(code: string) {
  await updateDoc(doc(db, "requests", code), { status: "cancelled", cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

/** Saved profile of the signed-in student (register page), to prefill the request form. */
export async function loadProfile(uid: string): Promise<Partial<Borrower>> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const d = snap.data();
    return d ? { name: d.name, studentId: typeof d.nim === "string" ? d.nim.replace(/\D/g, "") : undefined, studyProgram: d.program } : {};
  } catch {
    return {};
  }
}

/* ---------------------------------- read ---------------------------------- */

export type MyRequestsState = { status: "loading" } | { status: "error" } | { status: "ready"; requests: StoredRequest[] };

/** The signed-in user's requests, newest first, live. */
export function useMyRequests(): MyRequestsState {
  const uid = useSession()?.uid ?? null;
  const [state, setState] = useState<{ uid: string | null; value: MyRequestsState }>({ uid: null, value: { status: "loading" } });

  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      query(collection(db, "requests"), where("uid", "==", uid)),
      (result) => {
        const requests = result.docs.flatMap((d) => fromDocument(d.id, d.data()) ?? []);
        // newest first; a request still waiting for its server time is the newest
        requests.sort((a, b) => (b.createdAt?.getTime() ?? Infinity) - (a.createdAt?.getTime() ?? Infinity));
        setState({ uid, value: { status: "ready", requests } });
      },
      (error) => {
        console.warn("[requests] list failed:", error.code);
        setState({ uid, value: { status: "error" } });
      },
    );
  }, [uid]);

  return state.uid === uid ? state.value : { status: "loading" };
}

/** One request by code (Summary page), live. null = not found / not yours. */
export function useRequest(code: string | undefined): StoredRequest | null | undefined {
  const uid = useSession()?.uid ?? null;
  const [state, setState] = useState<{ key: string; value: StoredRequest | null } | null>(null);
  const key = `${uid}:${code}`;

  useEffect(() => {
    if (!uid || !code) return;
    return onSnapshot(
      doc(db, "requests", code),
      (snap) => setState({ key, value: snap.exists() ? fromDocument(snap.id, snap.data()) : null }),
      () => setState({ key, value: null }),
    );
  }, [uid, code, key]);

  if (!uid || !code) return null;
  return state?.key === key ? state.value : undefined;
}
