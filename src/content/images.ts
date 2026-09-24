import type { Localized } from "@/lib/scene-contract";

/**
 * Photographs used by the site. Every file lives under /public/images and is
 * a freely licensed picture from Wikimedia Commons (CC BY, CC BY-SA or public
 * domain). Full attribution table: docs/CREDITOS-IMAGENES.md.
 */

export interface ImageEntry {
  src: string;
  alt: Localized;
  caption: Localized;
  /** Attribution line to display near the image (author · licence · source). */
  credit: string;
}

const img = (src: string, alt: Localized, caption: Localized, credit: string): ImageEntry => ({ src, alt, caption, credit });

/* ---------------------------------- Tarija -------------------------------- */

const santaAnaKohlberg = img(
  "/images/tarija/vinedos-kohlberg-valle-de-santa-ana.jpg",
  { es: "Viñedos de la Hacienda Kohlberg en el valle de Santa Ana, Tarija", en: "Kohlberg estate vineyards in the Santa Ana valley, Tarija" },
  { es: "Viñedos de Kohlberg en el valle de Santa Ana, provincia Cercado.", en: "Kohlberg vineyards in the Santa Ana valley, Cercado province." },
  "Ruditaly · CC BY-SA 4.0 · Wikimedia Commons",
);
const valleSantaAna = img(
  "/images/tarija/valle-de-santa-ana.jpg",
  { es: "Vista del valle de Santa Ana y su río, Tarija", en: "View of the Santa Ana valley and river, Tarija" },
  { es: "El valle de Santa Ana, cuadrilátero de las grandes bodegas tarijeñas.", en: "The Santa Ana valley, home turf of Tarija's big wineries." },
  "Ruditaly · CC BY-SA 4.0 · Wikimedia Commons",
);
const fincaEstherOrtiz = img(
  "/images/tarija/finca-esther-ortiz-campos-de-solana.jpg",
  { es: "Viñedos de la finca Esther Ortiz, de Campos de Solana, junto al río Santa Ana", en: "Vineyards of the Esther Ortiz estate, Campos de Solana, by the Santa Ana river" },
  { es: "Finca Esther Ortiz (Campos de Solana), valle de Santa Ana.", en: "Esther Ortiz estate (Campos de Solana), Santa Ana valley." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const haciendaDonJulio = img(
  "/images/tarija/hacienda-don-julio-kohlberg.jpg",
  { es: "Viñedos de la Hacienda Don Julio (Kohlberg) junto al río Santa Ana", en: "Hacienda Don Julio (Kohlberg) vineyards next to the Santa Ana river" },
  { es: "Hacienda Don Julio, donde Kohlberg vinifica el Block 63.", en: "Hacienda Don Julio, where Kohlberg makes Block 63." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const valleConcepcion = img(
  "/images/tarija/valle-de-la-concepcion.jpg",
  { es: "Parrales en el Valle de la Concepción, Tarija", en: "Vine arbours in Valle de la Concepción, Tarija" },
  { es: "Los valles cálidos de Uriondo, donde se produce la mayor parte de la uva boliviana.", en: "The warm valleys of Uriondo, where most Bolivian grapes are grown." },
  "Franz Tamayo Daza · CC BY-SA 4.0 · Wikimedia Commons",
);
const parralesConcepcion = img(
  "/images/tarija/parrales-valle-de-la-concepcion.jpg",
  { es: "Parrales de uva en el Valle de la Concepción", en: "Grape arbours in Valle de la Concepción" },
  { es: "Parral tradicional del Valle de la Concepción.", en: "Traditional arbour in Valle de la Concepción." },
  "Franz Tamayo Daza · CC BY-SA 4.0 · Wikimedia Commons",
);
const casaVieja = img(
  "/images/tarija/casa-vieja-valle-de-la-concepcion.jpg",
  { es: "Patio de La Casa Vieja, hacienda colonial del Valle de la Concepción", en: "Courtyard of La Casa Vieja, a colonial hacienda in Valle de la Concepción" },
  { es: "La Casa Vieja, unos cuatro siglos de hacienda y vino patero.", en: "La Casa Vieja, some four centuries of hacienda and patero wine." },
  "Suomi 1973 · CC BY-SA 3.0 · Wikimedia Commons",
);
const parralesCasaVieja = img(
  "/images/tarija/parrales-casa-vieja-uriondo.jpg",
  { es: "Parrales en reposo invernal de la hacienda Casa Vieja, Uriondo", en: "Dormant winter arbours at the Casa Vieja hacienda, Uriondo" },
  { es: "Parrales de la Casa Vieja en invierno.", en: "Casa Vieja arbours in winter." },
  "Carlillasa · CC BY-SA 4.0 · Wikimedia Commons",
);
const vendimiaDron = img(
  "/images/tarija/vendimia-dron-tarija.jpg",
  { es: "Vista aérea de viñedos de Tarija durante la vendimia", en: "Aerial view of Tarija vineyards during harvest" },
  { es: "Vendimia en el Valle Central de Tarija, vista desde un dron.", en: "Harvest in Tarija's Central Valley, seen from a drone." },
  "Andres MacLean · CC BY-SA 4.0 · Wikimedia Commons",
);
const sanLorenzo = img(
  "/images/tarija/san-lorenzo-vista-norte.jpg",
  { es: "Vista de San Lorenzo hacia el norte, con la iglesia al centro", en: "View of San Lorenzo looking north, church in the centre" },
  { es: "San Lorenzo, donde se documentó la primera viña de Tarija (1589–1590).", en: "San Lorenzo, where Tarija's first vineyard was recorded (1589–1590)." },
  "Ruditaly · CC BY-SA 4.0 · Wikimedia Commons",
);
const cultivosGuadalquivir = img(
  "/images/tarija/cultivos-guadalquivir-san-lorenzo.jpg",
  { es: "Cultivos junto al río Guadalquivir, al este de San Lorenzo", en: "Crops beside the Guadalquivir river, east of San Lorenzo" },
  { es: "La vega del Guadalquivir en el municipio de San Lorenzo.", en: "The Guadalquivir floodplain in San Lorenzo municipality." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const tolomosa = img(
  "/images/tarija/paisaje-tolomosa.jpg",
  { es: "Paisaje de Tolomosa, Tarija", en: "Landscape of Tolomosa, Tarija" },
  { es: "Tolomosa, «camino al valle de Chaguaya», citada en los registros de 1590.", en: "Tolomosa, \"on the road to the Chaguaya valley\", named in the 1590 records." },
  "Freesia Alba · CC BY-SA 4.0 · Wikimedia Commons",
);
const sanJacinto = img(
  "/images/tarija/embalse-san-jacinto-tolomosa.jpg",
  { es: "Embalse de San Jacinto visto desde el sur", en: "San Jacinto reservoir seen from the south" },
  { es: "El embalse de San Jacinto, que riega el suroeste del Valle Central.", en: "The San Jacinto reservoir, which irrigates the southwest of the Central Valley." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const canonAngostura = img(
  "/images/tarija/canon-de-la-angostura.jpg",
  { es: "Cañón de la Angostura sobre el puente del río Camacho", en: "Angostura canyon over the Camacho river bridge" },
  { es: "El cañón de la Angostura, salida del antiguo lago del Valle Central.", en: "The Angostura canyon, outlet of the Central Valley's ancient lake." },
  "Vanesa Portillo · CC BY-SA 4.0 · Wikimedia Commons",
);

/* ---------------------------------- Bodegas ------------------------------- */

const alambiqueCasaReal = img(
  "/images/bodegas/alambique-casa-real.jpg",
  { es: "Alambique de la destilería Casa Real, fabricado por Chaudronnerie Cognaçaise", en: "Still at the Casa Real distillery, built by Chaudronnerie Cognaçaise" },
  { es: "Alambique de cobre de origen cognaçais en Casa Real, Santa Ana.", en: "Cognac-region copper still at Casa Real, Santa Ana." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const destileriaCasaReal = img(
  "/images/bodegas/destileria-casa-real-santa-ana.jpg",
  { es: "Entrada a la destilería de singani Casa Real en el valle de Santa Ana", en: "Entrance to the Casa Real singani distillery in the Santa Ana valley" },
  { es: "Casa Real, destilando singani en Santa Ana desde 1925.", en: "Casa Real, distilling singani in Santa Ana since 1925." },
  "Ruditaly · CC BY-SA 4.0 · Wikimedia Commons",
);
const losParrales = img(
  "/images/bodegas/singani-los-parrales-doble-oro.jpg",
  { es: "Botellas de Singani Los Parrales Reserva Doble Oro", en: "Bottles of Singani Los Parrales Reserva Doble Oro" },
  { es: "Los Parrales Reserva Doble Oro, de Bodegas Kuhlmann (El Portillo).", en: "Los Parrales Reserva Doble Oro, by Bodegas Kuhlmann (El Portillo)." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const insignia = img(
  "/images/bodegas/singani-insignia-aranjuez.jpg",
  { es: "Botellas de Singani Insignia de Bodegas Aranjuez con sus tres etiquetas", en: "Bottles of Singani Insignia by Bodegas Aranjuez with its three labels" },
  { es: "Insignia, el singani de Aranjuez destilado con Moscatel de Chaguaya.", en: "Insignia, Aranjuez's singani distilled from Chaguaya Muscat." },
  "Ruditaly · CC BY 4.0 · Wikimedia Commons",
);
const unico = img(
  "/images/bodegas/campos-de-solana-tannat-unico.jpg",
  { es: "Botella de Campos de Solana Tannat Único", en: "Bottle of Campos de Solana Tannat Único" },
  { es: "Tannat Único de Campos de Solana, platino en Decanter 2016.", en: "Campos de Solana's Tannat Único, Platinum at Decanter 2016." },
  "EEJCC · CC BY-SA 4.0 · Wikimedia Commons",
);
const rujero = img(
  "/images/bodegas/singani-rujero.jpg",
  { es: "Botella de Singani Rujero", en: "Bottle of Singani Rujero" },
  { es: "Rujero, el singani de Bodegas La Concepción.", en: "Rujero, the singani of Bodegas La Concepción." },
  "Juan Rodolfo Lillo · dominio público · Wikimedia Commons",
);
const donaVita = img(
  "/images/bodegas/vinos-dona-vita-casa-vieja.jpg",
  { es: "Vinos Doña Vita del viñedo Casa Vieja, Tarija", en: "Doña Vita wines from the Casa Vieja vineyard, Tarija" },
  { es: "Vinos Doña Vita, la marca de La Casa Vieja desde 1978.", en: "Doña Vita wines, La Casa Vieja's label since 1978." },
  "Saray Vargas 1312 · CC BY-SA 4.0 · Wikimedia Commons",
);
const barricas = img(
  "/images/bodegas/barricas-tarija.jpg",
  { es: "Barricas de vino en una bodega de Tarija", en: "Wine barrels in a Tarija winery" },
  { es: "Barricas en una bodega del Valle Central.", en: "Barrels in a Central Valley winery." },
  "Aldrihe · CC BY-SA 4.0 · Wikimedia Commons",
);
const moscatel = img(
  "/images/bodegas/uva-moscatel-de-alejandria.jpg",
  { es: "Racimo de uva Moscatel de Alejandría", en: "Bunch of Muscat of Alexandria grapes" },
  { es: "Moscatel de Alejandría, la única uva admitida para el singani.", en: "Muscat of Alexandria, the only grape allowed for singani." },
  "Rjcastillo · CC BY-SA 4.0 · Wikimedia Commons",
);

/* ---------------------------------- Cinti --------------------------------- */

const camargoCanon = img(
  "/images/cinti/camargo-canon-cinti.jpg",
  { es: "Camargo y el cañón de Cinti", en: "Camargo and the Cinti canyon" },
  { es: "Camargo, cuna del vino y el singani, en el fondo del cañón de Cinti.", en: "Camargo, cradle of wine and singani, on the floor of the Cinti canyon." },
  "Viejecillo · CC BY 3.0 · Wikimedia Commons",
);
const camargoVista = img(
  "/images/cinti/camargo-vista-general.jpg",
  { es: "Vista general de Camargo, Chuquisaca", en: "General view of Camargo, Chuquisaca" },
  { es: "Vista general de Camargo, capital de Nor Cinti.", en: "General view of Camargo, capital of Nor Cinti." },
  "Luis Fermín Turiel Peredo · CC BY-SA 4.0 · Wikimedia Commons",
);
const videsMolle = img(
  "/images/cinti/vides-centenarias-molle-cinti.jpg",
  { es: "Vides centenarias trepadas a un molle en el Valle de los Cintis", en: "Century-old vines climbing a molle tree in the Cinti valley" },
  { es: "El sistema «mollar»: la vid abraza al molle y lo usa de sostén.", en: "The \"mollar\" system: the vine hugs the molle tree and uses it as support." },
  "Sofival · CC BY 4.0 · Wikimedia Commons",
);
const videsMolle2 = img(
  "/images/cinti/vides-centenarias-cinti-2.jpg",
  { es: "Vides antiguas junto a un molle (Schinus molle) en Cinti", en: "Old vines beside a molle tree (Schinus molle) in Cinti" },
  { es: "Vides antiguas creciendo junto al molle en el Valle de los Cintis.", en: "Old vines growing next to the molle tree in the Cinti valley." },
  "Sofival · CC BY 4.0 · Wikimedia Commons",
);
const vendimiaCinti = img(
  "/images/cinti/vendimia-vides-centenarias-cinti.jpg",
  { es: "Vendimia en vides centenarias del Valle de los Cintis", en: "Harvesting century-old vines in the Cinti valley" },
  { es: "Vendimia con escalera en las vides sobre árboles de Cinti.", en: "Ladder harvest of tree-trained vines in Cinti." },
  "Sofival · CC BY 4.0 · Wikimedia Commons",
);

/* ---------------------------------- Export -------------------------------- */

export const IMAGES: {
  villages: Record<string, ImageEntry[]>;
  parcels: Record<string, ImageEntry[]>;
  history: ImageEntry[];
  wines: Record<string, ImageEntry | undefined>;
} = {
  villages: {
    tarija: [vendimiaDron, valleSantaAna, valleConcepcion, santaAnaKohlberg],
    cinti: [camargoCanon, videsMolle, vendimiaCinti, camargoVista],
  },
  parcels: {
    t01: [haciendaDonJulio, santaAnaKohlberg],
    t02: [valleConcepcion, parralesConcepcion, casaVieja],
    t03: [parralesConcepcion],
    t04: [],
    t05: [],
    t06: [],
    t07: [tolomosa],
    t08: [sanLorenzo, cultivosGuadalquivir],
    t09: [],
    t10: [],
    t11: [],
    t12: [canonAngostura, parralesCasaVieja],
    t13: [fincaEstherOrtiz, destileriaCasaReal, alambiqueCasaReal],
    t14: [],
    c01: [camargoVista, videsMolle],
    c02: [],
    c03: [],
    c04: [],
    c05: [videsMolle2],
    c06: [],
    c07: [camargoCanon],
    c08: [vendimiaCinti, videsMolle],
  },
  history: [tolomosa, sanJacinto, casaVieja, alambiqueCasaReal, moscatel, barricas, camargoCanon, videsMolle2, unico],
  wines: {
    t01: undefined,
    t02: rujero,
    t03: undefined,
    t04: undefined,
    t05: losParrales,
    t06: undefined,
    t07: insignia,
    t08: undefined,
    t09: undefined,
    t10: undefined,
    t11: undefined,
    t12: donaVita,
    t13: undefined,
    t14: undefined,
    c01: undefined,
    c02: undefined,
    c03: undefined,
    c04: undefined,
    c05: undefined,
    c06: undefined,
    c07: undefined,
    c08: undefined,
  },
};

/** All distinct images, handy for preloading or a gallery. */
export const ALL_IMAGES: ImageEntry[] = Array.from(
  new Map(
    [
      ...Object.values(IMAGES.villages).flat(),
      ...Object.values(IMAGES.parcels).flat(),
      ...IMAGES.history,
      ...Object.values(IMAGES.wines).filter((e): e is ImageEntry => Boolean(e)),
    ].map((e) => [e.src, e] as const),
  ).values(),
);
