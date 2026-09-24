import type { CSSProperties } from "react";

/* Ink-on-paper SVG illustrations that replace the reference's photographs
   until the bodegas provide real imagery. All strokes, no fills, so they sit
   naturally next to the engraved 3D map. */

const HATCH_ID = "ink-hatch";
const CROSS_ID = "ink-cross";

function Defs() {
  return (
    <defs>
      <pattern id={HATCH_ID} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
      </pattern>
      <pattern id={CROSS_ID} width="4" height="4" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="4" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <line x1="4" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
      </pattern>
    </defs>
  );
}

interface BottleProps {
  kind: "vino" | "singani";
  label: string;
  sublabel?: string;
  className?: string;
  style?: CSSProperties;
}

/** A tall packshot silhouette: Bordeaux bottle for wine, slim flask for singani. */
export function BottleIllustration({ kind, label, sublabel, className, style }: BottleProps) {
  const isSingani = kind === "singani";
  return (
    <svg
      viewBox="0 0 200 640"
      className={className}
      style={style}
      role="img"
      aria-label={`${label}${sublabel ? ` — ${sublabel}` : ""}`}
    >
      <Defs />
      {/* shadow */}
      <ellipse cx="100" cy="626" rx="70" ry="6" fill={`url(#${HATCH_ID})`} stroke="none" />
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        {isSingani ? (
          <>
            <path d="M84 20 h32 v14 h-32 z" />
            <path d="M88 34 v70 c0 30 -34 46 -34 90 v390 c0 10 8 16 18 16 h56 c10 0 18 -6 18 -16 v-390 c0 -44 -34 -60 -34 -90 v-70" />
            <path d="M54 196 h92" strokeWidth="0.8" />
          </>
        ) : (
          <>
            <path d="M82 18 h36 v20 h-36 z" />
            <path d="M86 38 v110 c0 24 -32 40 -32 76 v364 c0 10 8 16 18 16 h56 c10 0 18 -6 18 -16 v-364 c0 -36 -32 -52 -32 -76 v-110" />
            <path d="M54 226 h92" strokeWidth="0.8" />
          </>
        )}
        {/* glass shading */}
        <path
          d={isSingani ? "M62 210 v370 h20 v-370 z" : "M62 240 v340 h22 v-340 z"}
          fill={`url(#${HATCH_ID})`}
          stroke="none"
        />
        <path
          d={isSingani ? "M120 210 v370 h18 v-370 z" : "M122 240 v340 h16 v-340 z"}
          fill={`url(#${CROSS_ID})`}
          stroke="none"
        />
        {/* label */}
        <rect x="64" y={isSingani ? 300 : 320} width="72" height="120" fill="var(--paper)" />
        <rect x="64" y={isSingani ? 300 : 320} width="72" height="120" />
        <line x1="70" y1={isSingani ? 312 : 332} x2="130" y2={isSingani ? 312 : 332} strokeWidth="0.8" />
        <line x1="70" y1={isSingani ? 408 : 428} x2="130" y2={isSingani ? 408 : 428} strokeWidth="0.8" />
      </g>
      <text
        x="100"
        y={isSingani ? 352 : 372}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="9.5"
        letterSpacing="1.4"
        fill="currentColor"
        style={{ textTransform: "uppercase" }}
      >
        {label.toUpperCase().slice(0, 14)}
      </text>
      <text
        x="100"
        y={isSingani ? 372 : 392}
        textAnchor="middle"
        fontFamily="var(--font-body)"
        fontSize="7"
        fontStyle="italic"
        fill="var(--accent)"
      >
        {sublabel ?? (isSingani ? "Singani de altura" : "Vino de altura")}
      </text>
      <text
        x="100"
        y={isSingani ? 396 : 416}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="6.5"
        letterSpacing="1.2"
        fill="currentColor"
      >
        DRINKS ON CHAIN · BOLIVIA
      </text>
    </svg>
  );
}

interface SoilProfileProps {
  levels: Array<{ name: string; caption: string }>;
  className?: string;
}

/** Stacked strata with different hatch densities, deepest at the bottom. */
export function SoilProfile({ levels, className }: SoilProfileProps) {
  const n = Math.max(levels.length, 1);
  const h = 320;
  const bandH = h / n;
  return (
    <svg viewBox="0 0 480 360" className={className} role="img" aria-label="Perfil del suelo">
      <Defs />
      {/* vine on top */}
      <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M120 40 c-6 -18 4 -30 10 -36 M120 40 c 8 -12 22 -14 30 -10 M120 40 v 0" />
        <path d="M240 40 c-4 -20 6 -32 12 -38 M240 40 c 10 -10 24 -12 32 -8" />
        <path d="M360 40 c-6 -16 2 -30 10 -36 M360 40 c 8 -14 20 -12 30 -8" />
        <line x1="0" y1="40" x2="480" y2="40" />
      </g>
      {levels.map((lvl, i) => {
        const y = 40 + i * bandH;
        const dark = i / n;
        return (
          <g key={i}>
            <path
              d={`M0 ${y} Q120 ${y + 6} 240 ${y} T480 ${y} V${y + bandH} H0 Z`}
              fill={i % 2 === 0 ? `url(#${HATCH_ID})` : `url(#${CROSS_ID})`}
              opacity={0.35 + dark * 0.6}
              stroke="none"
            />
            <path d={`M0 ${y} Q120 ${y + 6} 240 ${y} T480 ${y}`} fill="none" stroke="currentColor" strokeWidth="0.9" />
            {/* roots */}
            {i === 0
              ? [120, 240, 360].map((x) => (
                  <path
                    key={x}
                    d={`M${x} 40 c -4 20 -10 30 -16 ${bandH - 10} M${x} 40 c 4 20 12 28 14 ${bandH - 6} M${x} 40 v ${bandH - 4}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                  />
                ))
              : null}
            {/* stones */}
            {i > 0
              ? [60, 200, 330, 430].map((x, k) => (
                  <ellipse
                    key={k}
                    cx={x + (i * 37) % 40}
                    cy={y + bandH * 0.5 + ((k * 13) % 20) - 10}
                    rx={5 + (k % 3) * 2}
                    ry={3 + (k % 2)}
                    fill="var(--paper)"
                    stroke="currentColor"
                    strokeWidth="0.8"
                  />
                ))
              : null}
          </g>
        );
      })}
    </svg>
  );
}

interface FramedHatchProps {
  ratio?: number; // width / height
  caption?: string;
  className?: string;
}

/** Placeholder for a photograph: hairline frame with a soft hatch wash. */
export function FramedHatch({ ratio = 1.6, caption, className }: FramedHatchProps) {
  return (
    <figure className={className} style={{ margin: 0 }}>
      <div
        style={{
          aspectRatio: String(ratio),
          border: "1px solid var(--hairline)",
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 7px), radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.05), transparent 65%)",
          backgroundColor: "var(--paper-2)",
        }}
      />
      {caption ? (
        <figcaption
          style={{
            marginTop: "0.9em",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "0.8rem",
            letterSpacing: "0.08em",
            color: "var(--muted)",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
