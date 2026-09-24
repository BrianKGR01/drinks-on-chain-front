import * as THREE from "three";
import type { HeightField } from "./terrain";

/**
 * Builds a flat ribbon following a smoothed polyline, conformed to the terrain.
 * uv.x = 0..1 across the ribbon, uv.y = arc length in metres.
 */
export function buildRibbon(
  points: Array<[number, number]>,
  width: number,
  field: HeightField,
  lift: number,
  step = 6,
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    false,
    "centripetal",
    0.5,
  );
  const length = curve.getLength();
  const n = Math.max(2, Math.ceil(length / step));
  const pos = new Float32Array((n + 1) * 2 * 3);
  const uv = new Float32Array((n + 1) * 2 * 2);
  const idx = new Uint32Array(n * 6);
  const p = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const hw = width / 2;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    curve.getPointAt(u, p);
    curve.getTangentAt(u, tan);
    const nx = -tan.z;
    const nz = tan.x;
    const nl = Math.hypot(nx, nz) || 1;
    const lx = p.x - (nx / nl) * hw;
    const lz = p.z - (nz / nl) * hw;
    const rx = p.x + (nx / nl) * hw;
    const rz = p.z + (nz / nl) * hw;
    const o = i * 6;
    pos[o] = lx;
    pos[o + 1] = field.getHeight(lx, lz) + lift;
    pos[o + 2] = lz;
    pos[o + 3] = rx;
    pos[o + 4] = field.getHeight(rx, rz) + lift;
    pos[o + 5] = rz;
    uv[i * 4] = 0;
    uv[i * 4 + 1] = u * length;
    uv[i * 4 + 2] = 1;
    uv[i * 4 + 3] = u * length;
    if (i < n) {
      const a = i * 2;
      const k = i * 6;
      // (a, a+1, a+2) and (a+1, a+3, a+2), wound to face +Y
      idx[k] = a;
      idx[k + 1] = a + 1;
      idx[k + 2] = a + 2;
      idx[k + 3] = a + 1;
      idx[k + 4] = a + 3;
      idx[k + 5] = a + 2;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}

/** Concatenates indexed geometries sharing the same attribute layout (position + uv). */
export function mergeRibbons(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let vCount = 0;
  let iCount = 0;
  for (const g of geos) {
    vCount += g.getAttribute("position").count;
    iCount += g.getIndex()?.count ?? 0;
  }
  const pos = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const idx = new Uint32Array(iCount);
  let vo = 0;
  let io = 0;
  for (const g of geos) {
    const p = g.getAttribute("position");
    const u = g.getAttribute("uv");
    const ind = g.getIndex();
    pos.set(p.array as Float32Array, vo * 3);
    uv.set(u.array as Float32Array, vo * 2);
    if (ind) {
      for (let i = 0; i < ind.count; i++) idx[io + i] = ind.getX(i) + vo;
      io += ind.count;
    }
    vo += p.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}
