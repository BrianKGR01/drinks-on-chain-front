import { GLSL_FADE, GLSL_HATCH, GLSL_NOISE } from "./common.glsl";

export const TERRAIN_VERT = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vNormal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

export const TERRAIN_FRAG = /* glsl */ `
${GLSL_NOISE}
${GLSL_HATCH}
${GLSL_FADE}
uniform vec3 uPaper;
uniform vec3 uPaperShade;
uniform vec3 uInk;
uniform vec3 uLight;
uniform float uDpr;
uniform float uTime;
uniform vec4 uClouds[8];
varying vec3 vWorldPos;
varying vec3 vNormal;

void main() {
  vec3 n = normalize(vNormal);
  vec2 p = vWorldPos.xz;
  float slope = 1.0 - n.y;
  float facing = dot(n, uLight);
  float flatFacing = uLight.y;
  // slopes turned away from the light → shadow; slopes facing it → fewer lines
  float formAmt = smoothstep(0.015, 0.11, slope);
  // steep relief is already described by its form lines: keep its shadow tone lighter
  float shade = smoothstep(flatFacing - 0.04, flatFacing - 0.55, facing) * (1.0 - 0.45 * formAmt);
  float lit = smoothstep(flatFacing + 0.02, flatFacing + 0.30, facing);

  // large-scale organic variation so hatch appears in patches, like an engraver's hand
  float variation = fbm(p * 0.0035 + 3.7) - 0.5;
  float fineVar = fbm(p * 0.02 + 11.0) - 0.5;

  // cloud shadows (faked from the drifting cloud planes)
  float cloud = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 c = uClouds[i];
    if (c.z <= 0.0) continue;
    float d = distance(p, c.xy);
    float m = smoothstep(c.z, c.z * 0.25, d) * c.w;
    m *= 0.55 + 0.45 * fbm(p * 0.006 + c.xy * 0.001 + uTime * 0.01);
    cloud = max(cloud, m);
  }

  // shading tone: shadow side, organic variation, cloud wash (slope adds a little)
  float darkness = shade * 0.6 + min(slope * 1.2, 0.2) * (1.0 - 0.7 * lit) + variation * 0.38 + fineVar * 0.14 + cloud * 0.40;
  darkness = clamp(darkness, 0.0, 1.0);

  float minPx = 5.6 * uDpr;
  float base = 6.5;

  // 1) form lines: follow the relief (constant height), denser as the slope steepens
  float ty = vWorldPos.y + (vnoise(p * 0.03) - 0.5) * 1.6 + (vnoise(p * 0.2) - 0.5) * 0.25;
  float formBreaks = smoothstep(0.22, 0.42, vnoise(p * 0.035 + 5.0));
  float form = hatch(ty, 3.2, 0.065 + 0.05 * darkness, minPx) * formAmt * mix(1.0, formBreaks, 0.6);

  // 2) straight hachure shading on the shadow side (fixed direction, hand wobble)
  vec2 dir = normalize(vec2(0.82, 0.57));
  vec2 perp = vec2(-dir.y, dir.x);
  float wobble = (vnoise(p * 0.045) - 0.5) * 2.6 + (vnoise(p * 0.3) - 0.5) * 0.5;
  float t1 = dot(p, perp) + wobble;
  float along = dot(p, dir);
  float breaks = smoothstep(0.28, 0.5, vnoise(vec2(along * 0.06, t1 * 0.35)));
  float l1 = hatch(t1, base, 0.06 + 0.07 * darkness, minPx) * smoothstep(0.16, 0.42, darkness) * mix(1.0, breaks, 0.75) * (1.0 - 0.4 * formAmt);
  float l2 = hatch(t1, base * 0.5, 0.06 + 0.05 * darkness, minPx) * smoothstep(0.6, 0.84, darkness) * (1.0 - 0.85 * formAmt);

  // 3) cross-hatch in the darkest zones (~55 degrees off)
  vec2 crossDir = normalize(perp * 0.57 + dir * 0.82);
  float t2 = dot(p, crossDir) - wobble * 0.7;
  float l3 = hatch(t2, base * 1.1, 0.08, minPx) * smoothstep(0.8, 1.0, darkness) * (1.0 - 0.8 * formAmt);

  float ink = max(max(form, l1), max(l2, l3));

  // faint topographic contours every 10 m
  float cy = vWorldPos.y;
  float cpx = max(fwidth(cy), 1e-5);
  float cd = lineDist(cy + (vnoise(p * 0.08) - 0.5) * 0.6, 10.0);
  float contour = (1.0 - smoothstep(cpx * 0.5, cpx * 1.5, cd)) * smoothstep(0.006, 0.045, slope) * 0.22;

  float vis = inkVisibility(vWorldPos);
  ink = clamp(ink + contour, 0.0, 1.0) * vis;

  // paper: grain + a whisper of wash in shadow / under clouds
  float grain = vnoise(p * 1.7) * 0.6 + vnoise(p * 0.45) * 0.4;
  float wash = (0.30 * shade + 0.28 * cloud) * vis;
  vec3 paper = mix(uPaper, uPaperShade, clamp(wash + grain * 0.10, 0.0, 1.0));
  vec3 col = mix(paper, uInk, ink * 0.86);
  gl_FragColor = vec4(col, 1.0);
}
`;
