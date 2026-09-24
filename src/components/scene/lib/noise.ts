import { mulberry32 } from "./prng";

/** 2D gradient (Perlin) noise in roughly [-1, 1]. */
export type Noise2D = (x: number, y: number) => number;

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function grad(h: number, x: number, y: number): number {
  switch (h & 7) {
    case 0:
      return x + y;
    case 1:
      return -x + y;
    case 2:
      return x - y;
    case 3:
      return -x - y;
    case 4:
      return x * 1.4142;
    case 5:
      return -x * 1.4142;
    case 6:
      return y * 1.4142;
    default:
      return -y * 1.4142;
  }
}

export function createNoise2D(seed: number): Noise2D {
  const rng = mulberry32(seed);
  const p: number[] = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = p[i];
    p[i] = p[j];
    p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  return (x: number, y: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const X = xi & 255;
    const Y = yi & 255;
    const fx = x - xi;
    const fy = y - yi;
    const u = fade(fx);
    const v = fade(fy);
    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;
    const n = lerp(
      lerp(grad(perm[A], fx, fy), grad(perm[B], fx - 1, fy), u),
      lerp(grad(perm[A + 1], fx, fy - 1), grad(perm[B + 1], fx - 1, fy - 1), u),
      v,
    );
    return n * 0.8;
  };
}

/** Fractional Brownian motion built on a Noise2D; output roughly [-1, 1]. */
export function fbm2D(
  noise: Noise2D,
  x: number,
  y: number,
  octaves = 4,
  lacunarity = 2.02,
  gain = 0.5,
): number {
  let amp = 1;
  let sum = 0;
  let norm = 0;
  let px = x;
  let py = y;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(px, py);
    norm += amp;
    amp *= gain;
    // rotate a little between octaves to hide axis alignment
    const nx = px * lacunarity * 0.8 - py * lacunarity * 0.6;
    const ny = px * lacunarity * 0.6 + py * lacunarity * 0.8;
    px = nx + 17.3;
    py = ny + 9.1;
  }
  return sum / norm;
}
