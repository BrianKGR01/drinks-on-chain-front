import { GLSL_FADE, GLSL_NOISE } from "./common.glsl";

export const RIBBON_VERT = /* glsl */ `
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Roads: paper strip with a thin ink line on each edge. */
export const ROAD_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uWidth;
uniform float uDpr;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  float e = min(vUv.x, 1.0 - vUv.x) * uWidth;
  float px = max(fwidth(e), 1e-5);
  float w = max(0.32, px * 0.8 * uDpr);
  float line = 1.0 - smoothstep(w, w + px * 1.3, e);
  // hand-drawn breaks
  float breaks = smoothstep(0.18, 0.32, vnoise(vec2(vUv.y * 0.09, vUv.x * 3.0)));
  line *= mix(1.0, breaks, 0.5);
  float vis = inkVisibility(vWorldPos);
  gl_FragColor = vec4(mix(uPaper, uInk, line * 0.88 * vis), 1.0);
}
`;

/** River: paper strip with three wavy soft-ink lines. */
export const RIVER_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uInkSoft;
uniform float uWidth;
uniform float uDpr;
varying vec3 vWorldPos;
varying vec2 vUv;
void main() {
  float x = vUv.x * uWidth;
  float px = max(fwidth(x), 1e-5);
  float w = max(0.28, px * 0.75 * uDpr);
  float ink = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float cx = uWidth * (0.2 + 0.3 * fi) + sin(vUv.y * 0.11 + fi * 2.1) * uWidth * 0.06 + (vnoise(vec2(vUv.y * 0.05, fi)) - 0.5) * uWidth * 0.1;
    float d = abs(x - cx);
    float l = 1.0 - smoothstep(w, w + px * 1.3, d);
    // dashes
    float dash = smoothstep(0.3, 0.45, vnoise(vec2(vUv.y * 0.08 + fi * 7.0, fi * 3.0)));
    ink = max(ink, l * mix(0.55, 1.0, dash));
  }
  // outer banks slightly darker
  float bank = 1.0 - smoothstep(0.0, px * 1.2, min(x, uWidth - x));
  float vis = inkVisibility(vWorldPos);
  vec3 col = mix(uPaper, uInkSoft, ink * 0.9 * vis);
  col = mix(col, uInk, bank * 0.5 * vis);
  gl_FragColor = vec4(col, 1.0);
}
`;
