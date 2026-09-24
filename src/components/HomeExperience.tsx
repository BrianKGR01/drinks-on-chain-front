"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AgeGate } from "@/components/intro/AgeGate";
import { DiscoverCta } from "@/components/hud/DiscoverCta";
import { MapCta } from "@/components/hud/MapCta";
import { ParcelNavigator } from "@/components/hud/ParcelNavigator";
import { SiteChrome } from "@/components/hud/SiteChrome";
import { useExperience } from "@/store/experience";

const Experience3D = dynamic(() => import("@/components/scene/Experience3D"), {
  ssr: false,
  loading: () => null,
});

/**
 * Home: the WebGL valley underneath, the age gate on top until the visitor
 * enters, then the HUD (menu, map toggle, parcel navigator, discover CTA).
 */
export function HomeExperience() {
  const entered = useExperience((s) => s.entered);
  const menuOpen = useExperience((s) => s.menuOpen);
  const setMode = useExperience((s) => s.setMode);

  // Coming back from a content page: make sure we are in an interactive mode.
  useEffect(() => {
    const { entered: e, mode } = useExperience.getState();
    if (e && mode === "intro") setMode("free");
  }, [setMode]);

  const hudHidden = !entered || menuOpen;

  return (
    <main className="relative min-h-screen">
      <Experience3D />
      <AgeGate />
      <SiteChrome hideCta={!entered} />
      <MapCta hidden={hudHidden} />
      <ParcelNavigator hidden={hudHidden} />
      <DiscoverCta hidden={hudHidden} />
    </main>
  );
}
