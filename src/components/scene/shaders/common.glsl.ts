/**
 * Shared GLSL chunks: hashes, value noise, fBm and the engraving hatch
 * primitive. Everything is world/object-space based and anti-aliased with
 * screen-space derivatives so lines stay crisp at any zoom.
 */

export const GLSL_NOISE = /* glsl */ `
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}
// cheaper variants for terms that only need broad structure
float fbm3(vec2 p) {
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float v = 0.5 * vnoise(p);
  p = m * p;
  v += 0.25 * vnoise(p);
  p = m * p;
  v += 0.125 * vnoise(p);
  return v;
}
float fbm2(vec2 p) {
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  float v = 0.5 * vnoise(p);
  v += 0.25 * vnoise(m * p);
  return v;
}
`;

export const GLSL_HATCH = /* glsl */ `
// distance (in t units) to the nearest multiple of s
float lineDist(float t, float s) {
  return abs(fract(t / s + 0.5) - 0.5) * s;
}
// anti-aliased line of half-width w (t units) around multiples of s
float lineMask(float t, float s, float w, float aa) {
  float d = lineDist(t, s);
  return 1.0 - smoothstep(w - aa, w + aa, d);
}
/**
 * LOD hatch: parallel lines every 'base' units of t, at least 'minPx'
 * device pixels apart. When lines would get denser than that, spacing
 * doubles (keeping a subset of the same lines) and the extra lines fade out.
 */
float hatch(float t, float base, float widthFrac, float minPx) {
  float px = max(fwidth(t), 1e-6);
  float ratio = px * minPx / base;
  float l = max(0.0, log2(ratio));
  float l0 = floor(l);
  float f = l - l0;
  float s0 = base * exp2(l0);
  float s1 = s0 * 2.0;
  float w0 = max(widthFrac * s0, px * 0.55);
  float w1 = max(widthFrac * s1, px * 0.55);
  float aa = px * 0.75;
  // hairlines thinner than a pixel are drawn lighter instead of wider (sub-pixel coverage)
  float k0 = min(1.0, (widthFrac * s0) / w0);
  float k1 = min(1.0, (widthFrac * s1) / w1);
  float a = lineMask(t, s0, w0, aa) * (1.0 - f) * k0;
  float b = lineMask(t, s1, w1, aa) * k1;
  return max(a, b);
}
`;

export const GLSL_FADE = /* glsl */ `
uniform vec3 uCamPos;
uniform float uFogNear;
uniform float uFogFar;
uniform float uExtent;
// 1 = fully inked, 0 = plain paper (far away or outside the playable extent)
float inkVisibility(vec3 worldPos) {
  float r = length(worldPos.xz);
  float edge = 1.0 - smoothstep(uExtent * 0.80, uExtent * 0.985, r);
  float dist = distance(uCamPos, worldPos);
  float fog = 1.0 - smoothstep(uFogNear, uFogFar, dist);
  return edge * fog;
}
`;
