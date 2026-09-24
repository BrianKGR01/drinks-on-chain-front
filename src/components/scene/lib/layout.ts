import type { ParcelSpec, VillageSpec } from "@/lib/scene-contract";
import type { HeightField } from "./terrain";
import { createNoise2D } from "./noise";
import { mulberry32, range, clamp, type Rng } from "./prng";

export interface Placement {
  x: number;
  y: number;
  z: number;
  /** Rotation around +Y in radians. */
  rot: number;
  sx: number;
  sy: number;
  sz: number;
  /** Per-instance random seed (0..1). */
  seed: number;
}

/** World → parcel-local coordinates (x along rows, z across rows). */
export function toParcelLocal(p: ParcelSpec, x: number, z: number): [number, number] {
  const dx = x - p.center[0];
  const dz = z - p.center[1];
  const c = Math.cos(p.rotation);
  const s = Math.sin(p.rotation);
  return [dx * c - dz * s, dx * s + dz * c];
}

/** Parcel-local → world coordinates. */
export function fromParcelLocal(p: ParcelSpec, lx: number, lz: number): [number, number] {
  const c = Math.cos(p.rotation);
  const s = Math.sin(p.rotation);
  return [p.center[0] + lx * c + lz * s, p.center[1] - lx * s + lz * c];
}

export function insideAnyParcel(parcels: ParcelSpec[], x: number, z: number, margin = 0): boolean {
  for (const p of parcels) {
    const [lx, lz] = toParcelLocal(p, x, z);
    if (Math.abs(lx) <= p.size[0] / 2 + margin && Math.abs(lz) <= p.size[1] / 2 + margin) return true;
  }
  return false;
}

export function distToPolyline(line: Array<[number, number]>, x: number, z: number): number {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, az] = line[i];
    const [bx, bz] = line[i + 1];
    const vx = bx - ax;
    const vz = bz - az;
    const l2 = vx * vx + vz * vz || 1;
    const t = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1);
    const px = ax + vx * t;
    const pz = az + vz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < best) best = d;
  }
  return best;
}

function nearAnyPolyline(lines: Array<Array<[number, number]>>, x: number, z: number, margin: number): boolean {
  for (const l of lines) if (distToPolyline(l, x, z) < margin) return true;
  return false;
}

const GROUND_LIFT = 0.35;

export function layoutHouses(village: VillageSpec, field: HeightField): Placement[] {
  const out: Placement[] = [];
  const blockers = [...village.roads, ...(village.river ? [village.river] : [])];
  const landmarkPts = village.landmarks.map((l) => l.position);

  village.houses.forEach((cluster, ci) => {
    const rng: Rng = mulberry32(village.seed * 31 + ci * 977 + 11);
    const [cx, cz] = cluster.center;
    const R = cluster.radius;
    const density = clamp(cluster.density, 0, 1);
    const cell = 15 + (1 - density) * 12;
    const theta = range(rng, 0, Math.PI);
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const jitter = (1 - density) * cell * 0.9 + 1.5;
    const half = Math.ceil(R / cell) + 1;

    const candidates: Array<{ x: number; z: number; w: number }> = [];
    for (let i = -half; i <= half; i++) {
      for (let j = -half; j <= half; j++) {
        const gx = i * cell + (rng() - 0.5) * jitter;
        const gz = j * cell + (rng() - 0.5) * jitter;
        const x = cx + gx * ct - gz * st;
        const z = cz + gx * st + gz * ct;
        const r = Math.hypot(x - cx, z - cz) / R;
        if (r > 1.05) continue;
        // sparser towards the outskirts, rough edge
        const keep = rng() < 1.05 - 0.65 * r * r;
        if (!keep) continue;
        if (insideAnyParcel(village.parcels, x, z, 5)) continue;
        if (nearAnyPolyline(blockers, x, z, 7.5)) continue;
        if (landmarkPts.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 22)) continue;
        candidates.push({ x, z, w: r + rng() * 0.35 });
      }
    }
    candidates.sort((a, b) => a.w - b.w);
    const chosen = candidates.slice(0, cluster.count);
    for (const c of chosen) {
      const w = range(rng, 5.5, 9);
      const d = range(rng, 7, 13);
      const h = range(rng, 4.2, 6.4);
      const ortho = rng() < 0.5 ? 0 : Math.PI / 2;
      const rot = theta + ortho + (rng() - 0.5) * (1 - density) * 1.4 + (rng() - 0.5) * 0.12;
      out.push({ x: c.x, z: c.z, y: field.getHeight(c.x, c.z) + GROUND_LIFT, rot, sx: w, sy: h, sz: d, seed: rng() });
    }
  });
  return out;
}

export function layoutTrees(village: VillageSpec, field: HeightField): Placement[] {
  const out: Placement[] = [];
  const noise = createNoise2D(village.seed + 404);
  const core = village.houses.filter((h) => h.density > 0.6);
  const blocked = (x: number, z: number) =>
    Math.abs(x) > village.extent * 0.97 ||
    Math.abs(z) > village.extent * 0.97 ||
    insideAnyParcel(village.parcels, x, z, 4) ||
    core.some((c) => Math.hypot(c.center[0] - x, c.center[1] - z) < c.radius * 0.9);

  const push = (rng: Rng, x: number, z: number, scaleMin = 3.6, scaleMax = 6) => {
    const s = range(rng, scaleMin, scaleMax);
    out.push({
      x,
      z,
      y: field.getHeight(x, z) + GROUND_LIFT,
      rot: range(rng, 0, Math.PI * 2),
      sx: s * range(rng, 0.85, 1.15),
      sy: s * range(rng, 0.9, 1.25),
      sz: s * range(rng, 0.85, 1.15),
      seed: rng(),
    });
  };

  village.forests.forEach((patch, pi) => {
    const rng = mulberry32(village.seed * 17 + pi * 313 + 5);
    const [cx, cz] = patch.center;
    let placed = 0;
    let tries = 0;
    while (placed < patch.count && tries < patch.count * 6) {
      tries++;
      const a = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * patch.radius;
      const x = cx + Math.cos(a) * r;
      const z = cz + Math.sin(a) * r;
      // clumpy edges
      const n = noise(x * 0.012, z * 0.012);
      if (n < -0.25 + 0.55 * (r / patch.radius)) continue;
      if (blocked(x, z)) continue;
      push(rng, x, z);
      placed++;
    }
  });

  // sprinkle along roads and the river
  const lines: Array<{ pts: Array<[number, number]>; step: number; off: [number, number]; p: number }> = [
    ...village.roads.map((pts) => ({ pts, step: 48, off: [9, 15] as [number, number], p: 0.45 })),
  ];
  if (village.river) lines.push({ pts: village.river, step: 26, off: [7, 13], p: 0.7 });
  lines.forEach((line, li) => {
    const rng = mulberry32(village.seed * 3 + li * 71 + 99);
    for (let i = 0; i < line.pts.length - 1; i++) {
      const [ax, az] = line.pts[i];
      const [bx, bz] = line.pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      const n = Math.max(1, Math.floor(len / line.step));
      const nx = -(bz - az) / len;
      const nz = (bx - ax) / len;
      for (let k = 0; k < n; k++) {
        if (rng() > line.p) continue;
        const t = (k + rng()) / n;
        const side = rng() < 0.5 ? -1 : 1;
        const off = range(rng, line.off[0], line.off[1]) * side;
        const x = ax + (bx - ax) * t + nx * off;
        const z = az + (bz - az) * t + nz * off;
        if (blocked(x, z)) continue;
        push(rng, x, z, 3, 5);
      }
    }
  });

  return out;
}
