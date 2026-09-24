import { GLSL_FADE, GLSL_HATCH, GLSL_NOISE } from "./common.glsl";

/**
 * Vertex shader shared by houses / landmarks / trees. Uses three's chunks so
 * `USE_INSTANCING` (set automatically for InstancedMesh) is handled.
 */
export const OBJECT_VERT = /* glsl */ `
#include <common>
attribute float aPart;
#ifdef USE_INSTANCING
attribute float aSeed;
#endif
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vLocal;
varying float vPart;
varying float vSeed;
void main() {
  #include <beginnormal_vertex>
  #include <defaultnormal_vertex>
  #include <begin_vertex>
  #include <project_vertex>
  vec4 wp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
  wp = instanceMatrix * wp;
  vSeed = aSeed;
  #else
  vSeed = 0.37;
  #endif
  wp = modelMatrix * wp;
  vWorldPos = wp.xyz;
  vWorldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
  vLocal = position;
  vPart = aPart;
}
`;

export const HOUSE_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_HATCH}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uLight;
uniform float uDpr;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vLocal;
varying float vPart;
varying float vSeed;
void main() {
  vec3 n = normalize(vWorldNormal);
  float facing = dot(n, uLight);
  float dark = smoothstep(0.42, -0.25, facing);
  // roofs facing away get denser hatch than walls
  float roof = smoothstep(0.2, 0.45, n.y) * (1.0 - smoothstep(0.93, 0.99, n.y));
  dark = clamp(dark * (0.7 + 0.5 * roof), 0.0, 1.0);
  vec3 wp = vWorldPos;
  float wob = (vnoise(wp.xz * 0.9 + wp.y * 0.6 + vSeed * 10.0) - 0.5) * 0.35;
  float t = dot(wp, vec3(0.52, 0.72, 0.46)) + wob;
  float t2 = dot(wp, vec3(-0.6, 0.65, 0.47)) - wob;
  float minPx = 3.0 * uDpr;
  float h1 = hatch(t, 0.85, 0.15 + 0.08 * dark, minPx) * smoothstep(0.18, 0.55, dark);
  float h2 = hatch(t2, 0.85, 0.13, minPx) * smoothstep(0.72, 1.0, dark);
  float vis = inkVisibility(wp);
  float ink = max(h1, h2) * vis;
  gl_FragColor = vec4(mix(uPaper, uInk, ink * 0.85), 1.0);
}
`;

export const TREE_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_HATCH}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform vec3 uLight;
uniform float uDpr;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
varying vec3 vLocal;
varying float vPart;
varying float vSeed;
void main() {
  float vis = inkVisibility(vWorldPos);
  if (vPart < 0.5) {
    gl_FragColor = vec4(mix(uPaper, uInk, 0.75 * vis), 1.0);
    return;
  }
  vec3 n = normalize(vWorldNormal);
  float facing = dot(n, uLight);
  float dark = 0.28 + 0.72 * smoothstep(0.55, -0.45, facing);
  vec3 lp = vLocal;
  float wob = (vnoise(lp.xz * 2.2 + lp.y * 1.7 + vSeed * 20.0) - 0.5) * 0.7;
  float t = dot(lp, vec3(0.6, 0.5, 0.62)) + wob;
  float t2 = dot(lp, vec3(-0.55, 0.62, 0.56)) - wob * 0.8;
  float minPx = 2.8 * uDpr;
  float h1 = hatch(t, 0.2, 0.17, minPx) * smoothstep(0.18, 0.5, dark);
  float h2 = hatch(t2, 0.2, 0.15, minPx) * smoothstep(0.62, 1.0, dark);
  float ink = max(h1, h2) * vis;
  gl_FragColor = vec4(mix(uPaper, uInk, ink * 0.85), 1.0);
}
`;

/** Inverted-hull outline with constant device-pixel thickness. */
export const HULL_VERT = /* glsl */ `
attribute vec3 aOutlineDir;
uniform float uPxScale;
uniform float uDpr;
uniform float uThickness;
varying vec3 vWorldPos;
void main() {
  vec4 wp = vec4(position, 1.0);
  vec3 dir = aOutlineDir;
  #ifdef USE_INSTANCING
  wp = instanceMatrix * wp;
  dir = mat3(instanceMatrix) * dir;
  #endif
  wp = modelMatrix * wp;
  dir = normalize(mat3(modelMatrix) * dir);
  vec4 vp = viewMatrix * wp;
  float worldPerPx = max(-vp.z, 1.0) * uPxScale;
  wp.xyz += dir * worldPerPx * uThickness * uDpr;
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const HULL_FRAG = /* glsl */ `
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
varying vec3 vWorldPos;
void main() {
  float vis = inkVisibility(vWorldPos);
  gl_FragColor = vec4(mix(uPaper, uInk, 0.92 * vis), 1.0);
}
`;

/** 1px GL line outlines; `INSTANCED` define enables the manual instance matrix. */
export const LINE_VERT = /* glsl */ `
#ifdef INSTANCED
attribute mat4 instanceMatrix;
#endif
varying vec3 vWorldPos;
void main() {
  vec4 wp = vec4(position, 1.0);
  #ifdef INSTANCED
  wp = instanceMatrix * wp;
  #endif
  wp = modelMatrix * wp;
  vWorldPos = wp.xyz;
  vec4 vp = viewMatrix * wp;
  // pull the line a hair toward the camera so it wins the depth test against faces
  vp.xyz *= 0.9975;
  gl_Position = projectionMatrix * vp;
}
`;

export const LINE_FRAG = /* glsl */ `
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uInk;
uniform float uStrength;
varying vec3 vWorldPos;
void main() {
  float vis = inkVisibility(vWorldPos);
  gl_FragColor = vec4(mix(uPaper, uInk, uStrength * vis), 1.0);
}
`;
