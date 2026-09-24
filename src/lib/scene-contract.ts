/**
 * Contract shared between the 3D scene (src/components/scene/**) and the
 * rest of the app (HUD, pages, store). Keep this file dependency-free.
 *
 * World units are metres. The XZ plane is the ground; +Y is up.
 * North is -Z (so "top of the map" in map mode points to -Z).
 */

export type Lang = "es" | "en";

export type Localized = Record<Lang, string>;

/** A vineyard plot / bodega parcel drawn on the terrain. */
export interface ParcelSpec {
  id: string;
  slug: string;
  /** Short display name shown in the bottom navigator ("Les Barres" style). */
  name: string;
  /** Centre of the parcel in village-local XZ coordinates. */
  center: [x: number, z: number];
  /** Footprint size (width along the row direction, depth across rows). */
  size: [w: number, d: number];
  /** Rotation of the vine rows in radians around +Y. */
  rotation: number;
  /** Altitude label used for captions (m.s.n.m.). Purely informative. */
  altitude: number;
}

export interface HouseClusterSpec {
  center: [x: number, z: number];
  radius: number;
  count: number;
  /** 0..1 – how regular the grid is (1 = tight orthogonal village core). */
  density: number;
}

export interface ForestPatchSpec {
  center: [x: number, z: number];
  radius: number;
  count: number;
}

export interface LandmarkSpec {
  id: string;
  kind: "church" | "bodega" | "plaza";
  position: [x: number, z: number];
  label?: string;
}

/** A "village": one terrain + one set of parcels (Merfy / Avize equivalent). */
export interface VillageSpec {
  id: string;
  slug: string;
  name: Localized;
  /** Region caption shown rotated on the left edge, e.g. "VALLE CENTRAL DE TARIJA". */
  region: Localized;
  /** Seed for procedural terrain + scatter. Same seed → same world. */
  seed: number;
  /** Half-size of the playable terrain square, in metres. */
  extent: number;
  /**
   * Terrain shape hint for the generator.
   *  - "valley": gentle bowl with hills at the rim
   *  - "canyon": steep walls, flat narrow floor along Z
   *  - "plateau": mostly flat with soft undulations
   */
  relief: "valley" | "canyon" | "plateau";
  /** Vertical scale of the relief in metres. */
  reliefHeight: number;
  parcels: ParcelSpec[];
  houses: HouseClusterSpec[];
  forests: ForestPatchSpec[];
  roads: Array<Array<[x: number, z: number]>>;
  landmarks: LandmarkSpec[];
  /** River / stream polyline (optional). */
  river?: Array<[x: number, z: number]>;
}

/** Camera / interaction mode of the experience. */
export type SceneMode =
  | "intro" // age gate visible, slow ambient drift, no interaction
  | "free" // orbit with scroll / drag, parcels hoverable
  | "parcel" // camera framed on the active parcel
  | "map"; // top-down "carte" view, north up, compass visible

export interface SceneEvents {
  /** Called when a parcel mesh is clicked. */
  onParcelSelect: (parcelId: string) => void;
  /** Called with the hovered parcel id, or null when leaving. */
  onParcelHover: (parcelId: string | null) => void;
  /** Called once the village geometry & shaders are compiled and visible. */
  onReady: () => void;
}

/** Design tokens the scene must match (mirrors globals.css). */
export const SCENE_TOKENS = {
  paper: "#fdfcf5",
  paperShade: "#f4efe2",
  ink: "#2b2622",
  inkSoft: "#6b655b",
  accent: "#b8891f",
  hatchDark: "#3a342e",
} as const;
