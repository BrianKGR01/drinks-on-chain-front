"use client";

import * as THREE from "three";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { gsap } from "gsap";
import { SCENE_TOKENS } from "@/lib/scene-contract";
import { VILLAGES, getVillage } from "@/content/villages";
import { useExperience } from "@/store/experience";
import { CameraRig } from "./CameraRig";
import { createHeightField } from "./lib/terrain";
import { World } from "./World";

export interface Experience3DProps {
  /** Extra classes for the fixed full-screen container. */
  className?: string;
}

class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[Experience3D] scene disabled:", error);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Ink-on-paper WebGL centrepiece. Reads `useExperience` for mode / village /
 * active parcel and drives parcel hover + selection back into the store.
 */
export default function Experience3D({ className }: Experience3DProps) {
  const [webgl] = useState(supportsWebGL);
  const villageId = useExperience((s) => s.villageId);
  const [shownId, setShownId] = useState(villageId);
  const shownRef = useRef(villageId);
  const overlayRef = useRef<HTMLDivElement>(null);

  const village = useMemo(() => getVillage(shownId) ?? VILLAGES[0], [shownId]);
  const field = useMemo(() => createHeightField(village), [village]);

  // Intro: the world stays hidden behind paper until the visitor enters,
  // then the paper lifts (the reference reveals the map only after "Entrer").
  const entered = useExperience((s) => s.entered);
  // Initial opacity only: React must not re-apply it while GSAP animates.
  const [initiallyEntered] = useState(() => useExperience.getState().entered);
  useEffect(() => {
    const el = overlayRef.current;
    if (!el || !entered) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tween = gsap.to(el, { opacity: 0, duration: reduced ? 0.1 : 1.6, ease: "power2.inOut", delay: reduced ? 0 : 0.4 });
    return () => {
      tween.kill();
    };
  }, [entered]);

  // Village change: fade to paper, swap the world, reveal.
  useEffect(() => {
    if (shownRef.current === villageId) return;
    const el = overlayRef.current;
    const store = useExperience.getState();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    store.setTransitioning(true);
    const swap = () => {
      shownRef.current = villageId;
      setShownId(villageId);
    };
    if (!el) {
      swap();
      store.setTransitioning(false);
      return;
    }
    const tl = gsap.timeline();
    tl.to(el, { opacity: 1, duration: reduced ? 0.1 : 0.6, ease: "power2.in", onComplete: swap });
    tl.to(el, {
      opacity: 0,
      duration: reduced ? 0.1 : 0.9,
      ease: "power2.out",
      delay: 0.2,
      onComplete: () => useExperience.getState().setTransitioning(false),
    });
    return () => {
      tl.kill();
    };
  }, [villageId]);

  if (!webgl) return null;

  return (
    <SceneErrorBoundary>
      <div className={`fixed inset-0 z-0 ${className ?? ""}`} data-scene-root>
        <Canvas
          style={{ position: "absolute", inset: 0, touchAction: "none" }}
          dpr={[1, 1.75]}
          flat
          frameloop="always"
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 35, near: 4, far: 30000, position: [0, 1200, 1400] }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(SCENE_TOKENS.paper), 0);
          }}
        >
          <Suspense fallback={null}>
            <CameraRig village={village} field={field} />
            <World key={village.id} village={village} field={field} />
          </Suspense>
        </Canvas>
        <div
          ref={overlayRef}
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: SCENE_TOKENS.paper, opacity: initiallyEntered ? 0 : 1 }}
        />
      </div>
    </SceneErrorBoundary>
  );
}
