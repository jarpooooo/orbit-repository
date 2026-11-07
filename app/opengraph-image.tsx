// app/opengraph-image.tsx → /opengraph-image (og:image + twitter:image for every page)
//
// The link preview on WhatsApp, LinkedIn, X, Discord, and search results. Prerendered at build time
// (the SVG reads and the font fetch are cached in "use cache" helpers, so there is no request-time data).
// Brand look: sky page, navy ink, hard navy shadow, three catalog illustrations.
// Colors are the PALETTE values from app/design/colors.css (this runs outside the CSS, so tokens are not available).

/* eslint-disable @next/next/no-img-element -- next/og renders plain <img>; next/image does not work in ImageResponse */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/app/data/site";

export const alt = `${SITE.name}: peminjaman alat dan ruang DTEDI Sekolah Vokasi UGM`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0d2a4b"; // --color-navy-900
const SKY = "#d7eefb"; // --color-sky
const SUN = "#ffd43b"; // --color-sun-200 (brand-secondary)
const ORANGE = "#f2862e"; // --color-tangerine-400 (brand-primary)
const PERIWINKLE = "#6c98ff"; // --color-periwinkle-400
const MINT = "#2ee6b0"; // --color-mint-300

const svg = async (path: string) =>
  `data:image/svg+xml;base64,${(await readFile(join(process.cwd(), "public", path))).toString("base64")}`;

/** The drawings as data URLs. Cached so the image is prerendered at build time (file reads count as uncached data). */
async function loadArt() {
  "use cache";
  return Promise.all([
    svg("img/logo.svg"),
    svg("img/illustrations/catalog/chip.svg"),
    svg("img/illustrations/catalog/kamera.svg"),
    svg("img/illustrations/catalog/ruang-diskusi.svg"),
  ]);
}

/**
 * Lilita One (the site display font, app/design/fonts.ts) as a TTF for ImageResponse, fetched from Google Fonts
 * at build time (next/font downloads fonts during the build too). null → ImageResponse uses its default font.
 */
async function loadDisplayFont(): Promise<ArrayBuffer | null> {
  "use cache";
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Lilita+One")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage() {
  const [[logo, chip, camera, room], display] = await Promise.all([loadArt(), loadDisplayFont()]);
  const headline = display ? { fontFamily: "Lilita One", fontWeight: 400 } : { fontWeight: 800 };
  const tile = (src: string, bg: string) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 170,
        height: 170,
        borderRadius: 28,
        border: `4px solid ${NAVY}`,
        background: bg,
        boxShadow: `8px 8px 0 0 ${NAVY}`,
      }}
    >
      <img src={src} width={120} height={120} alt="" />
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: SKY, padding: 72, color: NAVY }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <img src={logo} width={84} height={84} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 46, ...headline }}>{SITE.name}</span>
              <span style={{ fontSize: 24, fontWeight: 600 }}>DTEDI Sekolah Vokasi UGM</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 600 }}>
            <span style={{ fontSize: 72, lineHeight: 1.05, ...headline }}>Pinjam alat dan ruang, tanpa antre.</span>
            <span style={{ fontSize: 28, lineHeight: 1.35 }}>Cek stok, pilih jadwal, ajukan, lalu ambil di loket.</span>
          </div>
          <div style={{ display: "flex" }}>
            <span
              style={{
                fontSize: 28,
                ...headline,
                padding: "12px 26px",
                borderRadius: 16,
                border: `4px solid ${NAVY}`,
                background: ORANGE,
                boxShadow: `6px 6px 0 0 ${NAVY}`,
              }}
            >
              Buka katalog
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 26, marginLeft: 40 }}>
          <div style={{ display: "flex", gap: 26 }}>
            {tile(chip, SUN)}
            {tile(camera, PERIWINKLE)}
          </div>
          <div style={{ display: "flex", gap: 26, marginLeft: 98 }}>{tile(room, MINT)}</div>
        </div>
      </div>
    ),
    { ...size, fonts: display ? [{ name: "Lilita One", data: display, weight: 400, style: "normal" }] : undefined },
  );
}
