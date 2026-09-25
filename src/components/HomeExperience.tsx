"use client";

import { useEffect } from "react";
import { AgeGate } from "@/components/intro/AgeGate";
import { BackToValley } from "@/components/hud/BackToValley";
import { DiscoverCta } from "@/components/hud/DiscoverCta";
import { LayerSwitch } from "@/components/hud/LayerSwitch";
import { MapCta } from "@/components/hud/MapCta";
import { ParcelNavigator } from "@/components/hud/ParcelNavigator";
import { SiteChrome } from "@/components/hud/SiteChrome";
import { useExperience } from "@/store/experience";

/**
 * Home: the age gate on top of the WebGL valley (mounted once in the root
 * layout by SceneHost), then the HUD (menu, map toggle, navigator, CTA).
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
    <main className="relative min-h-screen pointer-events-none [&>*]:pointer-events-auto">
      <AgeGate />
      <SiteChrome hideCta={!entered} />
      <MapCta hidden={hudHidden} />
      <LayerSwitch hidden={hudHidden} />
      <BackToValley hidden={hudHidden} />
      <ParcelNavigator hidden={hudHidden} />
      <DiscoverCta hidden={hudHidden} />
    </main>
  );
}
