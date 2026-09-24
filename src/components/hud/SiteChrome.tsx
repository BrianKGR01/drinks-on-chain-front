"use client";

import { MainCta } from "@/components/hud/MainCta";
import { MainMenu } from "@/components/menu/MainMenu";
import { useExperience } from "@/store/experience";

/** MENU button + the overlay menu; shared by every route. */
export function SiteChrome({ hideCta = false }: { hideCta?: boolean }) {
  const menuOpen = useExperience((s) => s.menuOpen);
  return (
    <>
      <MainCta hidden={hideCta || menuOpen} />
      <MainMenu />
    </>
  );
}
