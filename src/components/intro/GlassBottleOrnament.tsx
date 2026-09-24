import type { CSSProperties } from "react";
import styles from "./VineOrnament.module.css";

interface GlassBottleOrnamentProps {
  className?: string;
  delay?: number;
}

/**
 * A wine bottle and a glass, engraved line-work drawn stroke by stroke
 * (same animation classes as the vine). Purely decorative.
 */
export function GlassBottleOrnament({ className = "", delay = 0 }: GlassBottleOrnamentProps) {
  let i = 0;
  const stroke = (d: string, w = 1.1, extra = 0) => (
    <path
      key={i}
      d={d}
      pathLength={1}
      className={styles.stroke}
      strokeWidth={w}
      style={{ "--i": i++, "--extra": extra } as CSSProperties}
    />
  );
  return (
    <svg
      viewBox="0 0 420 420"
      className={`${styles.svg} ${className}`}
      style={{ "--delay": `${delay}s` } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* table line */}
        {stroke("M40 392 C 140 386, 300 386, 400 392", 0.9, 1)}

        {/* bottle: neck, shoulders, body */}
        {stroke("M150 60 h30 v14 h-30 z", 1.2)}
        {stroke("M154 74 v 90 c 0 22 -32 34 -32 70 v 148 c 0 6 4 10 10 10 h 66 c 6 0 10 -4 10 -10 v -148 c 0 -36 -32 -48 -32 -70 v -90", 1.3)}
        {/* capsule ring and label */}
        {stroke("M154 118 h 22", 0.8, 1)}
        {stroke("M128 258 h 74 M128 336 h 74", 0.9)}
        {stroke("M140 274 h 50 M146 288 h 38 M150 302 h 30", 0.7, 1)}
        {/* bottle shading: hatch on the left side */}
        {stroke("M126 250 l 0 128 M132 240 l 0 140 M138 236 l 0 146", 0.55, 1)}
        {stroke("M130 238 c -4 40 -4 90 0 132", 0.6, 1)}

        {/* glass: bowl, wine level, stem, foot */}
        {stroke("M262 214 c -6 60 20 108 58 116 c 38 -8 64 -56 58 -116 z", 1.3)}
        {stroke("M268 262 c 20 10 84 10 104 0", 0.9)}
        {stroke("M270 270 c 18 -6 82 -6 100 0", 0.7, 1)}
        {stroke("M320 330 v 46", 1.2)}
        {stroke("M282 384 c 10 -6 66 -6 76 0 c -10 6 -66 6 -76 0 z", 1.1)}
        {/* wine shading in the bowl */}
        {stroke("M272 276 c 6 26 22 42 48 48 M278 294 c 8 16 20 26 40 30 M286 310 c 6 8 14 14 26 16", 0.7, 1)}
        {/* glass highlight */}
        {stroke("M272 226 c -2 20 2 44 12 60", 0.6, 1)}

        {/* a stray grape leaf on the table */}
        {stroke("M72 380 c -14 -14 -26 -10 -28 -22 c 12 -3 20 4 24 9 c -8 -16 -2 -28 10 -33 c 6 12 4 24 2 28 c 8 -12 22 -14 32 -8 c -10 10 -20 12 -28 12 c 12 4 18 16 16 24 c -10 -4 -18 -10 -24 -6 z", 0.9)}
        {stroke("M72 380 l 4 -34 M72 380 l -24 -20 M72 380 l 28 -12", 0.6, 1)}
      </g>
    </svg>
  );
}
