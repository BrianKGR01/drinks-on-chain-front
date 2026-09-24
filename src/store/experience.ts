"use client";

import { create } from "zustand";
import type { Lang, SceneMode } from "@/lib/scene-contract";
import { VILLAGES } from "@/content/villages";

interface ExperienceState {
  lang: Lang;
  /** True once the visitor pressed "Entrar" in the age gate. */
  entered: boolean;
  mode: SceneMode;
  villageId: string;
  /** Index into the active village's parcels, or null (none framed). */
  activeParcelIndex: number | null;
  hoveredParcelId: string | null;
  menuOpen: boolean;
  soundOn: boolean;
  sceneReady: boolean;
  /** Set while a village change transition is running (fade to paper). */
  transitioning: boolean;

  setLang: (lang: Lang) => void;
  enter: () => void;
  setMode: (mode: SceneMode) => void;
  toggleMap: () => void;
  setVillage: (villageId: string) => void;
  selectParcel: (index: number | null) => void;
  selectParcelById: (id: string) => void;
  nextParcel: () => void;
  prevParcel: () => void;
  setHovered: (id: string | null) => void;
  toggleMenu: (open?: boolean) => void;
  toggleSound: () => void;
  setSceneReady: (ready: boolean) => void;
  setTransitioning: (t: boolean) => void;
}

export const useExperience = create<ExperienceState>((set, get) => ({
  lang: "es",
  entered: false,
  mode: "intro",
  villageId: VILLAGES[0].id,
  activeParcelIndex: null,
  hoveredParcelId: null,
  menuOpen: false,
  soundOn: false,
  sceneReady: false,
  transitioning: false,

  setLang: (lang) => set({ lang }),
  enter: () => set({ entered: true, mode: "free" }),
  setMode: (mode) => set({ mode }),
  toggleMap: () => {
    const { mode, activeParcelIndex } = get();
    if (mode === "map") {
      set({ mode: activeParcelIndex === null ? "free" : "parcel" });
    } else {
      set({ mode: "map" });
    }
  },
  setVillage: (villageId) => {
    if (villageId === get().villageId) return;
    set({
      villageId,
      activeParcelIndex: null,
      hoveredParcelId: null,
      mode: get().mode === "map" ? "map" : "free",
    });
  },
  selectParcel: (index) =>
    set({
      activeParcelIndex: index,
      mode: index === null ? "free" : "parcel",
    }),
  selectParcelById: (id) => {
    const village = VILLAGES.find((v) => v.id === get().villageId);
    const index = village?.parcels.findIndex((p) => p.id === id) ?? -1;
    if (index >= 0) get().selectParcel(index);
  },
  nextParcel: () => {
    const village = VILLAGES.find((v) => v.id === get().villageId);
    if (!village) return;
    const n = village.parcels.length;
    const cur = get().activeParcelIndex;
    get().selectParcel(cur === null ? 0 : (cur + 1) % n);
  },
  prevParcel: () => {
    const village = VILLAGES.find((v) => v.id === get().villageId);
    if (!village) return;
    const n = village.parcels.length;
    const cur = get().activeParcelIndex;
    get().selectParcel(cur === null ? n - 1 : (cur - 1 + n) % n);
  },
  setHovered: (id) => set({ hoveredParcelId: id }),
  toggleMenu: (open) => set((s) => ({ menuOpen: open ?? !s.menuOpen })),
  toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setTransitioning: (transitioning) => set({ transitioning }),
}));

/** Convenience selectors. */
export const selectActiveVillage = (s: ExperienceState) =>
  VILLAGES.find((v) => v.id === s.villageId) ?? VILLAGES[0];

export const selectActiveParcel = (s: ExperienceState) => {
  const village = selectActiveVillage(s);
  return s.activeParcelIndex === null
    ? null
    : (village.parcels[s.activeParcelIndex] ?? null);
};
