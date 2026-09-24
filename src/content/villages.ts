import type { VillageSpec } from "@/lib/scene-contract";

/**
 * Geometry of the two "villages" (the Merfy / Avize equivalents).
 *
 * Parcel names, slugs and altitudes are real, sourced wine zones of the
 * Valle Central de Tarija and the Valle de Cinti (see docs/FUENTES-CONTENIDO.md).
 * Positions, sizes and the village layout are illustrative: the map is a
 * drawing, not a survey, until the bodegas provide parcel geometry.
 */

const deg = (d: number) => (d * Math.PI) / 180;

export const TARIJA: VillageSpec = {
  id: "tarija",
  slug: "valle-central-de-tarija",
  name: { es: "Valle Central de Tarija", en: "Tarija Central Valley" },
  region: { es: "VALLE CENTRAL DE TARIJA", en: "TARIJA CENTRAL VALLEY" },
  seed: 1683,
  extent: 900,
  relief: "valley",
  reliefHeight: 140,
  parcels: [
    { id: "t01", slug: "santa-ana-la-vieja", name: "Santa Ana la Vieja", center: [-420, 260], size: [150, 110], rotation: deg(18), altitude: 1822 },
    { id: "t02", slug: "valle-de-la-concepcion", name: "Valle de la Concepción", center: [-250, 330], size: [180, 120], rotation: deg(18), altitude: 1710 },
    { id: "t03", slug: "calamuchita", name: "Calamuchita", center: [-70, 360], size: [140, 100], rotation: deg(-8), altitude: 1688 },
    { id: "t04", slug: "chocloca", name: "Chocloca", center: [120, 380], size: [170, 130], rotation: deg(-8), altitude: 1806 },
    { id: "t05", slug: "el-portillo", name: "El Portillo", center: [330, 300], size: [130, 100], rotation: deg(30), altitude: 1859 },
    { id: "t06", slug: "sunchuhuayco", name: "Sunchuhuayco", center: [420, 120], size: [160, 120], rotation: deg(30), altitude: 1718 },
    { id: "t07", slug: "chaguaya", name: "Chaguaya", center: [-480, 40], size: [140, 140], rotation: deg(60), altitude: 2095 },
    { id: "t08", slug: "san-lorenzo", name: "San Lorenzo", center: [-360, -260], size: [170, 120], rotation: deg(-25), altitude: 2002 },
    { id: "t09", slug: "sella-mendez", name: "Sella Méndez", center: [-150, -380], size: [150, 110], rotation: deg(-25), altitude: 2102 },
    { id: "t10", slug: "yesera", name: "Yesera", center: [60, -360], size: [130, 100], rotation: deg(5), altitude: 2230 },
    { id: "t11", slug: "colon-norte", name: "Colón Norte", center: [260, -340], size: [160, 120], rotation: deg(5), altitude: 1762 },
    { id: "t12", slug: "la-angostura", name: "La Angostura", center: [470, -160], size: [130, 130], rotation: deg(-40), altitude: 1696 },
    { id: "t13", slug: "santa-ana-la-nueva", name: "Santa Ana la Nueva", center: [-200, 120], size: [110, 90], rotation: deg(18), altitude: 1920 },
    { id: "t14", slug: "torrecillas", name: "Torrecillas", center: [220, 160], size: [120, 100], rotation: deg(-8), altitude: 1878 },
  ],
  houses: [
    { center: [0, 0], radius: 210, count: 260, density: 0.85 },
    { center: [-60, -140], radius: 120, count: 60, density: 0.5 },
    { center: [300, 40], radius: 90, count: 35, density: 0.3 },
  ],
  forests: [
    { center: [-620, -500], radius: 260, count: 320 },
    { center: [600, -560], radius: 240, count: 280 },
    { center: [640, 520], radius: 200, count: 220 },
    { center: [-30, 600], radius: 160, count: 140 },
    { center: [-620, 560], radius: 180, count: 160 },
  ],
  roads: [
    [[-900, 60], [-520, 40], [-220, 10], [0, 0], [240, -20], [560, -60], [900, -90]],
    [[0, -900], [-20, -420], [10, -180], [0, 0], [30, 200], [60, 480], [40, 900]],
    [[-420, 260], [-250, 330], [-70, 360], [120, 380], [330, 300], [420, 120]],
    [[-360, -260], [-150, -380], [60, -360], [260, -340], [470, -160]],
  ],
  landmarks: [
    { id: "iglesia", kind: "church", position: [8, -18], label: "Catedral" },
    { id: "plaza", kind: "plaza", position: [0, 0] },
    { id: "bodega-1", kind: "bodega", position: [-250, 330], label: "Bodega" },
    { id: "bodega-2", kind: "bodega", position: [420, 120], label: "Bodega" },
  ],
  river: [[-900, 420], [-560, 330], [-300, 250], [-120, 180], [80, 120], [360, 60], [700, -80], [900, -120]],
};

export const CINTI: VillageSpec = {
  id: "cinti",
  slug: "valle-de-cinti",
  name: { es: "Valle de Cinti", en: "Cinti Valley" },
  region: { es: "VALLE DE CINTI · CHUQUISACA", en: "CINTI VALLEY · CHUQUISACA" },
  seed: 2026,
  extent: 900,
  relief: "canyon",
  reliefHeight: 260,
  parcels: [
    { id: "c01", slug: "camargo", name: "Camargo", center: [-60, 40], size: [140, 90], rotation: deg(4), altitude: 2421 },
    { id: "c02", slug: "villa-abecia", name: "Villa Abecia", center: [40, -320], size: [130, 90], rotation: deg(-6), altitude: 2311 },
    { id: "c03", slug: "las-carreras", name: "Las Carreras", center: [-30, 420], size: [150, 100], rotation: deg(6), altitude: 2327 },
    { id: "c04", slug: "san-pedro", name: "San Pedro", center: [90, 220], size: [120, 80], rotation: deg(4), altitude: 2340 },
    { id: "c05", slug: "palca-grande", name: "Palca Grande", center: [-90, -160], size: [120, 90], rotation: deg(-4), altitude: 2343 },
    { id: "c06", slug: "isuma", name: "Isuma", center: [70, -560], size: [110, 80], rotation: deg(-10), altitude: 2400 },
    { id: "c07", slug: "el-chilcar", name: "El Chilcar", center: [-80, 620], size: [120, 90], rotation: deg(8), altitude: 2310 },
    { id: "c08", slug: "san-roque", name: "San Roque", center: [110, -60], size: [100, 80], rotation: deg(0), altitude: 2400 },
  ],
  houses: [
    { center: [0, 0], radius: 150, count: 150, density: 0.8 },
    { center: [30, -330], radius: 70, count: 30, density: 0.4 },
  ],
  forests: [
    { center: [-160, 500], radius: 120, count: 120 },
    { center: [170, 300], radius: 90, count: 80 },
    { center: [-170, -420], radius: 100, count: 90 },
  ],
  roads: [
    [[0, -900], [20, -560], [-10, -320], [0, -60], [0, 0], [20, 220], [-10, 420], [0, 620], [0, 900]],
    [[-300, 40], [-60, 40], [110, -60], [300, -80]],
  ],
  landmarks: [
    { id: "iglesia-camargo", kind: "church", position: [-12, 14], label: "Iglesia" },
    { id: "bodega-cinti", kind: "bodega", position: [-60, 40], label: "Bodega" },
  ],
  river: [[-40, -900], [-30, -500], [-50, -200], [-40, 100], [-60, 400], [-50, 700], [-40, 900]],
};

export const VILLAGES: VillageSpec[] = [TARIJA, CINTI];

export const getVillage = (idOrSlug: string) =>
  VILLAGES.find((v) => v.id === idOrSlug || v.slug === idOrSlug);

export const getParcel = (villageIdOrSlug: string, parcelSlug: string) => {
  const village = getVillage(villageIdOrSlug);
  const parcel = village?.parcels.find((p) => p.slug === parcelSlug || p.id === parcelSlug);
  return village && parcel ? { village, parcel } : undefined;
};
