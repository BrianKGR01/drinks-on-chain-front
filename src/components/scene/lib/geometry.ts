import * as THREE from "three";

type V3 = [number, number, number];

/**
 * Tiny polygon-soup builder producing flat-shaded, non-indexed geometry with
 * an `aOutlineDir` attribute (direction used by the inverted-hull outline).
 */
export class SoupBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private dir: number[] = [];
  private part: number[] = [];

  private pushTri(a: V3, b: V3, c: V3, centre: V3, part: number) {
    const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    let nx = ab[1] * ac[2] - ab[2] * ac[1];
    let ny = ab[2] * ac[0] - ab[0] * ac[2];
    let nz = ab[0] * ac[1] - ab[1] * ac[0];
    const len = Math.hypot(nx, ny, nz) || 1;
    nx /= len;
    ny /= len;
    nz /= len;
    const cx = (a[0] + b[0] + c[0]) / 3 - centre[0];
    const cy = (a[1] + b[1] + c[1]) / 3 - centre[1];
    const cz = (a[2] + b[2] + c[2]) / 3 - centre[2];
    const outward = nx * cx + ny * cy + nz * cz;
    const verts = outward >= 0 ? [a, b, c] : [a, c, b];
    if (outward < 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    for (const v of verts) {
      this.pos.push(v[0], v[1], v[2]);
      this.nor.push(nx, ny, nz);
      const dx = v[0] - centre[0];
      const dy = v[1] - centre[1];
      const dz = v[2] - centre[2];
      const dl = Math.hypot(dx, dy, dz) || 1;
      this.dir.push(dx / dl, dy / dl, dz / dl);
      this.part.push(part);
    }
  }

  /** Convex polygon (fan), auto-oriented outward from `centre`. */
  face(points: V3[], centre: V3, part = 0) {
    for (let i = 1; i < points.length - 1; i++) this.pushTri(points[0], points[i], points[i + 1], centre, part);
  }

  build(): THREE.BufferGeometry {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute("aOutlineDir", new THREE.Float32BufferAttribute(this.dir, 3));
    g.setAttribute("aPart", new THREE.Float32BufferAttribute(this.part, 1));
    g.computeBoundingSphere();
    return g;
  }
}

/**
 * Gabled building: footprint w×d centred on (ox, oz), ridge along Z.
 * Walls from y=-0.4 (buried) to `wallH`, ridge at `ridgeH`.
 */
export function addGabledBlock(
  b: SoupBuilder,
  w: number,
  d: number,
  wallH: number,
  ridgeH: number,
  ox = 0,
  oz = 0,
  part = 0,
) {
  const hw = w / 2;
  const hd = d / 2;
  const y0 = -0.4;
  const centre: V3 = [ox, (wallH + y0) / 2, oz];
  const B = (sx: number, sz: number): V3 => [ox + sx * hw, y0, oz + sz * hd];
  const T = (sx: number, sz: number): V3 => [ox + sx * hw, wallH, oz + sz * hd];
  const R = (sz: number): V3 => [ox, ridgeH, oz + sz * hd];
  // side walls
  b.face([B(1, -1), B(1, 1), T(1, 1), T(1, -1)], centre, part);
  b.face([B(-1, -1), B(-1, 1), T(-1, 1), T(-1, -1)], centre, part);
  // gable walls (pentagons)
  b.face([B(-1, 1), B(1, 1), T(1, 1), R(1), T(-1, 1)], centre, part);
  b.face([B(-1, -1), B(1, -1), T(1, -1), R(-1), T(-1, -1)], centre, part);
  // roof slopes (slight overhang)
  const o = 0.06 * w;
  const e = 0.05 * d;
  const TO = (sx: number, sz: number): V3 => [ox + sx * (hw + o), wallH - 0.04 * (ridgeH - wallH), oz + sz * (hd + e)];
  const RO = (sz: number): V3 => [ox, ridgeH, oz + sz * (hd + e)];
  b.face([TO(1, -1), TO(1, 1), RO(1), RO(-1)], centre, part);
  b.face([TO(-1, -1), TO(-1, 1), RO(1), RO(-1)], centre, part);
  // underside of the overhang is never seen from above; skip.
}

export function addTower(b: SoupBuilder, size: number, wallH: number, tipH: number, ox: number, oz: number, part = 0) {
  const h = size / 2;
  const y0 = -0.4;
  const centre: V3 = [ox, wallH / 2, oz];
  const B = (sx: number, sz: number): V3 => [ox + sx * h, y0, oz + sz * h];
  const T = (sx: number, sz: number): V3 => [ox + sx * h, wallH, oz + sz * h];
  const tip: V3 = [ox, tipH, oz];
  b.face([B(1, -1), B(1, 1), T(1, 1), T(1, -1)], centre, part);
  b.face([B(-1, -1), B(-1, 1), T(-1, 1), T(-1, -1)], centre, part);
  b.face([B(-1, 1), B(1, 1), T(1, 1), T(-1, 1)], centre, part);
  b.face([B(-1, -1), B(1, -1), T(1, -1), T(-1, -1)], centre, part);
  b.face([T(1, -1), T(1, 1), tip], centre, part);
  b.face([T(-1, 1), T(-1, -1), tip], centre, part);
  b.face([T(1, 1), T(-1, 1), tip], centre, part);
  b.face([T(-1, -1), T(1, -1), tip], centre, part);
}

/** Unit house: 1×1 footprint, walls to 0.66, ridge at 1.0 (scaled per instance). */
export function buildHouseGeometry(): THREE.BufferGeometry {
  const b = new SoupBuilder();
  addGabledBlock(b, 1, 1, 0.66, 1.0);
  return b.build();
}

export function buildChurchGeometry(): THREE.BufferGeometry {
  const b = new SoupBuilder();
  addGabledBlock(b, 11, 24, 7, 11, 0, 2);
  addTower(b, 5.5, 17, 24, 0, -12.5);
  return b.build();
}

export function buildBodegaGeometry(): THREE.BufferGeometry {
  const b = new SoupBuilder();
  addGabledBlock(b, 13, 36, 4.6, 7.2);
  addGabledBlock(b, 7, 9, 3.4, 5, 11, 12);
  return b.build();
}

/** Unit tree: trunk (part 0) + squashed icosahedron canopy (part 1); height ≈ 2.1. */
export function buildTreeGeometry(): THREE.BufferGeometry {
  const pos: number[] = [];
  const nor: number[] = [];
  const dir: number[] = [];
  const part: number[] = [];

  const canopy = new THREE.IcosahedronGeometry(1, 1);
  canopy.scale(1, 0.82, 1);
  canopy.translate(0, 1.22, 0);
  canopy.computeVertexNormals();
  const cp = canopy.getAttribute("position");
  const cn = canopy.getAttribute("normal");
  for (let i = 0; i < cp.count; i++) {
    const x = cp.getX(i);
    const y = cp.getY(i);
    const z = cp.getZ(i);
    pos.push(x, y, z);
    nor.push(cn.getX(i), cn.getY(i), cn.getZ(i));
    const dy = y - 1.22;
    const l = Math.hypot(x, dy, z) || 1;
    dir.push(x / l, dy / l, z / l);
    part.push(1);
  }
  canopy.dispose();

  const trunk = new THREE.CylinderGeometry(0.07, 0.11, 1.3, 5, 1, true).toNonIndexed();
  trunk.translate(0, 0.45, 0);
  trunk.computeVertexNormals();
  const tp = trunk.getAttribute("position");
  const tn = trunk.getAttribute("normal");
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i);
    const y = tp.getY(i);
    const z = tp.getZ(i);
    pos.push(x, y, z);
    nor.push(tn.getX(i), tn.getY(i), tn.getZ(i));
    const l = Math.hypot(x, z) || 1;
    dir.push(x / l, 0, z / l);
    part.push(0);
  }
  trunk.dispose();

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("aOutlineDir", new THREE.Float32BufferAttribute(dir, 3));
  g.setAttribute("aPart", new THREE.Float32BufferAttribute(part, 1));
  g.computeBoundingSphere();
  return g;
}

/**
 * Creates an instanced line geometry from the edges of `source`, sharing the
 * `instanceMatrix` attribute of an InstancedMesh so both draw from one buffer.
 */
export function buildInstancedEdges(
  source: THREE.BufferGeometry,
  instanceMatrix: THREE.InstancedBufferAttribute,
  count: number,
  thresholdAngle = 18,
): THREE.InstancedBufferGeometry {
  const edges = new THREE.EdgesGeometry(source, thresholdAngle);
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute("position", edges.getAttribute("position"));
  g.setAttribute("instanceMatrix", instanceMatrix);
  g.instanceCount = count;
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  return g;
}

export function buildEdges(source: THREE.BufferGeometry, thresholdAngle = 18): THREE.BufferGeometry {
  return new THREE.EdgesGeometry(source, thresholdAngle);
}
