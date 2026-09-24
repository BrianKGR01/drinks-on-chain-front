"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import type { ParcelSpec, SceneMode, VillageSpec } from "@/lib/scene-contract";
import { useExperience } from "@/store/experience";
import { clamp } from "./lib/prng";
import type { HeightField } from "./lib/terrain";
import { sharedUniforms } from "./lib/uniforms";

const shared = sharedUniforms;

interface Props {
  village: VillageSpec;
  field: HeightField;
}

const DEG = Math.PI / 180;

/** Base spherical pose (tweened with GSAP on mode changes). */
interface Pose {
  radius: number;
  polar: number;
  azimuth: number;
  tx: number;
  ty: number;
  tz: number;
}

/** Damped user offsets layered on top of the base pose. */
interface UserOffsets {
  az: number;
  azT: number;
  pol: number;
  polT: number;
  zoom: number;
  zoomT: number;
  px: number;
  pxT: number;
  pz: number;
  pzT: number;
}

const POLAR_MIN = 25 * DEG;
const POLAR_MAX = 65 * DEG;
const MAP_RADIUS_FACTOR = 1.25;

function goalFor(
  mode: SceneMode,
  village: VillageSpec,
  field: HeightField,
  parcel: ParcelSpec | null,
  currentAzimuth: number,
): Pose {
  const E = village.extent;
  const cy = field.getHeight(0, 0);
  switch (mode) {
    case "intro":
      return { radius: 1.6 * E, polar: 35 * DEG, azimuth: currentAzimuth, tx: 0, ty: cy, tz: 0 };
    case "parcel": {
      if (!parcel) return { radius: 1.05 * E, polar: 52 * DEG, azimuth: currentAzimuth, tx: 0, ty: cy, tz: 0 };
      const [px, pz] = parcel.center;
      return {
        radius: 0.52 * E,
        polar: 50 * DEG,
        azimuth: parcel.rotation + 20 * DEG,
        tx: px,
        ty: field.getHeight(px, pz),
        tz: pz,
      };
    }
    case "map":
      return { radius: MAP_RADIUS_FACTOR * E, polar: 2 * DEG, azimuth: 0, tx: 0, ty: cy, tz: 0 };
    default:
      return { radius: 1.05 * E, polar: 52 * DEG, azimuth: currentAzimuth, tx: 0, ty: cy, tz: 0 };
  }
}

const TWEEN: Record<SceneMode, { duration: number; ease: string }> = {
  intro: { duration: 1.6, ease: "power2.inOut" },
  free: { duration: 2.5, ease: "power2.inOut" },
  parcel: { duration: 2.0, ease: "power3.inOut" },
  map: { duration: 1.8, ease: "power2.inOut" },
};

/**
 * Spherical camera rig: base pose per mode (GSAP) + damped user orbit / zoom / pan.
 * Writes camera transform and shared shader uniforms every frame; no React state.
 */
export function CameraRig({ village, field }: Props) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const mode = useExperience((s) => s.mode);
  const activeIndex = useExperience((s) => s.activeParcelIndex);

  const pose = useRef<Pose>({ radius: village.extent * 1.6, polar: 35 * DEG, azimuth: 0.7, tx: 0, ty: 0, tz: 0 });
  const user = useRef<UserOffsets>({ az: 0, azT: 0, pol: 0, polT: 0, zoom: 1, zoomT: 1, px: 0, pxT: 0, pz: 0, pzT: 0 });
  const reduced = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);
  const lastVillage = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reduced.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Mode / parcel / village → tween the base pose.
  useEffect(() => {
    const p = pose.current;
    const u = user.current;
    // fold user offsets into the base so the tween starts from what is on screen
    p.azimuth += u.az;
    p.polar += u.pol;
    p.radius *= u.zoom;
    p.tx += u.px;
    p.tz += u.pz;
    u.az = u.azT = 0;
    u.pol = u.polT = 0;
    u.zoom = u.zoomT = 1;
    u.px = u.pxT = 0;
    u.pz = u.pzT = 0;

    const parcel = activeIndex !== null ? (village.parcels[activeIndex] ?? null) : null;
    const goal = goalFor(mode, village, field, parcel, p.azimuth);
    let dAz = goal.azimuth - p.azimuth;
    dAz = Math.atan2(Math.sin(dAz), Math.cos(dAz));
    goal.azimuth = p.azimuth + dAz;

    const villageChanged = lastVillage.current !== village.id;
    lastVillage.current = village.id;
    const instant = villageChanged || reduced.current;
    const { duration, ease } = TWEEN[mode];

    tween.current?.kill();
    tween.current = gsap.to(p, {
      radius: goal.radius,
      polar: goal.polar,
      azimuth: goal.azimuth,
      tx: goal.tx,
      ty: goal.ty,
      tz: goal.tz,
      duration: instant ? (reduced.current ? 0.1 : 0) : duration,
      ease,
      overwrite: true,
    });
    return () => {
      tween.current?.kill();
    };
  }, [mode, activeIndex, village, field]);

  useEffect(() => {
    shared.uExtent.value = village.extent;
  }, [village]);

  // Pointer / wheel / touch input.
  useEffect(() => {
    const el = gl.domElement;
    const E = village.extent;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinch0 = 0;
    let zoom0 = 1;

    const canInteract = () => {
      const s = useExperience.getState();
      return s.mode !== "intro" && !s.menuOpen && !s.transitioning;
    };
    const clampOffsets = (m: SceneMode) => {
      const u = user.current;
      const p = pose.current;
      if (m === "map") {
        u.zoomT = clamp(u.zoomT, 0.4 / MAP_RADIUS_FACTOR, 1.6 / MAP_RADIUS_FACTOR);
        u.pxT = clamp(u.pxT, -E, E);
        u.pzT = clamp(u.pzT, -E, E);
        u.azT = 0;
        u.polT = 0;
      } else if (m === "parcel") {
        u.azT = clamp(u.azT, -0.4, 0.4);
        u.polT = clamp(u.polT, -9 * DEG, 9 * DEG);
        u.zoomT = clamp(u.zoomT, 0.8, 1.35);
      } else {
        u.polT = clamp(u.polT, POLAR_MIN - p.polar, POLAR_MAX - p.polar);
        u.zoomT = clamp(u.zoomT, 0.75, 1.35);
      }
    };
    const pinchDist = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const onWheel = (e: WheelEvent) => {
      if (!canInteract()) return;
      const m = useExperience.getState().mode;
      const u = user.current;
      const dy = clamp(e.deltaY, -120, 120);
      if (m === "map") u.zoomT *= Math.exp(dy * 0.0012);
      else u.azT += dy * 0.0015;
      clampOffsets(m);
    };
    const onDown = (e: PointerEvent) => {
      if (!canInteract()) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        pinch0 = pinchDist();
        zoom0 = user.current.zoomT;
      }
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const m = useExperience.getState().mode;
      const u = user.current;
      if (pointers.size >= 2) {
        const d = pinchDist();
        if (pinch0 > 0 && d > 0) u.zoomT = zoom0 * (pinch0 / d);
        clampOffsets(m);
        return;
      }
      if (!canInteract()) return;
      if (m === "map") {
        const cam = camera as THREE.PerspectiveCamera;
        const radius = pose.current.radius * u.zoom;
        const worldPerPx = (2 * radius * Math.tan((cam.fov * DEG) / 2)) / el.clientHeight;
        const az = pose.current.azimuth + u.az;
        const rx = Math.cos(az);
        const rz = -Math.sin(az);
        const fx = -Math.sin(az);
        const fz = -Math.cos(az);
        u.pxT += (-rx * dx + fx * dy) * worldPerPx;
        u.pzT += (-rz * dx + fz * dy) * worldPerPx;
      } else {
        u.azT -= dx * 0.005;
        u.polT -= dy * 0.004;
      }
      clampOffsets(m);
    };
    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch0 = 0;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [gl, camera, village.extent]);

  const target = useRef(new THREE.Vector3());

  useFrame((state, dt) => {
    const p = pose.current;
    const u = user.current;
    const s = useExperience.getState();
    const d = Math.min(dt, 0.05);
    if (s.mode === "intro" && !reduced.current) p.azimuth += 0.5 * DEG * d;

    const k = 1 - Math.pow(1 - 0.08, d * 60);
    u.az += (u.azT - u.az) * k;
    u.pol += (u.polT - u.pol) * k;
    u.zoom += (u.zoomT - u.zoom) * k;
    u.px += (u.pxT - u.px) * k;
    u.pz += (u.pzT - u.pz) * k;

    // Portrait screens see a much narrower slice: back off so the same
    // horizontal extent stays in frame (vertical fov is fixed).
    const aspect = state.size.width / Math.max(1, state.size.height);
    const portraitFix = aspect < 1 ? Math.min(2.2, 1 / aspect) : 1;
    const radius = p.radius * u.zoom * portraitFix;
    const polar = clamp(p.polar + u.pol, 1 * DEG, 82 * DEG);
    const az = p.azimuth + u.az;
    const t = target.current.set(p.tx + u.px, p.ty, p.tz + u.pz);
    const cam = state.camera;
    cam.position.set(
      t.x + radius * Math.sin(polar) * Math.sin(az),
      t.y + radius * Math.cos(polar),
      t.z + radius * Math.sin(polar) * Math.cos(az),
    );
    cam.up.set(0, 1, 0);
    cam.lookAt(t);

    shared.uCamPos.value.copy(cam.position);
    // top-down views see the ground at ~uniform distance: push the fog out there
    const overhead = 1 - clamp((polar - 10 * DEG) / (25 * DEG), 0, 1);
    shared.uFogNear.value = radius * (0.95 + 0.4 * overhead);
    shared.uFogFar.value = radius * (1.9 + 0.7 * overhead);
    shared.uTime.value = state.clock.elapsedTime;
    const dpr = state.viewport.dpr;
    shared.uDpr.value = dpr;
    const fov = cam instanceof THREE.PerspectiveCamera ? cam.fov : 35;
    shared.uPxScale.value = (2 * Math.tan((fov * DEG) / 2)) / (state.size.height * dpr);
    const cloudGoal = s.mode === "map" ? 0.25 : s.mode === "parcel" ? 0.6 : 1;
    shared.uCloudOpacity.value += (cloudGoal - shared.uCloudOpacity.value) * k * 0.5;
  });

  return null;
}
