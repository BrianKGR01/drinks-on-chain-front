import type { Lang, ParcelSpec, VillageSpec } from "@/lib/scene-contract";
import { getZoneContent } from "./zones";

/**
 * Editorial content of each parcel: the "ground" sheet and the "wine" sheet,
 * mirroring the reference's data model (specifications / description /
 * details / underground levels + wine name / specifications / blocks).
 *
 * The sourced, real content lives in ./zones.ts (see docs/FUENTES-CONTENIDO.md).
 * The generator below is only a fallback for a parcel without a zone entry.
 */

export type ContentBlock =
  | { type: "paragraph"; heading?: string; text: string }
  | { type: "highlight"; text: string }
  | { type: "columns"; text: string };

export interface SoilLevel {
  name: string;
  caption: string;
}

export interface ParcelContent {
  ground: {
    /** Short key/value lines, e.g. "Color del suelo / Ocre claro". */
    specifications: string[];
    description: string[];
    details: string[];
    underground: { title: string; levels: SoilLevel[] };
  };
  wine: {
    name: string;
    kind: "vino" | "singani";
    specifications: string[];
    content: ContentBlock[];
  };
}

type Localised<T> = Record<Lang, T>;

const WINE_KINDS: Record<string, "vino" | "singani"> = {
  t01: "vino", t02: "vino", t03: "vino", t04: "vino", t05: "singani", t06: "vino", t07: "singani",
  t08: "vino", t09: "singani", t10: "vino", t11: "vino", t12: "vino", t13: "singani", t14: "vino",
  c01: "singani", c02: "singani", c03: "vino", c04: "singani", c05: "singani", c06: "vino", c07: "singani", c08: "vino",
};

const GRAPES: Record<string, string> = {
  t01: "Tannat", t02: "Tannat · Cabernet Sauvignon", t03: "Syrah", t04: "Tannat", t05: "Moscatel de Alejandría",
  t06: "Cabernet Sauvignon", t07: "Moscatel de Alejandría", t08: "Merlot", t09: "Moscatel de Alejandría",
  t10: "Malbec", t11: "Tannat", t12: "Syrah · Petit Verdot", t13: "Moscatel de Alejandría", t14: "Cabernet Franc",
  c01: "Moscatel de Alejandría", c02: "Moscatel de Alejandría", c03: "Vischoqueña · Negra Criolla", c04: "Moscatel de Alejandría",
  c05: "Moscatel de Alejandría", c06: "Negra Criolla", c07: "Moscatel de Alejandría", c08: "Moscatel de Alejandría",
};

const seedFrom = (id: string) => id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

const pick = <T,>(arr: T[], seed: number, offset = 0) => arr[(seed + offset) % arr.length];

const SOIL_COLOURS: Localised<string[]> = {
  es: ["Ocre claro", "Pardo rojizo", "Beige arenoso", "Gris calcáreo", "Rojo ferroso"],
  en: ["Light ochre", "Reddish brown", "Sandy beige", "Chalky grey", "Iron red"],
};
const EXPOSURES: Localised<string[]> = {
  es: ["Norte / pendiente suave", "Noreste / ladera media", "Este / terraza fluvial", "Noroeste / fondo de valle"],
  en: ["North / gentle slope", "Northeast / mid-slope", "East / river terrace", "Northwest / valley floor"],
};
const MOISTURE: Localised<string[]> = {
  es: [
    "Suelos aluviales bien drenados sobre gravas",
    "Franco-arenoso con reserva hídrica moderada",
    "Coluviones pedregosos, drenaje rápido",
    "Limo-arcilloso profundo, retiene humedad en época seca",
  ],
  en: [
    "Well-draining alluvial soils over gravel",
    "Sandy loam with moderate water reserve",
    "Stony colluvium, fast drainage",
    "Deep silty clay, holds moisture through the dry season",
  ],
};

function buildContent(village: VillageSpec, parcel: ParcelSpec, lang: Lang): ParcelContent {
  const s = seedFrom(parcel.id);
  const kind = WINE_KINDS[parcel.id] ?? "vino";
  const grape = GRAPES[parcel.id] ?? "Moscatel de Alejandría";
  const isCinti = village.id === "cinti";
  const planted = 1978 + (s % 30);
  const area = (1.2 + (s % 47) / 10).toFixed(2);
  const ownArea = (0.3 + (s % 23) / 10).toFixed(2);
  const sand = 40 + (s % 35);
  const clay = 8 + (s % 18);
  const silt = 100 - sand - clay;

  if (lang === "en") {
    return {
      ground: {
        specifications: [
          `Soil colour / ${pick(SOIL_COLOURS.en, s)}`,
          `Moisture / ${pick(MOISTURE.en, s, 1)}`,
          `Exposure / ${pick(EXPOSURES.en, s, 2)}`,
          `Altitude / ${parcel.altitude.toLocaleString("en")} m a.s.l.`,
        ],
        description: [
          `The ${parcel.name} vineyard sits at ${parcel.altitude.toLocaleString("en")} metres above sea level, ${isCinti ? "on the narrow terraces of the Cinti canyon, where the river carved its way between red sandstone walls" : "on the alluvial fan that opens onto the Central Valley of Tarija"}. The thermal amplitude between day and night, often above 18 °C during ripening, is what slows the grapes down and keeps their acidity alive.`,
          `${grape} is the variety planted here. ${kind === "singani" ? "The vines are trained low and pruned hard so that the Moscatel keeps its aromatic intensity: these grapes are destined for the still, and the distiller wants concentration above all." : "The vines are trellised high to catch the morning sun and shade the bunches at midday, when the altitude makes the light unforgiving."}`,
          `${isCinti ? "Some plants climb on molle and chañar trees, the centuries-old training system of the valley, and are harvested by ladder." : "Hail nets protect the rows from January onwards, and the harvest is decided plot by plot after daily Brix readings."}`,
        ],
        details: [
          `Total area / ${area} ha`,
          `Drinks on Chain area / ${ownArea} ha`,
          `Grape variety / 100% ${grape}`,
          `Year of planting / ${planted} – ${planted + 9}`,
          `Exposure / ${pick(EXPOSURES.en, s, 2).split(" / ")[0]}`,
          `Soil / ${sand}% sand, ${clay}% clay, ${silt}% silt`,
        ],
        underground: {
          title: "SOIL LEVEL",
          levels: isCinti
            ? [
                { name: "Sandy alluvium", caption: "-0.6 metres" },
                { name: "Rounded river gravel", caption: "-1.8 metres" },
                { name: "Red Cretaceous sandstone", caption: "" },
              ]
            : [
                { name: "Silty topsoil", caption: "-0.4 metres" },
                { name: "Sandy loam with gravel", caption: "-1.5 metres" },
                { name: "Compact clay & conglomerate", caption: "" },
              ],
        },
      },
      wine: {
        name: parcel.name,
        kind,
        specifications:
          kind === "singani"
            ? ["Category / Singani de Altura · Gran Reserva", "Alcohol / 40% vol.", "Rest / 6 months in stainless steel"]
            : ["Blend / Single-parcel", `Variety / ${grape}`, "Ageing / 12 months in French oak"],
        content: [
          {
            type: "columns",
            text:
              kind === "singani"
                ? `The wine from ${parcel.name} is distilled in copper pot stills the same week it finishes fermenting. Only the heart of the run is kept; the heads and tails go back to the still. The spirit then rests at least six months in neutral tanks, as the Bolivian appellation requires, before water from the valley brings it to 40 degrees.`
                : `${parcel.name} is vinified alone, in small open tanks, with gentle daily punch-downs. The altitude gives the wine a taut, vertical profile: dark fruit, violets, and a chalky grip that softens after a year in barrel.`,
          },
          {
            type: "highlight",
            text:
              kind === "singani"
                ? `Every bottle of the ${parcel.name} singani carries the traceability of its parcel, its still and its rest.`
                : `The wine from ${parcel.name} enters the composition of the Altura single-vineyard series.`,
          },
          {
            type: "paragraph",
            heading: "AGEING",
            text:
              kind === "singani"
                ? "Singani does not want wood. It rounds off in stainless steel, slowly, gaining a silky texture without losing the jasmine and white peach of the Moscatel. It is bottled unaged and drinks best within three years."
                : "The wines of this parcel close down in their second year and reopen with age, gaining leather and dried herbs. Decant an hour ahead and serve at 16 °C.",
          },
        ],
      },
    };
  }

  return {
    ground: {
      specifications: [
        `Color del suelo / ${pick(SOIL_COLOURS.es, s)}`,
        `Humedad / ${pick(MOISTURE.es, s, 1)}`,
        `Exposición / ${pick(EXPOSURES.es, s, 2)}`,
        `Altitud / ${parcel.altitude.toLocaleString("es")} m s.n.m.`,
      ],
      description: [
        `El viñedo de ${parcel.name} está a ${parcel.altitude.toLocaleString("es")} metros sobre el nivel del mar, ${isCinti ? "en las terrazas angostas del cañón de Cinti, donde el río se abrió paso entre paredes de arenisca roja" : "sobre el abanico aluvial que se abre al Valle Central de Tarija"}. La amplitud térmica entre el día y la noche, que en maduración supera con frecuencia los 18 °C, es lo que frena a la uva y le conserva la acidez.`,
        `La variedad plantada es ${grape}. ${kind === "singani" ? "Las plantas se conducen bajas y se podan con dureza para que la Moscatel guarde su intensidad aromática: esta uva va al alambique, y el destilador busca ante todo concentración." : "Las plantas se conducen en espaldera alta para recibir el sol de la mañana y sombrear los racimos al mediodía, cuando la altura vuelve implacable la luz."}`,
        `${isCinti ? "Algunas plantas trepan sobre molles y chañares, el sistema de conducción centenario del valle, y se vendimian con escalera." : "Las mallas antigranizo protegen las hileras desde enero, y la vendimia se decide parcela por parcela tras la lectura diaria de grados Brix."}`,
      ],
      details: [
        `Superficie total / ${area} ha`,
        `Superficie Drinks on Chain / ${ownArea} ha`,
        `Variedad / 100% ${grape}`,
        `Año de plantación / ${planted} – ${planted + 9}`,
        `Exposición / ${pick(EXPOSURES.es, s, 2).split(" / ")[0]}`,
        `Suelo / ${sand}% arena, ${clay}% arcilla, ${silt}% limo`,
      ],
      underground: {
        title: "PERFIL DEL SUELO",
        levels: isCinti
          ? [
              { name: "Aluvión arenoso", caption: "-0,6 metros" },
              { name: "Gravas redondeadas de río", caption: "-1,8 metros" },
              { name: "Arenisca roja del Cretácico", caption: "" },
            ]
          : [
              { name: "Capa limosa superficial", caption: "-0,4 metros" },
              { name: "Franco-arenoso con gravas", caption: "-1,5 metros" },
              { name: "Arcilla compacta y conglomerado", caption: "" },
            ],
      },
    },
    wine: {
      name: parcel.name,
      kind,
      specifications:
        kind === "singani"
          ? ["Categoría / Singani de Altura · Gran Reserva", "Graduación / 40% vol.", "Reposo / 6 meses en acero inoxidable"]
          : ["Corte / Parcela única", `Variedad / ${grape}`, "Crianza / 12 meses en roble francés"],
      content: [
        {
          type: "columns",
          text:
            kind === "singani"
              ? `El vino de ${parcel.name} se destila en alambiques de cobre la misma semana en que termina de fermentar. Solo se guarda el corazón de la destilación; cabezas y colas vuelven al alambique. El aguardiente reposa luego un mínimo de seis meses en tanques neutros, como exige la denominación boliviana, antes de que el agua del valle lo lleve a 40 grados.`
              : `${parcel.name} se vinifica solo, en pequeños tanques abiertos, con bazuqueos diarios suaves. La altura le da al vino un perfil tenso y vertical: fruta negra, violetas y un agarre calcáreo que se ablanda tras un año en barrica.`,
        },
        {
          type: "highlight",
          text:
            kind === "singani"
              ? `Cada botella del singani de ${parcel.name} lleva la trazabilidad de su parcela, su alambique y su reposo.`
              : `El vino de ${parcel.name} entra en la composición de la serie Altura de parcela única.`,
        },
        {
          type: "paragraph",
          heading: "CRIANZA",
          text:
            kind === "singani"
              ? "El singani no quiere madera. Se redondea en acero inoxidable, despacio, ganando una textura sedosa sin perder el jazmín y el durazno blanco de la Moscatel. Se embotella sin crianza y se bebe mejor dentro de los tres años."
              : "Los vinos de esta parcela se cierran en su segundo año y se reabren con la edad, ganando cuero y hierbas secas. Decantar una hora antes y servir a 16 °C.",
        },
      ],
    },
  };
}

export function getParcelContent(village: VillageSpec, parcel: ParcelSpec, lang: Lang): ParcelContent {
  return getZoneContent(parcel.id, lang) ?? buildContent(village, parcel, lang);
}

/** Convenience for the wines index: which parcels bottle their own label. */
export function wineKindOf(parcelId: string) {
  return WINE_KINDS[parcelId] ?? "vino";
}
export function grapeOf(parcelId: string) {
  return GRAPES[parcelId] ?? "Moscatel de Alejandría";
}
