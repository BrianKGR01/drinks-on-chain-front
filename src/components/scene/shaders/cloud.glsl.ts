import { GLSL_NOISE } from "./common.glsl";

export const CLOUD_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const CLOUD_FRAG = /* glsl */ `
${GLSL_NOISE}
uniform float uSeed;
uniform float uTime;
uniform float uCloudOpacity;
uniform vec3 uPaperShade;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p * vec2(1.0, 1.35));
  float n = fbm(vUv * 2.6 + uSeed * 7.0 + uTime * 0.004);
  n += 0.30 * fbm(vUv * 7.0 - uSeed * 3.0 - uTime * 0.006);
  float shape = smoothstep(1.0, 0.15, r);
  float a = smoothstep(0.50, 0.82, n * 1.25 * shape);
  // faint darker rim so the puff reads on cream paper
  float rim = smoothstep(0.42, 0.52, n * 1.25 * shape) - a;
  vec3 col = mix(vec3(1.0), uPaperShade, rim * 0.8);
  gl_FragColor = vec4(col, (a * 0.85 + rim * 0.35) * uCloudOpacity);
}
`;
