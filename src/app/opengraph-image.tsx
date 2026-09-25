import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/*
 * Default share image for every route. Rendered once at build time (no
 * request-time APIs). It uses the font bundled with next/og: no font file of
 * Cormorant ships with the repo and nothing is fetched from the network.
 */
export const alt = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#fdfcf5";
const INK = "#2b2622";
const GOLD = "#b8891f";
const DEEP_GOLD = "#8a651a";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          padding: 36,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            border: `1px solid ${GOLD}`,
            padding: 10,
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${GOLD}`,
              color: INK,
            }}
          >
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 8, color: DEEP_GOLD }}>
              BODEGAS · TARIJA · VALLE DE CINTI
            </div>
            <div style={{ display: "flex", width: 96, height: 1, background: GOLD, marginTop: 40, marginBottom: 40 }} />
            <div style={{ display: "flex", fontSize: 84, letterSpacing: 18, color: "#000" }}>DRINKS ON CHAIN</div>
            <div style={{ display: "flex", width: 96, height: 1, background: GOLD, marginTop: 40, marginBottom: 36 }} />
            <div style={{ display: "flex", fontSize: 38, color: INK }}>{SITE_TAGLINE}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
