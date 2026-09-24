import { GLSL_FADE, GLSL_HATCH, GLSL_NOISE } from "./common.glsl";

export const PARCEL_VERT = /* glsl */ `
attribute vec2 aLocal;
varying vec3 vWorldPos;
varying vec2 vUv;
varying vec2 vLocal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vUv = uv;
  vLocal = aLocal;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const PARCEL_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_HATCH}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uDpr;
uniform float uActive;
uniform float uHover;
uniform vec2 uSize;
uniform float uSeed;
varying vec3 vWorldPos;
varying vec2 vUv;
varying vec2 vLocal;

void main() {
  float minPx = 4.6 * uDpr;
  // vine rows: dense parallel lines along local X, spaced 2.5 m across (local Z)
  float wob = (vnoise(vLocal * vec2(0.12, 0.5) + uSeed) - 0.5) * 0.55;
  float rows = hatch(vLocal.y + wob, 2.5, 0.085, minPx);
  // small gaps along the rows (hand strokes)
  float gaps = smoothstep(0.22, 0.42, vnoise(vLocal * vec2(0.28, 1.1) + uSeed * 3.0));
  rows *= mix(1.0, gaps, 0.45);

  // headland margin + outline
  vec2 e = min(vUv, 1.0 - vUv) * uSize;
  float ed = min(e.x, e.y);
  float epx = max(fwidth(ed), 1e-5);
  float outlineW = max(0.55, epx * 0.9 * uDpr);
  float outline = 1.0 - smoothstep(outlineW, outlineW + epx * 1.4, ed);
  rows *= smoothstep(1.6, 4.0, ed);

  float vis = inkVisibility(vWorldPos);
  float hi = max(uActive, uHover);
  vec3 hoverTint = mix(uAccent, uPaper, 0.22);
  vec3 lineCol = mix(mix(uInk, hoverTint, uHover), uAccent, uActive);
  float ink = max(rows * (0.78 + 0.22 * hi), outline * 0.95) * vis;
  vec3 fill = mix(uPaper, uAccent, (uActive * 0.075 + uHover * 0.04) * vis);
  vec3 col = mix(fill, lineCol, ink);
  gl_FragColor = vec4(col, 1.0);
}
`;
