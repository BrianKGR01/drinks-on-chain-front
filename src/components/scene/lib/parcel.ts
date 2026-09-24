import * as THREE from "three";
import type { ParcelSpec } from "@/lib/scene-contract";
import { fromParcelLocal } from "./layout";
import { mulberry32 } from "./prng";
import type { HeightField } from "./terrain";

export const PARCEL_LIFT = 0.3;

/**
 * Slightly irregular quad (jittered corners), subdivided and draped on the
 * terrain. Attributes: position (world), uv (0..1 across the quad), aLocal
 * (parcel-local metres: x along rows, y across rows).
 */
export function buildParcelGeometry(p: ParcelSpec, seed: number, field: HeightField): THREE.BufferGeometry {
  const rng = mulberry32(seed);
  const [w, d] = p.size;
  const hw = w / 2;
  const hd = d / 2;
  const j = (s: number) => (rng() - 0.5) * 2 * s;
  const jx = w * 0.07;
  const jz = d * 0.07;
  // corners in local space: c00 (-x,-z), c10 (+x,-z), c01 (-x,+z), c11 (+x,+z)
  const c00 = [-hw + j(jx), -hd + j(jz)];
  const c10 = [hw + j(jx), -hd + j(jz)];
  const c01 = [-hw + j(jx), hd + j(jz)];
  const c11 = [hw + j(jx), hd + j(jz)];

  const nx = Math.max(4, Math.ceil(w / 7));
  const nz = Math.max(4, Math.ceil(d / 7));
  const count = (nx + 1) * (nz + 1);
  const pos = new Float32Array(count * 3);
  const uv = new Float32Array(count * 2);
  const loc = new Float32Array(count * 2);
  for (let iz = 0; iz <= nz; iz++) {
    const v = iz / nz;
    for (let ix = 0; ix <= nx; ix++) {
      const u = ix / nx;
      const lx = (1 - u) * (1 - v) * c00[0] + u * (1 - v) * c10[0] + (1 - u) * v * c01[0] + u * v * c11[0];
      const lz = (1 - u) * (1 - v) * c00[1] + u * (1 - v) * c10[1] + (1 - u) * v * c01[1] + u * v * c11[1];
      const [x, z] = fromParcelLocal(p, lx, lz);
      const i = iz * (nx + 1) + ix;
      pos[i * 3] = x;
      pos[i * 3 + 1] = field.getHeight(x, z) + PARCEL_LIFT;
      pos[i * 3 + 2] = z;
      uv[i * 2] = u;
      uv[i * 2 + 1] = v;
      loc[i * 2] = lx;
      loc[i * 2 + 1] = lz;
    }
  }
  const idx = new Uint32Array(nx * nz * 6);
  let k = 0;
  for (let iz = 0; iz < nz; iz++) {
    for (let ix = 0; ix < nx; ix++) {
      const a = iz * (nx + 1) + ix;
      const b = a + nx + 1;
      // wound to face +Y (matches the terrain builder)
      idx[k++] = a;
      idx[k++] = b;
      idx[k++] = a + 1;
      idx[k++] = b;
      idx[k++] = b + 1;
      idx[k++] = a + 1;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("aLocal", new THREE.BufferAttribute(loc, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeBoundingSphere();
  return g;
}
