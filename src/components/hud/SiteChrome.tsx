"use client";

import { MainCta } from "@/components/hud/MainCta";
import { MainMenu } from "@/components/menu/MainMenu";
import { SoundToggle } from "@/components/hud/SoundToggle";
import { useExperience } from "@/store/experience";

/** MENU button, sound control and the overlay menu; shared by every route. */
export function SiteChrome({ hideCta = false }: { hideCta?: boolean }) {
  const menuOpen = useExperience((s) => s.menuOpen);
  return (
    <>
      <MainCta hidden={hideCta || menuOpen} />
      <SoundToggle hidden={hideCta || menuOpen} />
      <MainMenu />
    </>
  );
}
