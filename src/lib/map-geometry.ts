import type { VillageSpec } from "@/lib/scene-contract";

/**
 * Deterministic drawing primitives for a village, derived from the same
 * geometry the WebGL map uses. Shared by the SVG preview and the canvas hero.
 * World units are metres; +z is down on screen.
 */
export interface MapPrimitives {
  extent: number;
  rings: Array<{ rx: number; ry: number; opacity: number }>;
  river?: Array<[number, number]>;
  roads: Array<Array<[number, number]>>;
  parcels: Array<{ id: string; cx: number; cz: number; w: number; d: number; rot: number }>;
  houses: Array<{ x: number; z: number; r: number; w: number; d: number }>;
  trees: Array<{ x: number; z: number; r: number }>;
  churches: Array<{ x: number; z: number }>;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cache = new Map<string, MapPrimitives>();

export function buildMapPrimitives(village: VillageSpec, detail = true): MapPrimitives {
  const key = `${village.id}:${detail ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const rnd = mulberry32(village.seed);
  const houses: MapPrimitives["houses"] = [];
  const trees: MapPrimitives["trees"] = [];
  if (detail) {
    for (const c of village.houses) {
      const n = Math.min(c.count, 220);
      for (let i = 0; i < n; i++) {
        const ang = rnd() * Math.PI * 2;
        const rad = Math.sqrt(rnd()) * c.radius;
        const gx = c.center[0] + Math.cos(ang) * rad;
        const gz = c.center[1] + Math.sin(ang) * rad;
        const snap = c.density > 0.6 ? 14 : 1;
        houses.push({
          x: r1(Math.round(gx / snap) * snap),
          z: r1(Math.round(gz / snap) * snap),
          r: r1(c.density > 0.6 ? (rnd() < 0.5 ? 0 : 90) : rnd() * 180),
          w: r1(6 + rnd() * 5),
          d: r1(5 + rnd() * 4),
        });
      }
    }
    for (const f of village.forests) {
      const n = Math.min(f.count, 90);
      for (let i = 0; i < n; i++) {
        const ang = rnd() * Math.PI * 2;
        const rad = Math.sqrt(rnd()) * f.radius;
        trees.push({ x: r1(f.center[0] + Math.cos(ang) * rad), z: r1(f.center[1] + Math.sin(ang) * rad), r: r1(5 + rnd() * 5) });
      }
    }
  }
  const prims: MapPrimitives = {
    extent: village.extent,
    rings: [0.55, 0.68, 0.8, 0.92].map((k, i) => ({
      rx: r1(village.extent * k * (village.relief === "canyon" ? 0.45 : 1)),
      ry: r1(village.extent * k),
      opacity: 0.18 + i * 0.04,
    })),
    river: village.river,
    roads: village.roads,
    parcels: village.parcels.map((p) => ({
      id: p.id,
      cx: p.center[0],
      cz: p.center[1],
      w: p.size[0],
      d: p.size[1],
      rot: r1((p.rotation * 180) / Math.PI),
    })),
    houses,
    trees,
    churches: village.landmarks.filter((l) => l.kind === "church").map((l) => ({ x: l.position[0], z: l.position[1] })),
  };
  cache.set(key, prims);
  return prims;
}
