"use client";

import { useId } from "react";
import type { VillageSpec } from "@/lib/scene-contract";
import { buildMapPrimitives } from "@/lib/map-geometry";

export interface MapMarker {
  id: string;
  x: number;
  z: number;
  label: string;
  /** Draw this seat in gold and bigger (the winery the page is about). */
  active?: boolean;
}

interface NetworkMapProps {
  village: VillageSpec;
  /** Parcels drawn in gold (the winery's vineyards); the rest stay in ink. */
  highlight?: string[];
  markers?: MapMarker[];
  className?: string;
  /** Accessible name; without it the drawing is decorative. */
  title?: string;
  /** Lighter drawing for small cards (no trees or houses). */
  detail?: boolean;
}

/**
 * Static ink drawing of a valley with the network on top: the parcels of a
 * winery in gold and the seats of the wineries as labelled marks. Built from
 * the same geometry as the WebGL map, so a parcel sits where it sits there.
 */
export function NetworkMap({ village, highlight = [], markers = [], className, title, detail = true }: NetworkMapProps) {
  const p = buildMapPrimitives(village, detail);
  const E = p.extent + 60;
  const uid = useId().replace(/:/g, "");
  const poly = (pts: Array<[number, number]>) => pts.map(([x, z]) => `${x},${z}`).join(" ");
  const on = new Set(highlight);

  return (
    <svg
      viewBox={`${-E} ${-E} ${2 * E} ${2 * E}`}
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={`${uid}-ink`} width="9" height="9" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="9" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
        </pattern>
        <pattern id={`${uid}-gold`} width="7" height="7" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--accent)" strokeWidth="1.6" />
        </pattern>
      </defs>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        {p.rings.map((r, i) => (
          <ellipse key={i} cx={0} cy={0} rx={r.rx} ry={r.ry} strokeWidth="0.6" opacity={r.opacity} />
        ))}
        {p.river ? <polyline points={poly(p.river)} strokeWidth="2.2" opacity="0.35" /> : null}
        {p.roads.map((r, i) => (
          <polyline key={i} points={poly(r)} strokeWidth="1.1" opacity="0.7" />
        ))}
        {p.houses.map((h, i) => (
          <rect key={`h${i}`} x={-h.w / 2} y={-h.d / 2} width={h.w} height={h.d} strokeWidth="0.8" opacity="0.7" transform={`translate(${h.x} ${h.z}) rotate(${h.r})`} />
        ))}
        {p.trees.map((t, i) => (
          <circle key={`t${i}`} cx={t.x} cy={t.z} r={t.r} strokeWidth="0.6" opacity="0.5" />
        ))}
        {p.parcels.map((pc) => {
          const gold = on.has(pc.id);
          return (
            <g key={pc.id} transform={`translate(${pc.cx} ${pc.cz}) rotate(${pc.rot})`}>
              <rect x={-pc.w / 2} y={-pc.d / 2} width={pc.w} height={pc.d} fill={`url(#${uid}-${gold ? "gold" : "ink"})`} stroke="none" />
              <rect
                x={-pc.w / 2}
                y={-pc.d / 2}
                width={pc.w}
                height={pc.d}
                strokeWidth={gold ? 3 : 1.2}
                stroke={gold ? "var(--accent-deep)" : "currentColor"}
                opacity={gold || on.size === 0 ? 1 : 0.55}
              />
            </g>
          );
        })}
      </g>
      {markers.map((m) => (
        <g key={m.id} transform={`translate(${m.x} ${m.z})`} className="network-marker">
          <circle r={m.active ? 22 : 14} fill="var(--paper)" stroke={m.active ? "var(--accent-deep)" : "currentColor"} strokeWidth={m.active ? 3 : 2} />
          <circle r={m.active ? 8 : 5} fill={m.active ? "var(--accent)" : "currentColor"} />
          {m.label ? <text
            y={m.active ? -36 : -26}
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontSize={m.active ? 34 : 28}
            letterSpacing="3"
            fill="currentColor"
            stroke="var(--paper)"
            strokeWidth="8"
            paintOrder="stroke"
          >
            {m.label}
          </text> : null}
        </g>
      ))}
    </svg>
  );
}
