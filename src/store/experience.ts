"use client";

import { create } from "zustand";
import type { Lang, MapLayer, SceneMode } from "@/lib/scene-contract";
import { VILLAGES } from "@/content/villages";
import { getWinery, wineriesInVillage, wineriesOfParcel } from "@/content/network";

interface ExperienceState {
  lang: Lang;
  /** True once the visitor pressed "Entrar" in the age gate. */
  entered: boolean;
  mode: SceneMode;
  villageId: string;
  /** Index into the active village's parcels, or null (none framed). */
  activeParcelIndex: number | null;
  hoveredParcelId: string | null;
  /** Parcels or partner wineries on top of the valley. */
  layer: MapLayer;
  /** Winery framed by the camera (layer "bodegas"), or null. */
  activeWineryId: string | null;
  hoveredWineryId: string | null;
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
  setLayer: (layer: MapLayer) => void;
  selectWinery: (id: string | null) => void;
  /** Parcel click on the "bodegas" layer: frame the winery that farms it. */
  selectWineryOfParcel: (parcelId: string) => void;
  nextWinery: () => void;
  prevWinery: () => void;
  setHoveredWinery: (id: string | null) => void;
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
  layer: "parcelas",
  activeWineryId: null,
  hoveredWineryId: null,
  menuOpen: false,
  soundOn: false,
  sceneReady: false,
  transitioning: false,

  setLang: (lang) => set({ lang }),
  enter: () => set({ entered: true, mode: "free" }),
  setMode: (mode) => set({ mode }),
  toggleMap: () => {
    const { mode, activeParcelIndex, activeWineryId } = get();
    if (mode === "map") {
      set({ mode: activeWineryId ? "winery" : activeParcelIndex === null ? "free" : "parcel" });
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
      activeWineryId: null,
      hoveredWineryId: null,
      mode: get().mode === "map" ? "map" : "free",
    });
  },
  selectParcel: (index) =>
    set({
      activeParcelIndex: index,
      activeWineryId: null,
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
  setLayer: (layer) => {
    if (layer === get().layer) return;
    const mode = get().mode;
    set({
      layer,
      activeParcelIndex: null,
      activeWineryId: null,
      hoveredParcelId: null,
      hoveredWineryId: null,
      mode: mode === "parcel" || mode === "winery" ? "free" : mode,
    });
  },
  selectWinery: (id) => {
    const winery = id ? getWinery(id) : undefined;
    if (!winery) {
      set({ activeWineryId: null, mode: get().mode === "map" ? "map" : "free" });
      return;
    }
    if (winery.villageId !== get().villageId) get().setVillage(winery.villageId);
    set({ layer: "bodegas", activeWineryId: winery.id, activeParcelIndex: null, mode: "winery" });
  },
  selectWineryOfParcel: (parcelId) => {
    const owner = wineriesOfParcel(parcelId)[0];
    if (owner) get().selectWinery(owner.id);
  },
  nextWinery: () => {
    const list = wineriesInVillage(get().villageId);
    if (list.length === 0) return;
    const cur = list.findIndex((w) => w.id === get().activeWineryId);
    get().selectWinery(list[(cur + 1) % list.length].id);
  },
  prevWinery: () => {
    const list = wineriesInVillage(get().villageId);
    if (list.length === 0) return;
    const cur = list.findIndex((w) => w.id === get().activeWineryId);
    get().selectWinery(list[cur < 0 ? list.length - 1 : (cur - 1 + list.length) % list.length].id);
  },
  setHoveredWinery: (id) => set({ hoveredWineryId: id }),
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

export const selectActiveWinery = (s: ExperienceState) => (s.activeWineryId ? (getWinery(s.activeWineryId) ?? null) : null);
