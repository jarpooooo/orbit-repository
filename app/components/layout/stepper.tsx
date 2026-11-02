// app/components/layout/stepper.tsx
//
// Alur 5 langkah (Figma "Alur langkah"): Jelajah → Pilih → Jadwal → Ajukan → Ringkasan.
// Dipakai di 4 halaman: Detail (active=2), Jadwal (3), Pengajuan (4), Ringkasan (5).
// Sudah lewat = titik mint "•", aktif = pil kuning + angka navy, sisanya putih + angka abu.

const display = "font-[family-name:var(--font-lilita,'Lilita_One')]";

const STEPS = ["Jelajah", "Pilih", "Jadwal", "Ajukan", "Ringkasan"] as const;

export default function Stepper({ active }: { active: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <ol aria-label="Langkah peminjaman" className="flex flex-wrap gap-2">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < active;
        const current = n === active;
        return (
          <li
            key={label}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-2 rounded-full border-2 border-[#0d2a4b] py-[5px] pl-2 pr-[14px] ${current ? "bg-[#ffd43b]" : "bg-white"}`}
          >
            <span
              aria-hidden
              className={`${display} flex size-6 items-center justify-center rounded-full text-[13px] leading-none ${
                done
                  ? "border-2 border-[#0d2a4b] bg-[#2ee6b0] text-[#0d2a4b]"
                  : current
                    ? "bg-[#0d2a4b] text-white"
                    : "bg-[#e3e8ee] text-[#0d2a4b]"
              }`}
            >
              {done ? "•" : n}
            </span>
            <span className={`text-[13px] font-extrabold leading-none ${current ? "text-[#0d2a4b]" : "text-[#5b6f87]"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}