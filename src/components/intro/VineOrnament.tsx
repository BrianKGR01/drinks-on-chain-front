import type { CSSProperties } from "react";
import styles from "./VineOrnament.module.css";

interface VineOrnamentProps {
  className?: string;
  /** Mirror horizontally (for the opposite corner). */
  flip?: boolean;
  /** Seconds before the drawing starts. */
  delay?: number;
}

/**
 * A vine shoot with a grape cluster, tendrils and three leaves, drawn as
 * copper-engraving line-work and revealed stroke by stroke (pathLength=1 +
 * dash animation). Purely decorative.
 */
export function VineOrnament({ className = "", flip = false, delay = 0 }: VineOrnamentProps) {
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
  const grapes: Array<[number, number, number]> = [
    [262, 248, 9], [280, 244, 9], [298, 250, 9], [254, 264, 9], [272, 262, 9], [290, 264, 9], [308, 268, 9],
    [263, 280, 8.5], [281, 280, 8.5], [299, 284, 8.5], [271, 297, 8], [289, 299, 8], [280, 314, 7.5], [297, 312, 7],
    [288, 328, 6.5],
  ];
  return (
    <svg
      viewBox="0 0 420 420"
      className={`${styles.svg} ${flip ? styles.flip : ""} ${className}`}
      style={{ "--delay": `${delay}s` } as CSSProperties}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {/* main shoot */}
        {stroke("M20 400 C 80 330, 120 300, 150 250 S 200 150, 250 130 S 340 110, 400 60", 1.4)}
        {/* secondary shoot toward the cluster */}
        {stroke("M150 250 C 190 240, 230 225, 262 232", 1.1)}
        {/* tendrils */}
        {stroke("M250 130 c 20 -30, 45 -25, 40 -5 c -4 14, -22 12, -20 0 c 2 -8, 12 -8, 12 -1", 0.9)}
        {stroke("M110 300 c -30 -10, -50 10, -38 28 c 8 12, 26 4, 20 -8 c -4 -8, -14 -5, -12 2", 0.9)}
        {stroke("M330 100 c 18 -28, 48 -30, 50 -8 c 1 12, -14 18, -20 8 c -4 -8, 4 -14, 10 -8", 0.9)}
        {/* leaves: five-lobed, veins */}
        {stroke("M190 200 c -30 -40, -70 -30, -80 -60 c 30 -10, 50 8, 60 20 c -20 -35, -5 -70, 25 -85 c 15 30, 10 60, 5 70 c 20 -30, 55 -35, 80 -20 c -25 25, -50 30, -70 30 c 30 10, 45 40, 40 60 c -25 -10, -45 -25, -60 -15 z", 1.1)}
        {stroke("M190 200 l 5 -80 M190 200 l -60 -50 M190 200 l 70 -30 M190 200 l 20 45 M190 200 l -45 25", 0.7, 1)}
        {stroke("M320 150 c -25 -30, -55 -25, -60 -50 c 25 -6, 40 8, 48 18 c -15 -30, -2 -55, 22 -66 c 12 25, 8 48, 4 56 c 16 -24, 44 -28, 64 -16 c -20 20, -40 24, -56 24 c 24 8, 36 32, 32 48 c -20 -8, -36 -20, -48 -12 z", 1.0)}
        {stroke("M320 150 l 6 -62 M320 150 l -48 -40 M320 150 l 56 -24 M320 150 l 14 36", 0.7, 1)}
        {stroke("M96 342 c -20 -26, -46 -22, -50 -42 c 20 -5, 34 6, 40 15 c -12 -25, -2 -46, 18 -55 c 10 20, 7 40, 3 47 c 13 -20, 36 -23, 53 -13 c -17 17, -33 20, -46 20 c 20 7, 30 27, 27 40 c -17 -7, -30 -17, -40 -10 z", 1.0)}
        {stroke("M96 342 l 5 -52 M96 342 l -40 -34 M96 342 l 46 -20 M96 342 l 12 30", 0.7, 1)}
        {/* grape cluster: outline circles + a little hatch on each berry */}
        {grapes.map(([cx, cy, r], k) => (
          <g key={`g${k}`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              pathLength={1}
              className={styles.stroke}
              strokeWidth={0.95}
              style={{ "--i": i + k * 0.35, "--extra": 0 } as CSSProperties}
            />
            <path
              d={`M${cx - r * 0.55} ${cy + r * 0.35} q ${r * 0.5} ${r * 0.5} ${r * 1.05} 0`}
              pathLength={1}
              className={styles.stroke}
              strokeWidth={0.6}
              style={{ "--i": i + k * 0.35 + 0.2, "--extra": 1 } as CSSProperties}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
