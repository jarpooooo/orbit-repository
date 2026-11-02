// app/lib/permission-letter.ts
//
// Fills the Word template (public/templates/permission-letter.docx) with form data and returns it as a .docx.
// Runs entirely in the browser. Requires: docxtemplater, pizzip.
//
// Template tags ({{ }} delimiters, lowercase, no spaces inside the braces). They are Indonesian because they
// live inside the .docx file; rename them in the template and in fillPermissionLetter() together:
//   {{kode}} {{tanggal_surat}} {{nama}} {{nim}} {{prodi}} {{fasilitas}} {{jumlah}}
//   {{tanggal_pinjam}} {{tanggal_kembali}} {{keterangan}} {{penanggung}}

import { formatLongDate, parseIsoDate } from "./date";

const TEMPLATE_URL = "/templates/permission-letter.docx";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Name of the facility supervisor in the "Mengetahui" block. Leave empty to sign by hand. */
const FACILITY_SUPERVISOR = "";

/** sessionStorage key for the form draft handed to the preview page. */
export const LETTER_DRAFT_STORAGE_KEY = "pinjamtedi:surat-draf";

/** What the request form saves before opening the preview. */
export type LetterDraft = {
  slug: string;
  code: string;
  name: string;
  studentId: string;
  studyProgram: string;
  purpose: string;
};

export type LetterData = Omit<LetterDraft, "slug"> & {
  facility: string;
  /** e.g. "1 unit" */
  quantity: string;
  /** yyyy-mm-dd */
  date: string;
  /** e.g. "10.00 – 12.00" */
  session: string;
};

export const letterFileName = (code: string) => `Surat-Izin-${code}`;

/** Fills the template and returns the .docx as a Blob (used by both the preview and the download). */
export async function fillPermissionLetter(data: LetterData): Promise<Blob> {
  const [{ default: PizZip }, { default: Docxtemplater }] = await Promise.all([import("pizzip"), import("docxtemplater")]);

  const res = await fetch(TEMPLATE_URL);
  if (!res.ok) throw new Error(`Template surat tidak ditemukan di ${TEMPLATE_URL}`);

  const doc = new Docxtemplater(new PizZip(await res.arrayBuffer()), {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => "",
  });

  const borrowDate = formatLongDate(parseIsoDate(data.date) ?? new Date());
  const [start, end] = data.session.split("–").map((s) => s.trim());
  doc.render({
    kode: data.code,
    tanggal_surat: formatLongDate(new Date(), false),
    nama: data.name,
    nim: data.studentId,
    prodi: data.studyProgram,
    fasilitas: data.facility,
    jumlah: data.quantity,
    tanggal_pinjam: `${borrowDate}, pukul ${start ?? data.session} WIB`,
    tanggal_kembali: `${borrowDate}, pukul ${end ?? data.session} WIB`,
    keterangan: data.purpose,
    penanggung: FACILITY_SUPERVISOR,
  });

  return doc.getZip().generate({ type: "blob", mimeType: DOCX_MIME });
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
