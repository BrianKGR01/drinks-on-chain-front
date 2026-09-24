import type { Lang } from "@/lib/scene-contract";
import type { ParcelContent, SoilLevel } from "./parcels";

/**
 * Real, sourced editorial content for every parcel of the two villages.
 *
 * Every fact (altitude, municipality, hectares, producers, products) comes from
 * the sources listed per zone in `facts.sources` and in docs/FUENTES-CONTENIDO.md.
 * Prose is original. Where a number is an estimate it is flagged as such.
 */

export interface ZoneFacts {
  municipality: string;
  province: string;
  altitude: number;
  varieties: string[];
  wineries: string[];
  sources: string[];
}

export interface ZoneEntry {
  facts: ZoneFacts;
  content: Record<Lang, ParcelContent>;
}

type L<T> = Record<Lang, T>;

interface ZoneInput {
  facts: ZoneFacts;
  ground: {
    soilColour: L<string>;
    moisture: L<string>;
    exposure: L<string>;
    description: L<string[]>;
    details: L<string[]>;
    underground: L<SoilLevel[]>;
  };
  wine: {
    name: string;
    kind: "vino" | "singani";
    specifications: L<string[]>;
    columns: L<string>;
    highlight: L<string>;
    paragraph: L<{ heading: string; text: string }>;
  };
}

const fmt = (n: number, lang: Lang) => n.toLocaleString(lang === "es" ? "es-BO" : "en-GB");

function build(z: ZoneInput): ZoneEntry {
  const alt = z.facts.altitude;
  const content = (lang: Lang): ParcelContent => ({
    ground: {
      specifications:
        lang === "es"
          ? [
              `Color del suelo / ${z.ground.soilColour.es}`,
              `Humedad / ${z.ground.moisture.es}`,
              `Exposición / ${z.ground.exposure.es}`,
              `Altitud / ${fmt(alt, "es")} m s.n.m.`,
            ]
          : [
              `Soil colour / ${z.ground.soilColour.en}`,
              `Moisture / ${z.ground.moisture.en}`,
              `Exposure / ${z.ground.exposure.en}`,
              `Altitude / ${fmt(alt, "en")} m a.s.l.`,
            ],
      description: z.ground.description[lang],
      details: z.ground.details[lang],
      underground: {
        title: lang === "es" ? "PERFIL DEL SUELO" : "SOIL PROFILE",
        levels: z.ground.underground[lang],
      },
    },
    wine: {
      name: z.wine.name,
      kind: z.wine.kind,
      specifications: z.wine.specifications[lang],
      content: [
        { type: "columns", text: z.wine.columns[lang] },
        { type: "highlight", text: z.wine.highlight[lang] },
        { type: "paragraph", heading: z.wine.paragraph[lang].heading, text: z.wine.paragraph[lang].text },
      ],
    },
  });
  return { facts: z.facts, content: { es: content("es"), en: content("en") } };
}

/* ------------------------------------------------------------------ */
/* Shared soil profiles (typical of each valley, per published sources) */
/* ------------------------------------------------------------------ */

/** Valle Central de Tarija: deep alluvial / lacustrine soils of medium texture (SciELO 2021; PDOT Tarija). */
const TARIJA_PROFILE: L<SoilLevel[]> = {
  es: [
    { name: "Franco limoso superficial, pedregosidad < 15 %", caption: "-0,4 metros" },
    { name: "Aluvión franco-arenoso con gravas del abanico", caption: "-1,5 metros" },
    { name: "Sedimentos lacustres arcillo-arenosos (antiguo lago)", caption: "" },
  ],
  en: [
    { name: "Silty loam topsoil, stoniness < 15%", caption: "-0.4 metres" },
    { name: "Sandy-loam alluvium with fan gravels", caption: "-1.5 metres" },
    { name: "Sandy-clay lake sediments (ancient lake bed)", caption: "" },
  ],
};

/** Valle de Cinti, west bank: franco-arenoso / franco-arcilloso over iron-rich red clays (Cañón Colorado). */
const CINTI_PROFILE: L<SoilLevel[]> = {
  es: [
    { name: "Franco-arenoso de terraza, hojarasca de molle", caption: "-0,5 metros" },
    { name: "Franco-arcilloso rojo, rico en hierro", caption: "-1,6 metros" },
    { name: "Areniscas y lutitas ordovícicas alteradas", caption: "" },
  ],
  en: [
    { name: "Terrace sandy loam under molle-tree litter", caption: "-0.5 metres" },
    { name: "Red, iron-rich clay loam", caption: "-1.6 metres" },
    { name: "Weathered Ordovician sandstone and shale", caption: "" },
  ],
};

/** Valle de Cinti, east bank: lighter calcareous, clay and sand mixture over river gravels. */
const CINTI_EAST_PROFILE: L<SoilLevel[]> = {
  es: [
    { name: "Franco-arenoso claro de terraza fluvial", caption: "-0,5 metros" },
    { name: "Mezcla calcárea, arcillosa y arenosa", caption: "-1,5 metros" },
    { name: "Gravas del río Chico / río Grande", caption: "" },
  ],
  en: [
    { name: "Pale sandy loam of the river terrace", caption: "-0.5 metres" },
    { name: "Calcareous, clay and sand mixture", caption: "-1.5 metres" },
    { name: "Gravels of the Río Chico / Río Grande", caption: "" },
  ],
};

/* ------------------------------------------------------------------ */
/* VALLE CENTRAL DE TARIJA                                              */
/* ------------------------------------------------------------------ */

const t01 = build({
  facts: {
    municipality: "Tarija (Cercado)",
    province: "Cercado",
    altitude: 1822,
    varieties: ["Cabernet Sauvignon", "Malbec", "Syrah", "Tannat", "Moscatel de Alejandría"],
    wineries: ["Bodegas y Viñedos La Cabaña – Kohlberg", "Bodegas y Viñedos Aranjuez (viñedos)", "Campos de Solana / Casa Real (valle de Santa Ana)"],
    sources: [
      "https://kohlberg.com.bo/bodegas-y-vinedos",
      "https://kohlberg.com.bo/coleccion/cabernet-sauvignon",
      "https://www.lostiempos.com/actualidad/economia/20160824/bodegas-kohlberg-53-anos-vinos-talla-mundial",
      "https://www.vinosaranjuez.com/vinos/juan-cruz/",
      "https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html",
      "https://nominatim.openstreetmap.org/ (Santa Ana La Vieja, Municipio Tarija) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Pardo claro con gravas", en: "Pale brown with gravels" },
    moisture: { es: "Aluvión profundo del río Santa Ana, riego por goteo", en: "Deep alluvium of the Santa Ana river, drip irrigation" },
    exposure: { es: "Norte / fondo de valle abierto", en: "North / open valley floor" },
    description: {
      es: [
        "Santa Ana la Vieja es la comunidad donde empezó la viticultura industrial de Tarija. En 1963 Julio Kohlberg compró aquí la propiedad La Cabaña, a 15 km de la ciudad, y plantó las primeras cepas francesas traídas para hacer vino fino; hoy los viñedos de La Cabaña y de la vecina Hacienda Don Julio suman 147 hectáreas y una capacidad de más de 6 millones de litros al año.",
        "El valle de Santa Ana es una llanura aluvial abierta al sur de la ciudad, regada por el río del mismo nombre, con días que rozan los 30 °C en verano y noches que bajan a 15 °C. Esa amplitud térmica, unida a los más de 1.800 metros de altitud, es la que conserva la acidez de Cabernet Sauvignon, Malbec y Syrah. Los productores de Santa Ana y El Portillo concentran cerca del 40 % de los viticultores de la provincia Cercado.",
        "Además de Kohlberg, aquí tienen parcelas Aranjuez (Santa Ana la Vieja y la Nueva) y el grupo Campos de Solana / Casa Real, cuya destilería está en la misma cuenca. Es, en la práctica, el cuadrilátero de las grandes bodegas del valle.",
      ],
      en: [
        "Santa Ana la Vieja is where Tarija's industrial viticulture began. In 1963 Julio Kohlberg bought the La Cabaña estate here, 15 km from the city, and planted the first French vines brought in for fine wine; today La Cabaña and the neighbouring Hacienda Don Julio total 147 hectares and a capacity above 6 million litres a year.",
        "The Santa Ana valley is an open alluvial plain south of the city, watered by the river of the same name, with summer days close to 30 °C and nights down to 15 °C. That thermal swing, together with more than 1,800 metres of altitude, is what keeps the acidity alive in Cabernet Sauvignon, Malbec and Syrah. Growers in Santa Ana and El Portillo account for about 40% of Cercado province's vine farmers.",
        "Besides Kohlberg, Aranjuez farms plots here (Santa Ana la Vieja and la Nueva) and the Campos de Solana / Casa Real group has its distillery in the same basin. In practice this is the home turf of the valley's big houses.",
      ],
    },
    details: {
      es: [
        "Superficie de La Cabaña / 147 ha (Kohlberg)",
        "Fundación de la bodega / 1963",
        "Variedades / Cabernet Sauvignon, Malbec, Syrah, Tannat, Moscatel",
        "Edad de las cepas del Block 63 / 27 años",
        "Distancia a Tarija / 15 km",
        "Municipio / Tarija (Cercado)",
      ],
      en: [
        "La Cabaña estate area / 147 ha (Kohlberg)",
        "Winery founded / 1963",
        "Varieties / Cabernet Sauvignon, Malbec, Syrah, Tannat, Muscat",
        "Age of Block 63 vines / 27 years",
        "Distance to Tarija / 15 km",
        "Municipality / Tarija (Cercado)",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Kohlberg Cabernet Sauvignon Single Vineyard Block 63",
    kind: "vino",
    specifications: {
      es: ["Bodega / Kohlberg – Hacienda Don Julio, Block 63", "Variedad / 100 % Cabernet Sauvignon", "Altitud del viñedo / 1.950 m · 50.000 botellas"],
      en: ["Producer / Kohlberg – Hacienda Don Julio, Block 63", "Variety / 100% Cabernet Sauvignon", "Vineyard altitude / 1,950 m · 50,000 bottles"],
    },
    columns: {
      es: "El Block 63 es una parcela única de Cabernet Sauvignon de 27 años dentro de la Hacienda Don Julio, en el valle de Santa Ana. Kohlberg lo vinifica por separado y publica sus notas: rojo rubí intenso; nariz de grosella negra y frutos rojos con clavo de olor, regaliz, tabaco y cuero; boca jugosa y redonda, con cedro y casis. Servir entre 15 y 17 °C.",
      en: "Block 63 is a single 27-year-old Cabernet Sauvignon plot inside Hacienda Don Julio, in the Santa Ana valley. Kohlberg vinifies it apart and publishes its notes: deep ruby red; a nose of blackcurrant and red fruit with clove, liquorice, tobacco and leather; a juicy, rounded palate with cedar and cassis. Serve at 15–17 °C.",
    },
    highlight: {
      es: "La bodega que en 1963 abrió la viticultura moderna de Tarija sigue embotellando la misma comunidad, parcela por parcela.",
      en: "The house that opened Tarija's modern viticulture in 1963 still bottles the same community, plot by plot.",
    },
    paragraph: {
      es: { heading: "GUARDA", text: "Kohlberg indica un potencial de guarda de cinco años para este Single Vineyard. Es un Cabernet de altura: la fruta manda sobre la madera y el tanino llega pulido gracias a la madurez lenta que impone la noche fría del valle." },
      en: { heading: "CELLARING", text: "Kohlberg gives this Single Vineyard a five-year cellaring window. It is a high-altitude Cabernet: fruit leads over oak and the tannin arrives polished thanks to the slow ripening imposed by the valley's cold nights." },
    },
  },
});

const t02 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1710,
    varieties: ["Tannat", "Cabernet Sauvignon", "Moscatel de Alejandría", "Malbec"],
    wineries: ["Bodegas y Viñedos La Concepción (Rujero)", "La Casa Vieja – Vinos Doña Vita", "Casa Vinícola El Potro", "CENAVIT (Centro Nacional Vitivinícola, km 25)"],
    sources: [
      "https://de.wikipedia.org/wiki/Valle_de_Concepci%C3%B3n",
      "https://de.wikipedia.org/wiki/Municipio_Uriondo",
      "https://jornada.com.bo/un-homenaje-a-la-vid-de-nuestra-tierra-bodegas-y-vinedos-de-la-concepcion-lanza-cepas-de-altura-tannat/",
      "https://www.lostiempos.com/actualidad/economia/20181120/rujero-singani-boliviano-que-demuestra-su-jerarquia-internacional",
      "https://www.lacasavieja.info/historia.php",
      "https://elpais.bo/tarija/20230415_aviles-y-la-variedad-de-su-produccion-agricola.html",
    ],
  },
  ground: {
    soilColour: { es: "Ocre claro", en: "Light ochre" },
    moisture: { es: "Franco profundo, riego del río Camacho; granizo frecuente", en: "Deep loam, irrigated from the Camacho river; frequent hail" },
    exposure: { es: "Noreste / llanura del Valle", en: "Northeast / valley plain" },
    description: {
      es: [
        "El Valle de la Concepción, «el Valle» para los tarijeños, es la capital del municipio de Uriondo y el corazón de la uva boliviana: la provincia Avilés concentra el 72,8 % de la superficie de vid del departamento y Uriondo produce más del 80 % de las cerca de 3.700 hectáreas de Tarija. El pueblo está a 1.710 metros, a 25 km de la ciudad; las fincas de las laderas suben hasta los 1.850.",
        "La tradición viene de lejos. Los jesuitas elaboraban vino litúrgico aquí hacia 1690 y La Casa Vieja, una hacienda de unos cuatro siglos a la entrada del pueblo, todavía pisa parte de su uva para el vino patero que embotella desde 1978 con la marca Doña Vita. El clima es templado, con 19 °C de media, unos 550 mm de lluvia concentrados de diciembre a marzo y una seca larga de abril a octubre.",
        "Bodegas y Viñedos La Concepción, a 28 km de Tarija, plantó variedades francesas en los años ochenta y hoy es la casa del singani Rujero y de los tintos Cepas de Altura. Al borde de la carretera, en el km 25, el Centro Nacional Vitivinícola (CENAVIT) hace investigación y multiplicación de plantas para todo el valle.",
      ],
      en: [
        "Valle de la Concepción, simply \"el Valle\" to Tarijeños, is the seat of Uriondo municipality and the heart of Bolivian grape growing: Avilés province holds 72.8% of the department's vine area and Uriondo grows more than 80% of Tarija's roughly 3,700 hectares. The town sits at 1,710 metres, 25 km from the city; the hillside estates climb to 1,850.",
        "The tradition runs deep. Jesuits made liturgical wine here around 1690, and La Casa Vieja, a roughly four-century-old hacienda at the edge of town, still foot-treads part of its grapes for the patero wine it has bottled since 1978 under the Doña Vita label. The climate is temperate, 19 °C on average, with about 550 mm of rain between December and March and a long dry season from April to October.",
        "Bodegas y Viñedos La Concepción, 28 km from Tarija, planted French varieties in the 1980s and is today the home of Rujero singani and the Cepas de Altura reds. By the roadside at km 25, the Centro Nacional Vitivinícola (CENAVIT) runs research and plant propagation for the whole valley.",
      ],
    },
    details: {
      es: [
        "Superficie de vid en Uriondo / > 80 % de las 3.700 ha de Tarija",
        "Comunidades vitícolas del municipio / 25 de 53",
        "Variedades / Tannat, Cabernet Sauvignon, Moscatel de Alejandría",
        "Viñedos de La Concepción / > 100 ha propias + 50 familias proveedoras",
        "Temperatura media / 19 °C · lluvia ≈ 550 mm",
        "Distancia a Tarija / 25 km",
      ],
      en: [
        "Vine area in Uriondo / > 80% of Tarija's 3,700 ha",
        "Grape-growing communities in the municipality / 25 of 53",
        "Varieties / Tannat, Cabernet Sauvignon, Muscat of Alexandria",
        "La Concepción vineyards / > 100 ha owned + 50 supplier families",
        "Mean temperature / 19 °C · rainfall ≈ 550 mm",
        "Distance to Tarija / 25 km",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Singani Rujero",
    kind: "singani",
    specifications: {
      es: ["Bodega / Bodegas y Viñedos La Concepción", "Uva / Moscatel de Alejandría del Valle de la Concepción (≈ 1.700–1.750 m)", "Doble destilación en alambiques de cobre · Colección Privada (etiqueta negra)"],
      en: ["Producer / Bodegas y Viñedos La Concepción", "Grape / Muscat of Alexandria from Valle de la Concepción (≈ 1,700–1,750 m)", "Double distilled in copper stills · Colección Privada (black label)"],
    },
    columns: {
      es: "Rujero toma su nombre de una comunidad del municipio y se elabora sólo con Moscatel de Alejandría del Valle de la Concepción, fermentada para obtener un vino base limpio y destilada dos veces en alambiques de cobre. La bodega lo describe transparente y brillante, con nariz cítrica y floral, y una boca aterciopelada, elegante y de final persistente. En 2018 ganó oro en Spirits Selection (Concours Mondial de Bruxelles) y en Vinus, Mendoza.",
      en: "Rujero takes its name from a community in the municipality and is made only from Muscat of Alexandria grown in Valle de la Concepción, fermented into a clean base wine and distilled twice in copper stills. The house describes it as clear and bright, citrus and floral on the nose, velvety and elegant on the palate with a persistent finish. In 2018 it took gold at Spirits Selection (Concours Mondial de Bruxelles) and at Vinus, Mendoza.",
    },
    highlight: {
      es: "La misma bodega firma Cepas de Altura Tannat, criado en roble francés en la Hacienda La Loma, con notas publicadas de mora, cereza, aceituna negra, café y nuez moscada.",
      en: "The same house signs Cepas de Altura Tannat, oak-aged at Hacienda La Loma, with published notes of blackberry, cherry, black olive, coffee and nutmeg.",
    },
    paragraph: {
      es: { heading: "REPOSO", text: "Como todo singani con denominación de origen, Rujero no toca madera: reposa en depósitos neutros y se embotella a 40 grados. La gama va de la etiqueta azul para chuflay a la Colección Privada; la reciente Tarixa, en cambio, prueba tres años en barrica francesa como aguardiente envejecido." },
      en: { heading: "REST", text: "Like every appellation singani, Rujero never sees wood: it rests in neutral vessels and is bottled at 40% vol. The range runs from the blue label for chuflay to the Colección Privada; the recent Tarixa, by contrast, experiments with three years in French barrels as an aged spirit." },
    },
  },
});

const t03 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1688,
    varieties: ["Moscatel de Alejandría", "Red Globe", "Thompson", "Aurora", "Italia", "Cardenal", "Tannat"],
    wineries: ["Sindicato agrario de Calamuchita (≈ 400 afiliados)", "Bodega Artesanal Tarijeñito (San Isidro de Uriondo)", "Estación meteorológica CENAVIT"],
    sources: [
      "https://de.wikipedia.org/wiki/Calamuchita",
      "https://bo.reyqui.com/2018/02/tarija-calamuchita-y-san-isidro-la.html",
      "https://lavozdetarija.com/2024/11/04/tarija-granizada-devasta-cultivos-en-comunidades-de-uriondo-y-productores-claman-por-apoyo/",
      "https://www.infotarija.com/noticias/guadalquivir-cenavit-calamuchita-un-proyecto-de-impacto-que-generara-mas-de-3400-nuevas-hectareas-para-riego-en-el-valle-central-de-tarija-746",
      "https://rutadelvinobolivia.com/es/bodegas/tarijenito.html",
      "https://www.economy.com.bo/articulo/business/bodega-artesanal-tarijenito-lanza-nuevos-vinos-mercado-boliviano/20230626105001010213.html",
    ],
  },
  ground: {
    soilColour: { es: "Pardo amarillento", en: "Yellowish brown" },
    moisture: { es: "Franco profundo de terraza, riego por gravedad del Camacho", en: "Deep terrace loam, gravity irrigation from the Camacho" },
    exposure: { es: "Este / terraza baja del río", en: "East / low river terrace" },
    description: {
      es: [
        "Calamuchita es la comunidad más poblada del cantón Uriondo después del propio Valle y una de las parroquias donde los misioneros coloniales plantaron vid. A 1.688 metros, en la terraza baja del río Camacho, concentra entre 350 y 400 hectáreas de viña y un sindicato agrario con unos 400 afiliados que viven casi enteramente de la uva.",
        "Aquí mandan la uva de mesa y la Moscatel de Alejandría para singani: Red Globe, Thompson, Aurora, Italia y Cardenal salen en cajas hacia La Paz, Santa Cruz y Cochabamba desde la vendimia de marzo, con rendimientos de 400 a 450 quintales por hectárea. El precio de esa dependencia es la intemperie: en noviembre de 2024 una granizada arrasó Calamuchita, Muturayo y Colón, y en 2022 el Camacho llegó a secarse con mil hectáreas en riesgo.",
        "La estación meteorológica del CENAVIT está a 5 km, y el proyecto de riego Guadalquivir–Cenavit–Calamuchita promete 3.400 hectáreas nuevas bajo riego. En la comunidad vecina de San Isidro, a 15 km de Tarija sobre la ruta a Uriondo, la Bodega Artesanal Tarijeñito transforma desde 2014 uva de esta ribera en vinos y singani.",
      ],
      en: [
        "Calamuchita is the most populous community of Uriondo canton after the Valle itself, and one of the parishes where colonial missionaries planted vines. At 1,688 metres on the low terrace of the Camacho river it holds 350–400 hectares of vineyard and a farmers' union of some 400 members who live almost entirely from grapes.",
        "Table grapes and Muscat of Alexandria for singani rule here: Red Globe, Thompson, Aurora, Italia and Cardenal leave in crates for La Paz, Santa Cruz and Cochabamba from the March harvest, at yields of 400–450 quintals per hectare. The price of that dependence is exposure to the weather: a November 2024 hailstorm flattened Calamuchita, Muturayo and Colón, and in 2022 the Camacho ran dry with a thousand hectares at risk.",
        "The CENAVIT weather station is 5 km away, and the Guadalquivir–Cenavit–Calamuchita irrigation scheme promises 3,400 new irrigated hectares. In neighbouring San Isidro, 15 km from Tarija on the road to Uriondo, the artisanal Bodega Tarijeñito has turned grapes from this riverbank into wine and singani since 2014.",
      ],
    },
    details: {
      es: [
        "Superficie de vid / 350–400 ha",
        "Productores / ≈ 400 afiliados al sindicato agrario",
        "Variedades / Moscatel de Alejandría, Red Globe, Thompson, Aurora, Italia, Cardenal",
        "Rendimiento / 400–450 qq por ha",
        "Vendimia / marzo",
        "Población / 1.228 hab. (censo 2012)",
      ],
      en: [
        "Vine area / 350–400 ha",
        "Growers / ≈ 400 members of the farmers' union",
        "Varieties / Muscat of Alexandria, Red Globe, Thompson, Aurora, Italia, Cardenal",
        "Yield / 400–450 quintals per ha",
        "Harvest / March",
        "Population / 1,228 (2012 census)",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Tarijeñito «Empodérate» Tannat 2021",
    kind: "vino",
    specifications: {
      es: ["Bodega / Bodega Artesanal Tarijeñito, San Isidro de Uriondo (1.715 m)", "Variedad / Tannat", "Bodega familiar fundada el 22 de septiembre de 2014"],
      en: ["Producer / Bodega Artesanal Tarijeñito, San Isidro de Uriondo (1,715 m)", "Variety / Tannat", "Family winery founded 22 September 2014"],
    },
    columns: {
      es: "Freddy Jurado y Claudia Sanguino fundaron Tarijeñito en 2014 con 1.000 litros de tinto semidulce; hoy embotellan once referencias entre tintos secos, blancos, rosados, espumantes y un singani etiqueta negra, todo con uva del entorno de San Isidro y Calamuchita. Empodérate, un Tannat de la vendimia 2021, nació como homenaje a la resiliencia de la pandemia y es su tinto seco de bandera.",
      en: "Freddy Jurado and Claudia Sanguino founded Tarijeñito in 2014 with 1,000 litres of semi-sweet red; today they bottle eleven references across dry reds, whites, rosés, sparkling wines and a black-label singani, all from grapes grown around San Isidro and Calamuchita. Empodérate, a Tannat from the 2021 harvest, was born as a tribute to pandemic resilience and is their flagship dry red.",
    },
    highlight: {
      es: "Una bodega de garaje que compra y vinifica la uva de la misma ribera donde las grandes casas sólo ven cajas de uva de mesa.",
      en: "A garage winery that buys and vinifies grapes from the very riverbank where the big houses only see table-grape crates.",
    },
    paragraph: {
      es: { heading: "ESTILO", text: "La casa trabaja sin pretensión de barrica larga: fruta roja franca, tanino de Tannat domado por la altura y un perfil pensado para la parrilla chapaca. Su Moscatel de Alejandría gasificado, de tono verdoso por la maceración de hollejos, muestra hacia dónde va la nueva generación del valle." },
      en: { heading: "STYLE", text: "The house does not chase long barrel ageing: frank red fruit, Tannat tannin tamed by altitude and a profile built for the Tarija grill. Its lightly sparkling Muscat of Alexandria, greenish from skin maceration, shows where the valley's new generation is heading." },
    },
  },
});

const t04 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1806,
    varieties: ["Moscatel de Alejandría", "Tannat", "Cabernet Sauvignon"],
    wineries: ["Bodega El Legado – Vinos Arce (viñedo de La Compañía de Jesús)", "Comunidades del cantón Chocloca (La Compañía, Chocloca)"],
    sources: [
      "https://de.wikipedia.org/wiki/Chocloca",
      "https://de.wikipedia.org/wiki/Municipio_Uriondo",
      "https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html",
      "https://lavozdetarija.com/2024/10/15/reconquista-un-singani-con-cepas-de-tarija-de-bodega-el-legado/",
      "https://elpais.bo/tarija/20230415_aviles-y-la-variedad-de-su-produccion-agricola.html",
    ],
  },
  ground: {
    soilColour: { es: "Pardo rojizo", en: "Reddish brown" },
    moisture: { es: "Franco-arenoso de ladera, drenaje rápido", en: "Hillside sandy loam, fast drainage" },
    exposure: { es: "Noroeste / ladera sobre la ruta a Chaguaya", en: "Northwest / hillside above the Chaguaya road" },
    description: {
      es: [
        "Chocloca da nombre a uno de los tres cantones de Uriondo, con quince localidades y unos 2.450 habitantes, y fue una de las parroquias donde agustinos y jesuitas llevaron la vid en tiempos coloniales. El pueblo está a 1.806 metros, sobre la carretera que sube hacia el santuario de Chaguaya, en el borde sur del Valle Central.",
        "El nombre de la comunidad vecina, La Compañía, recuerda la hacienda de la Compañía de Jesús. En 1964 Luis Arce Torrez plantó allí, a cinco minutos del Valle de la Concepción, el primer viñedo de la familia Arce y fundó su primera bodega con un vino que llamó simplemente Arce; el mismo predio sigue en manos de la familia y sostiene hoy la Bodega El Legado.",
        "El cantón vive de la uva, el tomate y la papa, y comparte con el resto de Uriondo la vulnerabilidad al granizo y a la seca del río Camacho. Sus viñas se orientan hacia la Moscatel de Alejandría para singani y hacia tintos de altura como Tannat y Cabernet Sauvignon.",
      ],
      en: [
        "Chocloca gives its name to one of Uriondo's three cantons, with fifteen localities and some 2,450 inhabitants, and was one of the parishes where Augustinians and Jesuits brought the vine in colonial times. The village sits at 1,806 metres on the road that climbs to the Chaguaya sanctuary, on the southern rim of the Central Valley.",
        "The name of the neighbouring community, La Compañía, recalls the hacienda of the Society of Jesus. In 1964 Luis Arce Torrez planted the Arce family's first vineyard there, five minutes from Valle de la Concepción, and founded his first winery with a wine he simply called Arce; the same land remains in the family and today underpins Bodega El Legado.",
        "The canton lives from grapes, tomatoes and potatoes, and shares with the rest of Uriondo its vulnerability to hail and to the Camacho river running dry. Its vines lean towards Muscat of Alexandria for singani and towards altitude reds such as Tannat and Cabernet Sauvignon.",
      ],
    },
    details: {
      es: [
        "Cantón Chocloca / 15 localidades · 2.454 hab.",
        "Comunidad La Compañía / 639 hab. · Chocloca 247 hab.",
        "Primer viñedo Arce en La Compañía de Jesús / 1964",
        "Variedades / Moscatel de Alejandría, Tannat, Cabernet Sauvignon",
        "Altitud del pueblo / 1.806 m",
        "Municipio / Uriondo",
      ],
      en: [
        "Chocloca canton / 15 localities · 2,454 inhabitants",
        "La Compañía community / 639 inh. · Chocloca 247 inh.",
        "First Arce vineyard at La Compañía de Jesús / 1964",
        "Varieties / Muscat of Alexandria, Tannat, Cabernet Sauvignon",
        "Village altitude / 1,806 m",
        "Municipality / Uriondo",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Singani Reconquista – Bodega El Legado",
    kind: "singani",
    specifications: {
      es: ["Bodega / El Legado (familia Arce), Tarija", "Uva / cepas de Moscatel de Alejandría de Tarija", "Singani premium presentado en 2024"],
      en: ["Producer / El Legado (Arce family), Tarija", "Grape / Muscat of Alexandria vines from Tarija", "Premium singani launched in 2024"],
    },
    columns: {
      es: "Reconquista es el singani premium con el que la tercera generación de los Arce, encabezada por el enólogo Luis Fernando Arce Campero (formado en San Juan, Argentina), relanzó en 2024 el legado iniciado en 1964 en La Compañía de Jesús. La familia mantiene ese viñedo histórico junto a Chocloca y otro en La Pintada, a 11 km de la ciudad, y destila con uva propia de Tarija.",
      en: "Reconquista is the premium singani with which the third generation of the Arce family, led by winemaker Luis Fernando Arce Campero (trained in San Juan, Argentina), relaunched in 2024 the legacy begun in 1964 at La Compañía de Jesús. The family keeps that historic vineyard beside Chocloca and another at La Pintada, 11 km from the city, and distils from its own Tarija grapes.",
    },
    highlight: {
      es: "«Lo que una vez comenzó está por renacer»: el lema de la casa resume seis décadas de viña en la antigua hacienda jesuita.",
      en: "\"What once began is about to be reborn\": the house motto sums up six decades of vines on the old Jesuit hacienda.",
    },
    paragraph: {
      es: { heading: "FICHA", text: "La bodega no ha publicado aún graduación ni tiempo de reposo de Reconquista; como singani de denominación de origen debe elaborarse sólo con Moscatel de Alejandría cultivada por encima de 1.600 metros y reposar en recipientes neutros antes de embotellarse." },
      en: { heading: "SHEET", text: "The winery has not yet published the strength or resting time of Reconquista; as an appellation singani it must be made solely from Muscat of Alexandria grown above 1,600 metres and rest in neutral vessels before bottling." },
    },
  },
});

const t05 = build({
  facts: {
    municipality: "Tarija (Cercado)",
    province: "Cercado",
    altitude: 1859,
    varieties: ["Moscatel de Alejandría", "Tannat", "Merlot", "Cabernet Franc", "Bonarda"],
    wineries: ["Bodegas y Viñedos Kuhlmann (destilería de Los Parrales)", "Aranjuez – Finca El Portillo (2012)", "Bodegas Magnus (viñedos)"],
    sources: [
      "https://rutadelvinobolivia.com/es/bodegas/kuhlmann.html",
      "https://bodegaskuhlmann.com/losparrales/",
      "https://www.economy.com.bo/articulo/business/singani-parrales-invita-sentir-renovada-imagen/20220503124539005960.html",
      "https://www.vinosaranjuez.com/nosotros/",
      "https://elpais.bo/tarija/20220613_alcaldia-capacita-a-productores-de-uva-en-cercado.html",
      "https://eju.tv/2025/12/las-urbanizaciones-amenazan-los-vinedos-en-el-valle-central-de-tarija/",
      "https://nominatim.openstreetmap.org/ (Portillo, Municipio Tarija) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Pardo grisáceo", en: "Greyish brown" },
    moisture: { es: "Franco-arenoso, riego tecnificado; presión urbana creciente", en: "Sandy loam, technified irrigation; growing urban pressure" },
    exposure: { es: "Norte / pie de monte sobre la ciudad", en: "North / foothill above the city" },
    description: {
      es: [
        "El Portillo es el distrito rural que cierra la ciudad de Tarija por el sur, a unos 10 km del centro y a 1.859 metros. Junto con Santa Ana concentra cerca del 40 % de los productores de uva de Cercado y es, desde 1972, la casa de Bodegas y Viñedos Kuhlmann, la firma que nació en 1930 en la hacienda Vivicha del Valle de Cinti y trasladó aquí su destilería.",
        "Aranjuez plantó su Finca El Portillo en 2012 y Bodegas Magnus vinifica uva de esta zona junto con la de Torrecillas y el Valle de la Concepción. Los suelos francos y pedregosos del pie de monte, con más de 300 días de sol y saltos térmicos de hasta 20 °C entre el día y la noche, dan Moscatel de Alejandría aromática y tintos de acidez viva.",
        "Es también el frente más amenazado del valle: las urbanizaciones avanzan sobre los parrales y los dirigentes de la comunidad reclaman tecnología y protección frente al contrabando de uva, que hunde los precios en cada vendimia.",
      ],
      en: [
        "El Portillo is the rural district that closes the city of Tarija to the south, some 10 km from the centre at 1,859 metres. Together with Santa Ana it holds about 40% of Cercado's grape growers and has been, since 1972, the home of Bodegas y Viñedos Kuhlmann, the firm founded in 1930 at the Vivicha estate in the Cinti Valley that moved its distillery here.",
        "Aranjuez planted its Finca El Portillo in 2012, and Bodegas Magnus vinifies fruit from this zone alongside Torrecillas and Valle de la Concepción. The loamy, stony foothill soils, with more than 300 sunny days and day–night swings of up to 20 °C, give aromatic Muscat of Alexandria and reds with lively acidity.",
        "It is also the valley's most threatened front: housing developments are advancing over the vine arbours, and community leaders call for technology and protection against smuggled grapes, which sink prices every harvest.",
      ],
    },
    details: {
      es: [
        "Productores de Cercado en Santa Ana + El Portillo / ≈ 40 %",
        "Kuhlmann en Tarija / desde 1972 (fundada en 1930 en Vivicha, Cinti)",
        "Finca El Portillo (Aranjuez) / plantada en 2012",
        "Variedades / Moscatel de Alejandría, Tannat, Merlot, Cabernet Franc",
        "Días de sol / > 300 al año · amplitud térmica ≈ 20 °C",
        "Distancia a Tarija / ≈ 10 km",
      ],
      en: [
        "Cercado growers in Santa Ana + El Portillo / ≈ 40%",
        "Kuhlmann in Tarija / since 1972 (founded 1930 at Vivicha, Cinti)",
        "Finca El Portillo (Aranjuez) / planted 2012",
        "Varieties / Muscat of Alexandria, Tannat, Merlot, Cabernet Franc",
        "Sunny days / > 300 a year · thermal amplitude ≈ 20 °C",
        "Distance to Tarija / ≈ 10 km",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Singani Los Parrales Reserva Doble Oro",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodegas y Viñedos Kuhlmann, El Portillo", "Uva / 100 % Moscatel de Alejandría · 40 % vol.", "Gran Oro, San Francisco World Spirits Competition 2023"],
      en: ["Distillery / Bodegas y Viñedos Kuhlmann, El Portillo", "Grape / 100% Muscat of Alexandria · 40% vol.", "Grand Gold, San Francisco World Spirits Competition 2023"],
    },
    columns: {
      es: "Los Parrales es el singani de Kuhlmann desde 1983 y se destila en El Portillo: unas 400.000 botellas al año en tres etiquetas, Clásico (azul), Selección (roja) y Reserva Doble Oro (dorada). La casa lo describe cristalino y brillante, con aromas frescos a cítricos y notas frutales y florales, y lo presenta como el singani más premiado de Bolivia, con Doble Oro en 2017 y Gran Oro en San Francisco en 2023.",
      en: "Los Parrales has been Kuhlmann's singani since 1983 and is distilled at El Portillo: some 400,000 bottles a year across three labels, Clásico (blue), Selección (red) and Reserva Doble Oro (gold). The house describes it as crystal-clear and bright, with fresh citrus aromas and fruity, floral notes, and presents it as Bolivia's most awarded singani, with Double Gold in 2017 and Grand Gold in San Francisco in 2023.",
    },
    highlight: {
      es: "Una destilería con raíces cinteñas de 1930 que hoy exporta desde el pie de monte de Tarija.",
      en: "A distillery with Cinti roots from 1930 that today exports from the Tarija foothills.",
    },
    paragraph: {
      es: { heading: "ELABORACIÓN", text: "Kuhlmann reivindica un método que da un singani «más sano, más puro y más estructurado»: vino base de Moscatel, destilación y reposo en acero sin madera, como exige la categoría Gran Singani. La bodega trata sus propias aguas residuales y devuelve la materia orgánica al viñedo como abono." },
      en: { heading: "MAKING", text: "Kuhlmann claims a method that yields a singani \"healthier, purer and more structured\": Muscat base wine, distillation and a rest in steel without wood, as the Gran Singani category requires. The winery treats its own waste water and returns the organic matter to the vineyard as fertiliser." },
    },
  },
});

const t06 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1718,
    varieties: ["Cabernet Sauvignon", "Syrah", "Merlot", "Moscatel de Alejandría"],
    wineries: ["Bodega Sausini (viñedos en San Luis y Sunchuhuayco)"],
    sources: [
      "https://southamericawineguide.com/winery/sausini-winery/",
      "https://www.vivino.com/en/sausini-phi-blend/w/7480493",
      "https://www.winewithseth.com/winewiki/tarija/",
      "https://nominatim.openstreetmap.org/ (Sunchu Huayco, Municipio Uriondo) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Beige arenoso", en: "Sandy beige" },
    moisture: { es: "Franco-arenoso de quebrada, reserva hídrica moderada", en: "Gully sandy loam, moderate water reserve" },
    exposure: { es: "Norte / quebrada lateral del Valle", en: "North / side gully of the valley" },
    description: {
      es: [
        "Sunchuhuayco («quebrada de los sunchos», en quechua) es una comunidad de Uriondo situada a 1.718 metros entre Calamuchita y la ciudad, en una de las quebradas laterales que bajan del cordón oriental hacia el río Camacho. Es un rincón pequeño, pero da nombre a uno de los viñedos más singulares del valle.",
        "La Bodega Sausini, fundada en 2006 por Mario Hinojosa como proyecto de pasión, cultiva aquí y en San Luis, ya en el municipio de Tarija, las uvas de un estilo que la crítica describe como el más maduro y concentrado de todo Tarija: Cabernet Sauvignon, Syrah, Merlot y una Moscatel seca, además de un Gran Singani.",
        "La quebrada retiene algo más de humedad que la llanura y sus suelos arenosos drenan rápido; con la altura y los más de 300 días de sol del valle, la uva llega a la vendimia con hollejos gruesos y color profundo, la materia prima de los tintos de guarda de la casa.",
      ],
      en: [
        "Sunchuhuayco (\"gully of the sunchu shrubs\" in Quechua) is a community of Uriondo at 1,718 metres between Calamuchita and the city, in one of the side gullies that run down from the eastern range to the Camacho river. It is a small corner, but it names one of the valley's most distinctive vineyards.",
        "Bodega Sausini, started in 2006 by Mario Hinojosa as a passion project, grows here and at San Luis, already in Tarija municipality, the grapes for a style critics describe as the ripest and most concentrated in all Tarija: Cabernet Sauvignon, Syrah, Merlot and a dry Muscat, plus a Gran Singani.",
        "The gully holds a little more moisture than the plain and its sandy soils drain fast; with the altitude and the valley's 300-plus sunny days, the grapes reach harvest with thick skins and deep colour, the raw material for the house's age-worthy reds.",
      ],
    },
    details: {
      es: [
        "Bodega Sausini / fundada en 2006 (Mario Hinojosa)",
        "Viñedos / Sunchuhuayco (Uriondo) y San Luis (Tarija)",
        "Variedades / Cabernet Sauvignon, Syrah, Merlot, Moscatel de Alejandría",
        "Estilo / el más maduro y concentrado de Tarija (South America Wine Guide)",
        "Altitud / 1.718 m",
        "Municipio / Uriondo",
      ],
      en: [
        "Bodega Sausini / founded 2006 (Mario Hinojosa)",
        "Vineyards / Sunchuhuayco (Uriondo) and San Luis (Tarija)",
        "Varieties / Cabernet Sauvignon, Syrah, Merlot, Muscat of Alexandria",
        "Style / the ripest and most concentrated in Tarija (South America Wine Guide)",
        "Altitude / 1,718 m",
        "Municipality / Uriondo",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Sausini Phi Blend",
    kind: "vino",
    specifications: {
      es: ["Bodega / Sausini, Tarija", "Corte / Cabernet Sauvignon y Syrah", "Bodega boutique · tintos de estilo maduro y concentrado"],
      en: ["Producer / Sausini, Tarija", "Blend / Cabernet Sauvignon and Syrah", "Boutique winery · ripe, concentrated reds"],
    },
    columns: {
      es: "Phi Blend es el corte insignia de Sausini: Cabernet Sauvignon y Syrah de los viñedos de Sunchuhuayco y San Luis, vinificados con la búsqueda de madurez y densidad que distingue a la casa. La Syrah de altura aporta mora, pimienta y especia cálida sobre el esqueleto tánico del Cabernet; es un tinto de comida, pensado para carnes de la parrilla tarijeña.",
      en: "Phi Blend is Sausini's flagship cuvée: Cabernet Sauvignon and Syrah from the Sunchuhuayco and San Luis vineyards, made with the pursuit of ripeness and density that sets the house apart. High-altitude Syrah brings blackberry, pepper and warm spice over the tannic frame of Cabernet; it is a food wine, built for the Tarija grill.",
    },
    highlight: {
      es: "Sausini completa, junto a Magnus, el pequeño círculo de bodegas boutique que dan otra voz al valle frente a las grandes casas.",
      en: "Together with Magnus, Sausini completes the small circle of boutique wineries that give the valley a second voice next to the big houses.",
    },
    paragraph: {
      es: { heading: "GAMA", text: "La bodega también embotella Cabernet Sauvignon, Merlot y Syrah varietales, un Reserva de Familia, una Moscatel de Alejandría seca y un Gran Singani. No publica fichas técnicas detalladas; los datos de crianza de cada añada deben confirmarse con la casa." },
      en: { heading: "RANGE", text: "The winery also bottles varietal Cabernet Sauvignon, Merlot and Syrah, a Reserva de Familia, a dry Muscat of Alexandria and a Gran Singani. It does not publish detailed technical sheets; ageing data for each vintage should be confirmed with the house." },
    },
  },
});

const t07 = build({
  facts: {
    municipality: "Padcaya",
    province: "Aniceto Arce",
    altitude: 2095,
    varieties: ["Moscatel de Alejandría"],
    wineries: ["Bodegas y Viñedos Aranjuez – Finca Chaguaya (55 ha) y destilería de Singani Insignia"],
    sources: [
      "https://revistamoscatel.com.bo/desde-chaguaya-insignia-escribe-una-nueva-historia-del-singani/",
      "https://elpais.bo/tarija/20251024_insignia-platinum-la-evolucion-del-singani.html",
      "https://www.vinosaranjuez.com/nosotros/",
      "https://es.wikipedia.org/wiki/Vino_de_Bolivia",
      "https://nominatim.openstreetmap.org/ (Chaguaya, Municipio Padcaya) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Gris pedregoso", en: "Stony grey" },
    moisture: { es: "Ripioso y muy drenante, antiguo pastizal lechero", en: "Gravelly and very free-draining, former dairy pasture" },
    exposure: { es: "Noreste / borde entre el Valle Central y el valle de los Cóndores", en: "Northeast / rim between the Central Valley and the Cóndores valley" },
    description: {
      es: [
        "Chaguaya es el santuario mariano de Tarija y, desde 2012, una zona vitícola nueva. Está a 65 km de la capital y a 2.095 metros, en el límite entre el Valle Central y el valle de los Cóndores, cerca de Tazjara y Yunchará. Los documentos más antiguos de la viña tarijeña, de 1589–1590, ya nombran «el rincón que llaman Tolomosa, camino al valle de Chaguaya».",
        "Aranjuez compró aquí tierra que había sido pastizal y lechería y plantó 55 hectáreas de Moscatel de Alejandría sobre suelos ripiosos muy distintos de los aluviones del fondo del valle. La altitud extra y el frío nocturno alargan el ciclo y concentran los terpenos de la uva; la bodega ha registrado la zona como I.G. Chaguaya.",
        "En la finca se instalaron alambiques de cobre Chalvignac, la casa cognaçaise que fabrica equipos de destilación, para elaborar el singani Insignia y su versión Platinum. Es el experimento de altura más alto de la casa fundada en 1976.",
      ],
      en: [
        "Chaguaya is Tarija's Marian sanctuary and, since 2012, a brand-new vineyard zone. It lies 65 km from the capital at 2,095 metres, on the boundary between the Central Valley and the Cóndores valley, near Tazjara and Yunchará. The oldest records of Tarija's vines, from 1589–1590, already name \"the corner they call Tolomosa, on the road to the Chaguaya valley\".",
        "Aranjuez bought land here that had been pasture and dairy farm and planted 55 hectares of Muscat of Alexandria on gravelly soils quite unlike the alluvium of the valley floor. The extra altitude and cold nights stretch the cycle and concentrate the grape's terpenes; the winery has registered the zone as I.G. Chaguaya.",
        "Copper stills by Chalvignac, the Cognac equipment maker, were installed on the estate to produce Insignia singani and its Platinum edition. It is the highest-altitude experiment of the house founded in 1976.",
      ],
    },
    details: {
      es: [
        "Superficie de Finca Chaguaya / 55 ha",
        "Plantación / desde 2012 (finca declarada en 2015)",
        "Variedad / 100 % Moscatel de Alejandría",
        "Altitud / 2.095 m · indicación geográfica «I.G. Chaguaya»",
        "Distancia a Tarija / 65 km",
        "Municipio / Padcaya (provincia Arce)",
      ],
      en: [
        "Finca Chaguaya area / 55 ha",
        "Planting / from 2012 (estate declared 2015)",
        "Variety / 100% Muscat of Alexandria",
        "Altitude / 2,095 m · geographical indication \"I.G. Chaguaya\"",
        "Distance to Tarija / 65 km",
        "Municipality / Padcaya (Arce province)",
      ],
    },
    underground: {
      es: [
        { name: "Capa vegetal delgada sobre ripio", caption: "-0,3 metros" },
        { name: "Gravas y cantos angulosos de ladera", caption: "-1,2 metros" },
        { name: "Roca sedimentaria fracturada", caption: "" },
      ],
      en: [
        { name: "Thin topsoil over gravel", caption: "-0.3 metres" },
        { name: "Angular hillside gravels and cobbles", caption: "-1.2 metres" },
        { name: "Fractured sedimentary bedrock", caption: "" },
      ],
    },
  },
  wine: {
    name: "Singani Insignia – Aranjuez",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodegas y Viñedos Aranjuez, Finca Chaguaya", "Uva / Moscatel de Alejandría a 2.095 m", "Alambiques de cobre Chalvignac · etiquetas negra, roja y azul; edición Platinum (2025)"],
      en: ["Distillery / Bodegas y Viñedos Aranjuez, Finca Chaguaya", "Grape / Muscat of Alexandria at 2,095 m", "Chalvignac copper stills · black, red and blue labels; Platinum edition (2025)"],
    },
    columns: {
      es: "Insignia se destila con Moscatel de Alejandría de Chaguaya en alambiques franceses de última generación. La casa lo describe elegante, sutil y sofisticado, con aromas florales intensos y notas cítricas elegantes; la edición Platinum, lanzada en octubre de 2025, se obtiene por destilación lenta de las mejores parcelas y promete «finura en aromas y una presencia sedosa en boca».",
      en: "Insignia is distilled from Chaguaya Muscat of Alexandria in state-of-the-art French stills. The house describes it as elegant, subtle and sophisticated, with intense floral aromas and elegant citrus notes; the Platinum edition, launched in October 2025, comes from slow distillation of the best parcels and promises \"finesse in aromas and a silky presence on the palate\".",
    },
    highlight: {
      es: "El singani más alto de Aranjuez nace donde antes pastaban vacas lecheras: una I.G. propia a 2.095 metros.",
      en: "Aranjuez's highest singani is born where dairy cows once grazed: its own G.I. at 2,095 metres.",
    },
    paragraph: {
      es: { heading: "DENOMINACIÓN", text: "Como Gran Singani, Insignia cumple la regla de la denominación boliviana: sólo Moscatel de Alejandría cultivada por encima de 1.600 metros, destilada y embotellada en las zonas de origen, sin paso por madera. Chaguaya la sobrepasa en casi 500 metros." },
      en: { heading: "APPELLATION", text: "As a Gran Singani, Insignia follows the Bolivian appellation rule: only Muscat of Alexandria grown above 1,600 metres, distilled and bottled in the zones of origin, with no wood. Chaguaya clears that bar by almost 500 metres." },
    },
  },
});

const t08 = build({
  facts: {
    municipality: "San Lorenzo",
    province: "Eustaquio Méndez",
    altitude: 2002,
    varieties: ["Moscatel de Alejandría", "criollas para vino patero"],
    wineries: ["Vinacopio Patero (San Lorenzo, 2015)", "Bodegas artesanales del pueblo"],
    sources: [
      "https://de.wikipedia.org/wiki/San_Lorenzo_(Tarija)",
      "https://de.wikipedia.org/wiki/Municipio_San_Lorenzo_(Tarija)",
      "https://es.wikipedia.org/wiki/Vino_de_Bolivia",
      "https://rutadelvinobolivia.com/en/wineries/vinacopio-patero.html",
      "https://elpais.bo/tarija/20230327_tarija-produce-el-85-de-la-uva-del-pais-con-59-2-millones-de-kilos-al-ano.html",
      "https://www.parlamentoandino.org/index.php/actualidad/conoce-tu-region/1803-tarija-cuna-del-vino-boliviano-y-escenario-de-ecosistemas-diversos",
    ],
  },
  ground: {
    soilColour: { es: "Pardo oscuro de vega", en: "Dark meadow brown" },
    moisture: { es: "Vega del río Calama y del Guadalquivir alto, riego por acequias", en: "Floodplain of the Calama and upper Guadalquivir rivers, ditch irrigation" },
    exposure: { es: "Este / margen izquierda del río Calama", en: "East / left bank of the Calama river" },
    description: {
      es: [
        "San Lorenzo, 15 km al norte de Tarija y a 2.002 metros, es la villa donde empieza la historia escrita de la vid chapaca: los primeros registros de viñedos, de 1589 y 1590, mencionan la viña de veinte mil cepas del fundador Luis de Fuentes junto al Guadalquivir y la permuta de tierras «en el llano de viñas» y en Tolomosa. El pueblo es capital de la provincia Méndez, cuna del guerrillero Eustaquio «Moto» Méndez y capital gastronómica del valle.",
        "La provincia apenas suma el 0,5 % de la superficie de uva de Tarija: aquí la viña no es industria sino costumbre. Se cultiva en huertas y parrales familiares sobre la vega del río Calama, con unos 550 mm de lluvia concentrados entre diciembre y febrero y la fuerte oscilación térmica diaria del borde del altiplano.",
        "La tradición del vino patero, el mosto pisado a pie, se remonta aquí a 1604 según los productores locales. Vinacopio Patero, una bodega familiar abierta en 2015 en la calle Rodolfo Ávila, la recuperó con vino sin conservantes, singani añejo y aguardientes de fruta, y recibe visitas todos los días.",
      ],
      en: [
        "San Lorenzo, 15 km north of Tarija at 2,002 metres, is the town where the written history of Tarija's vines begins: the earliest records, from 1589 and 1590, mention founder Luis de Fuentes's vineyard of twenty thousand vines beside the Guadalquivir and land swaps \"on the plain of vineyards\" and at Tolomosa. The town is capital of Méndez province, birthplace of the guerrilla leader Eustaquio \"Moto\" Méndez and the valley's gastronomic capital.",
        "The province holds barely 0.5% of Tarija's grape area: here the vine is custom rather than industry. It grows in family orchards and arbours on the Calama river floodplain, with about 550 mm of rain between December and February and the sharp daily temperature swing of the altiplano's edge.",
        "The patero tradition, must trodden by foot, dates here to 1604 according to local producers. Vinacopio Patero, a family winery opened in 2015 on Calle Rodolfo Ávila, revived it with preservative-free wine, aged singani and fruit brandies, and receives visitors every day.",
      ],
    },
    details: {
      es: [
        "Primeros registros de viña / 1589–1590",
        "Superficie de uva de la provincia Méndez / 0,5 % del total de Tarija",
        "Vinacopio Patero / fundada en 2015",
        "Población del pueblo / 3.401 hab. (2012)",
        "Lluvia anual / ≈ 550 mm",
        "Distancia a Tarija / 15 km",
      ],
      en: [
        "First vineyard records / 1589–1590",
        "Méndez province vine area / 0.5% of Tarija's total",
        "Vinacopio Patero / founded 2015",
        "Town population / 3,401 (2012)",
        "Annual rainfall / ≈ 550 mm",
        "Distance to Tarija / 15 km",
      ],
    },
    underground: {
      es: [
        { name: "Suelo de vega, franco oscuro", caption: "-0,5 metros" },
        { name: "Gravas y arenas del río Calama", caption: "-1,4 metros" },
        { name: "Conglomerado del pie de monte", caption: "" },
      ],
      en: [
        { name: "Dark loamy floodplain soil", caption: "-0.5 metres" },
        { name: "Calama river gravels and sands", caption: "-1.4 metres" },
        { name: "Foothill conglomerate", caption: "" },
      ],
    },
  },
  wine: {
    name: "Vino patero – Vinacopio Patero",
    kind: "vino",
    specifications: {
      es: ["Bodega / Vinacopio Patero, San Lorenzo (calle Rodolfo Ávila 1055)", "Método / uva pisada, fermentación natural, sin conservantes ni aditivos", "También singani añejo, aguardientes de fruta y ron chapaco"],
      en: ["Producer / Vinacopio Patero, San Lorenzo (Calle Rodolfo Ávila 1055)", "Method / foot-trodden grapes, natural fermentation, no preservatives or additives", "Also aged singani, fruit brandies and Tarija rum"],
    },
    columns: {
      es: "El vino patero es el vino campesino del valle: uva pisada en noques de piedra o cemento, fermentación espontánea y consumo joven, dulce o semidulce. Vinacopio Patero lo defiende como producto cien por ciento natural, vegano y orgánico, y lo acompaña de un singani añejo y de aguardientes de fruta que embotella bajo las marcas TAITA y MAMÁ.",
      en: "Patero wine is the valley's peasant wine: grapes trodden in stone or cement troughs, spontaneous fermentation and young drinking, sweet or semi-sweet. Vinacopio Patero defends it as a wholly natural, vegan and organic product, alongside an aged singani and fruit brandies bottled under the TAITA and MAMÁ labels.",
    },
    highlight: {
      es: "En el pueblo donde se documentó la primera viña de Tarija, el vino se sigue haciendo con los pies.",
      en: "In the town where Tarija's first vineyard was recorded, wine is still made by foot.",
    },
    paragraph: {
      es: { heading: "VISITA", text: "La bodega abre de lunes a domingo de 8:00 a 18:00 con degustación y explicación del proceso. Es la mejor puerta para entender el otro Tarija: el de los parrales de patio, las falcas de cobre y las ferias de junio en las comunidades de Méndez." },
      en: { heading: "VISIT", text: "The winery opens Monday to Sunday, 8:00 to 18:00, with tasting and an explanation of the process. It is the best door into the other Tarija: courtyard arbours, copper falca stills and the June fairs of the Méndez communities." },
    },
  },
});

const t09 = build({
  facts: {
    municipality: "San Lorenzo",
    province: "Eustaquio Méndez",
    altitude: 2102,
    varieties: ["Moscatel de Alejandría", "criollas para vino patero"],
    wineries: ["Productores artesanales de la Feria del Vino Patero y Singani Casero (Sella Méndez, Sella Cercado, Rancho Norte, La Quintada, Paicho, San Isidro)"],
    sources: [
      "https://de.wikipedia.org/wiki/Sella_M%C3%A9ndez",
      "https://elpais.bo/tarija/20240622_invitan-a-la-feria-del-vino-patero-en-sella-mendez.html",
      "https://elpais.bo/alcaldia-tarija/20190624_feria-del-vino-y-singani-se-desarrolla-desde-hace-mas-de-25-anos.html",
      "https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html",
      "https://www.tarija.bo/tarija/conozcamos-tarija/",
    ],
  },
  ground: {
    soilColour: { es: "Pardo claro", en: "Light brown" },
    moisture: { es: "Terrazas del río Sella, riego por acequia; heladas tardías", en: "Sella river terraces, ditch irrigation; late frosts" },
    exposure: { es: "Norte / valle alto abierto", en: "North / open upper valley" },
    description: {
      es: [
        "Sella Méndez está 18 km al norte de Tarija, a 2.102 metros, en el valle alto que comparte con Sella Cercado al otro lado del río. Figura entre las parroquias donde los misioneros coloniales llevaron la vid junto con Santa Ana, Concepción, Calamuchita, Chocloca, La Angostura y San Lorenzo, y es hoy la capital informal del vino patero y del singani casero del departamento.",
        "Cada mes de junio, desde hace más de 25 años, la comunidad acoge la Feria del Vino Patero y Singani Casero: una treintena de expositores de Sella Méndez, Sella Cercado, Rancho Norte, La Quintada, Paicho y San Isidro sacan sus vinos dulces, semidulces y pateros y sus singanis destilados en falcas familiares, a precios de 20 a 25 bolivianos la botella.",
        "A esta altura la Moscatel de Alejandría madura tarde y con mucha aromática; el frío nocturno del borde de la puna conserva la acidez pero expone a heladas y granizo. Son viñas de pocas hectáreas, mezcladas con huertas, que sostienen una economía doméstica más que industrial.",
      ],
      en: [
        "Sella Méndez lies 18 km north of Tarija at 2,102 metres, in the upper valley it shares with Sella Cercado across the river. It is listed among the parishes where colonial missionaries brought the vine together with Santa Ana, Concepción, Calamuchita, Chocloca, La Angostura and San Lorenzo, and today it is the informal capital of the department's patero wine and home-made singani.",
        "Every June, for more than 25 years, the community has hosted the Patero Wine and Home Singani Fair: some thirty exhibitors from Sella Méndez, Sella Cercado, Rancho Norte, La Quintada, Paicho and San Isidro bring out their sweet, semi-sweet and patero wines and their singanis distilled in family falca stills, at 20 to 25 bolivianos a bottle.",
        "At this altitude Muscat of Alexandria ripens late and very aromatic; the cold nights on the edge of the puna keep the acidity but expose the vines to frost and hail. These are vineyards of a few hectares mixed with orchards, sustaining a household rather than an industrial economy.",
      ],
    },
    details: {
      es: [
        "Feria del Vino Patero y Singani Casero / cada junio, > 25 ediciones",
        "Expositores / ≈ 30 productores de 6 comunidades",
        "Variedad principal / Moscatel de Alejandría",
        "Precio de referencia / vino 20 Bs · singani 20–25 Bs",
        "Altitud / 2.102 m",
        "Distancia a Tarija / 18 km",
      ],
      en: [
        "Patero Wine and Home Singani Fair / every June, > 25 editions",
        "Exhibitors / ≈ 30 producers from 6 communities",
        "Main variety / Muscat of Alexandria",
        "Reference price / wine 20 Bs · singani 20–25 Bs",
        "Altitude / 2,102 m",
        "Distance to Tarija / 18 km",
      ],
    },
    underground: {
      es: [
        { name: "Franco claro de terraza alta", caption: "-0,4 metros" },
        { name: "Cantos rodados y arena del río Sella", caption: "-1,3 metros" },
        { name: "Arcillas compactas del valle alto", caption: "" },
      ],
      en: [
        { name: "Pale loam of the upper terrace", caption: "-0.4 metres" },
        { name: "Sella river cobbles and sand", caption: "-1.3 metres" },
        { name: "Compact clays of the upper valley", caption: "" },
      ],
    },
  },
  wine: {
    name: "Singani casero de Sella Méndez",
    kind: "singani",
    specifications: {
      es: ["Productores / familias de Sella Méndez y comunidades vecinas (Feria de junio)", "Uva / Moscatel de Alejandría de parral familiar", "Destilación en falca (alambique rústico) · sin marca industrial"],
      en: ["Producers / families of Sella Méndez and neighbouring communities (June fair)", "Grape / Muscat of Alexandria from family arbours", "Distilled in a falca (rustic still) · no industrial brand"],
    },
    columns: {
      es: "El singani casero de Sella se destila en falcas, los alambiques rústicos de las haciendas coloniales, a partir de vino de Moscatel fermentado en la propia casa. Sale sin etiqueta comercial, con la intensidad de uva fresca y flor blanca que la Moscatel de altura da al destilado joven, y se vende en la feria de junio junto al vino patero, las humintas y las coplas.",
      en: "Sella's home singani is distilled in falcas, the rustic stills of the colonial haciendas, from Muscat wine fermented at home. It comes without a commercial label, with the fresh-grape and white-flower intensity that high-altitude Muscat gives a young spirit, and it is sold at the June fair alongside patero wine, humintas and copla singing.",
    },
    highlight: {
      es: "Ninguna gran marca: treinta familias, una feria de junio y el aguardiente tal como se hacía antes de la denominación de origen.",
      en: "No big brand: thirty families, a June fair and the spirit as it was made before the appellation existed.",
    },
    paragraph: {
      es: { heading: "NOTA", text: "Al tratarse de producción doméstica no existe ficha técnica publicada; la graduación y el reposo varían de una casa a otra. La feria se organiza con la alcaldía de San Lorenzo y la gobernación como apoyo al sector productivo de la provincia Méndez." },
      en: { heading: "NOTE", text: "Being household production there is no published technical sheet; strength and rest vary from house to house. The fair is organised with the San Lorenzo municipality and the departmental government in support of Méndez province's producers." },
    },
  },
});

const t10 = build({
  facts: {
    municipality: "Tarija (Cercado)",
    province: "Cercado",
    altitude: 2230,
    varieties: ["Moscatel de Alejandría", "Ruby Cabernet"],
    wineries: ["Finca Integral La Tradición (Yesera Norte)", "Ruta turística del Singani Artesanal y los Molinos de Piedra"],
    sources: [
      "https://elpais.bo/economia/20230326_singani-la-tradicion-las-uvas-de-yesera-que-cautivan.html",
      "https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html",
      "https://tarijaturismo.com/comunidad-de-yesera-ruta-turistica-del-singani-artesanal-y-los-molinos-de-piedra/",
      "https://nominatim.openstreetmap.org/ (Yesera Norte, Municipio Tarija) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Pardo rojizo con yeso", en: "Reddish brown with gypsum" },
    moisture: { es: "Terrazas del río Yesera, riego tecnificado", en: "Yesera river terraces, technified irrigation" },
    exposure: { es: "Oeste / valle lateral al noreste de la ciudad", en: "West / side valley northeast of the city" },
    description: {
      es: [
        "Yesera es un valle lateral al noreste de Tarija, en el municipio de Cercado, cuyo nombre viene de las yeseras que abastecieron a la ciudad colonial. Sus comunidades, Yesera Norte y Yesera Sur, están a unos 2.230 metros sobre el río Yesera y conservan molinos de piedra y falcas coloniales que hoy forman la «Ruta turística del Singani Artesanal y los Molinos de Piedra».",
        "La Finca Integral La Tradición, en Yesera Norte, es la referencia. La propiedad perteneció a la familia Guerrero desde hacia 1940 y conserva la falca más antigua de la comunidad; en 2005 la compró la abogada Mary Soledad Tárraga con su esposo agricultor, y desde entonces destilan unos 2.000 litros de singani al año con Moscatel de Alejandría de una hectárea y media en espaldera, con riego tecnificado.",
        "Los 2.230 metros ralentizan la maduración y conservan los aromas de la uva, argumento central de la casa. El singani ya se exporta a Argentina y Ecuador y desde 2021 cuenta con los registros de Senasag, Senapi y el sello Hecho en Bolivia.",
      ],
      en: [
        "Yesera is a side valley northeast of Tarija, in Cercado municipality, named after the gypsum pits that supplied the colonial city. Its communities, Yesera Norte and Yesera Sur, sit at about 2,230 metres above the Yesera river and keep stone mills and colonial falca stills that today form the \"Artisanal Singani and Stone Mills tourist route\".",
        "Finca Integral La Tradición in Yesera Norte is the reference. The property belonged to the Guerrero family from around 1940 and keeps the community's oldest falca; in 2005 lawyer Mary Soledad Tárraga and her farmer husband bought it, and since then they distil some 2,000 litres of singani a year from Muscat of Alexandria on a hectare and a half of trellised vines under technified irrigation.",
        "The 2,230 metres slow ripening and preserve the grape's aromas, the house's central argument. The singani is already exported to Argentina and Ecuador and since 2021 carries Senasag and Senapi registration and the Hecho en Bolivia seal.",
      ],
    },
    details: {
      es: [
        "Superficie de viña de La Tradición / ≈ 1,5 ha en espaldera",
        "Producción / ≈ 2.000 litros de singani al año",
        "Variedades / Moscatel de Alejandría, Ruby Cabernet",
        "Falca / la más antigua de la comunidad (≈ 1940)",
        "Altitud / 2.230 m",
        "Exportaciones / Argentina y Ecuador",
      ],
      en: [
        "La Tradición vine area / ≈ 1.5 ha trellised",
        "Output / ≈ 2,000 litres of singani a year",
        "Varieties / Muscat of Alexandria, Ruby Cabernet",
        "Falca / the community's oldest (≈ 1940)",
        "Altitude / 2,230 m",
        "Exports / Argentina and Ecuador",
      ],
    },
    underground: {
      es: [
        { name: "Franco rojizo de terraza", caption: "-0,4 metros" },
        { name: "Gravas del río Yesera con yeso", caption: "-1,2 metros" },
        { name: "Margas yesíferas", caption: "" },
      ],
      en: [
        { name: "Reddish terrace loam", caption: "-0.4 metres" },
        { name: "Yesera river gravels with gypsum", caption: "-1.2 metres" },
        { name: "Gypsum-bearing marls", caption: "" },
      ],
    },
  },
  wine: {
    name: "Singani La Tradición",
    kind: "singani",
    specifications: {
      es: ["Productor / Finca Integral La Tradición, Yesera Norte", "Uva / Moscatel de Alejandría de Yesera (2.230 m)", "Destilación artesanal en falca · ≈ 2.000 litros al año"],
      en: ["Producer / Finca Integral La Tradición, Yesera Norte", "Grape / Muscat of Alexandria from Yesera (2,230 m)", "Artisanal falca distillation · ≈ 2,000 litres a year"],
    },
    columns: {
      es: "La Tradición usa únicamente uva de la comunidad de Yesera y destila en la falca de la finca, a la orilla del río. La familia sostiene que la altura permite conservar las características organolépticas de la Moscatel, aroma y sabor, en el destilado. Junto al singani elaboran licores de frutas maceradas, frutilla sobre todo, cultivadas en la misma finca.",
      en: "La Tradición uses only grapes from the Yesera community and distils in the estate's falca on the riverbank. The family holds that altitude lets the spirit keep the Muscat's organoleptic character, aroma and flavour. Alongside the singani they make liqueurs from macerated fruit, mainly strawberries, grown on the same farm.",
    },
    highlight: {
      es: "Dieciocho años de una finca de hectárea y media que ya vende su singani fuera de Bolivia.",
      en: "Eighteen years of a hectare-and-a-half farm that already sells its singani outside Bolivia.",
    },
    paragraph: {
      es: { heading: "AGROTURISMO", text: "La finca recibe visitas para recorrer el viñedo, los cultivos agroecológicos y la falca, dentro de la ruta del singani artesanal de Yesera. Es una escala obligada para quien quiera ver un alambique de hacienda en funcionamiento a media hora de la ciudad." },
      en: { heading: "AGRITOURISM", text: "The farm receives visitors to walk the vineyard, the agro-ecological crops and the falca, as part of Yesera's artisanal singani route. It is a must for anyone wanting to see a hacienda still at work half an hour from the city." },
    },
  },
});

const t11 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1762,
    varieties: ["Moscatel de Alejandría", "variedades tintas de altura"],
    wineries: ["Viñedos y Bodega Boutique Daroca (viñedos en Colón Norte y Pampa la Villa)", "Distrito Colón de Uriondo"],
    sources: [
      "https://bodegadaroca.com/bodega/",
      "https://revistamoscatel.com.bo/una-bodega-te-cuenta-su-historia-a-cuadras-del-centro-de-la-ciudad/",
      "https://www.bodegakindgard.com/product-page/singani-daroca-etiqueta-negra",
      "https://elpais.bo/sociales/20241024_bodega-daroca-se-abre-paso-en-argentina.html",
      "https://lavozdetarija.com/2024/11/04/tarija-granizada-devasta-cultivos-en-comunidades-de-uriondo-y-productores-claman-por-apoyo/",
      "https://nominatim.openstreetmap.org/ (Colon Norte, Municipio Uriondo) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Ocre rojizo", en: "Reddish ochre" },
    moisture: { es: "Franco profundo de la margen del Camacho, riego por gravedad", en: "Deep loam on the Camacho bank, gravity irrigation" },
    exposure: { es: "Noreste / llanura al sur del Valle", en: "Northeast / plain south of the Valle" },
    description: {
      es: [
        "Colón Norte y Colón Sud forman el distrito Colón de Uriondo, unos kilómetros al sur del Valle de la Concepción, a 1.762 metros sobre la margen del río Camacho. Son comunidades de viñedo puro: en noviembre de 2024 una granizada dejó sin cosecha a Colón Norte, Colón Sud, Calamuchita y Muturayo, y el distrito figura entre las 16 comunidades del proyecto de riego que debe asegurar el agua de 1.682 familias del valle.",
        "Aquí consolidó sus viñedos, junto con los de Pampa la Villa, la familia Daroca. Tomás Daroca llegó de España a fines del siglo XIX y se afincó primero junto al río San Juan del Oro, en los Cintis; la bodega data de 1920 y hoy la cuarta generación vinifica en una casa boutique del barrio Miraflores, a pocas cuadras del centro de Tarija.",
        "El suelo franco profundo y el riego del Camacho dan aquí Moscatel de Alejandría de alto rendimiento, base de los singanis de la casa, y tintos de altura que Daroca empezó a exportar a Argentina en 2024.",
      ],
      en: [
        "Colón Norte and Colón Sud form Uriondo's Colón district, a few kilometres south of Valle de la Concepción at 1,762 metres on the bank of the Camacho river. They are pure vineyard communities: in November 2024 a hailstorm wiped out the harvest in Colón Norte, Colón Sud, Calamuchita and Muturayo, and the district is among the 16 communities of the irrigation scheme meant to secure water for 1,682 valley families.",
        "This is where the Daroca family consolidated its vineyards, together with those at Pampa la Villa. Tomás Daroca arrived from Spain in the late 19th century and first settled by the San Juan del Oro river in the Cintis; the winery dates from 1920 and today the fourth generation makes wine in a boutique house in the Miraflores district, a few blocks from downtown Tarija.",
        "The deep loam and Camacho irrigation give high-yielding Muscat of Alexandria here, the base of the house's singanis, and altitude reds that Daroca began exporting to Argentina in 2024.",
      ],
    },
    details: {
      es: [
        "Bodega Daroca / desde 1920 · cuarta generación",
        "Viñedos familiares / Colón Norte y Pampa la Villa",
        "Variedades / Moscatel de Alejandría, tintas de altura",
        "Productos / Singani Etiqueta Negra (38 %), Etiqueta Roja, Singañac",
        "Altitud / 1.762 m",
        "Municipio / Uriondo (distrito Colón)",
      ],
      en: [
        "Bodega Daroca / since 1920 · fourth generation",
        "Family vineyards / Colón Norte and Pampa la Villa",
        "Varieties / Muscat of Alexandria, altitude reds",
        "Products / Singani Etiqueta Negra (38%), Etiqueta Roja, Singañac",
        "Altitude / 1,762 m",
        "Municipality / Uriondo (Colón district)",
      ],
    },
    underground: TARIJA_PROFILE,
  },
  wine: {
    name: "Singani Daroca Etiqueta Negra",
    kind: "singani",
    specifications: {
      es: ["Bodega / Viñedos y Bodega Boutique Daroca, Tarija", "Uva / Moscatel de Alejandría de los valles altos de Tarija · 38 % vol.", "Doble destilación en alambiques tradicionales"],
      en: ["Producer / Viñedos y Bodega Boutique Daroca, Tarija", "Grape / Muscat of Alexandria from Tarija's high valleys · 38% vol.", "Double distilled in traditional stills"],
    },
    columns: {
      es: "El Etiqueta Negra es el singani de referencia de Daroca: doble destilación en alambiques tradicionales, método artesanal y 38 grados. La ficha del distribuidor lo describe cristalino y brillante; en nariz florales y cítricos propios de la Moscatel; en boca suave, seco y equilibrado, de textura delicada y final limpio, largo y expresivo.",
      en: "Etiqueta Negra is Daroca's reference singani: double distillation in traditional stills, artisanal method and 38% vol. The distributor's sheet describes it as crystal-clear and bright; floral and citrus Muscat aromas on the nose; soft, dry and balanced on the palate, with a delicate texture and a clean, long, expressive finish.",
    },
    highlight: {
      es: "La única casa que embotella «Singañac», su cruce de singani y crianza a la manera del coñac.",
      en: "The only house bottling \"Singañac\", its cross between singani and cognac-style ageing.",
    },
    paragraph: {
      es: { heading: "GAMA", text: "Además del Etiqueta Negra y el Etiqueta Roja, Daroca elabora vinos de altura con uva de Colón Norte y Pampa la Villa. La bodega del barrio Miraflores organiza veladas y catas con arte, una de las experiencias enoturísticas más citadas de la ciudad." },
      en: { heading: "RANGE", text: "Besides Etiqueta Negra and Etiqueta Roja, Daroca makes altitude wines from Colón Norte and Pampa la Villa fruit. The Miraflores winery hosts evening tastings with art, one of the city's most talked-about wine-tourism experiences." },
    },
  },
});

const t12 = build({
  facts: {
    municipality: "Uriondo",
    province: "José María Avilés",
    altitude: 1696,
    varieties: ["Moscatel de Alejandría", "criollas y variedades de mesa"],
    wineries: ["Cooperativa Vitivinícola La Angostura Ltda.", "La Casa Vieja – Vinos Doña Vita (Valle de la Concepción)"],
    sources: [
      "https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html",
      "https://www.opinion.com.bo/articulo/economi%C2%ADa/tarija-sabor-uva-aroma-singani-vino/20120318001300408868.html",
      "https://biblioteca.uajms.edu.bo/biblioteca/opac_css/doc_num.php?explnum_id=26431",
      "https://www.lacasavieja.info/historia.php",
      "https://www.uajms.edu.bo/secretaria-academica/wp-content/uploads/sites/48/2024/09/3.4___Plan-Departamental-de-Ordenamiento-Territorial-deTarija-PDOTT-2006-2025.pdf",
      "https://nominatim.openstreetmap.org/ (La Angostura, Municipio Uriondo) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Beige arcilloso", en: "Clayey beige" },
    moisture: { es: "Sedimentos del antiguo lago, retienen humedad en la seca", en: "Ancient lake sediments, hold moisture through the dry season" },
    exposure: { es: "Sureste / boca del cañón", en: "Southeast / mouth of the canyon" },
    description: {
      es: [
        "La Angostura es el punto más bajo del Valle Central: a 1.696 metros, donde el río Camacho se une al Guadalquivir para formar el río Tarija y salir del valle por un cañón estrecho. Ese cañón drenó el antiguo lago que ocupaba la cuenca, y de ahí vienen los sedimentos arcillo-arenosos que hoy sostienen los viñedos de todo el valle.",
        "La comunidad fue una de las parroquias vitícolas coloniales y sigue siendo productora de uva: la Cooperativa Vitivinícola La Angostura Ltda., presidida por Gualberto Quispe, agrupa a los viñateros y entrega su cosecha a las bodegas del municipio. Como el resto de Uriondo, depende del caudal del Camacho, que en la seca de 2022 llegó a cortarse.",
        "A la entrada del cañón, en el pueblo del Valle de la Concepción, La Casa Vieja mantiene el vino patero de hacienda: la casa tiene unos cuatro siglos, embotella desde 1978 con la marca Doña Vita y sigue pisando parte de la uva a pie, sin químicos, con doce referencias entre vinos y licores.",
      ],
      en: [
        "La Angostura is the lowest point of the Central Valley: at 1,696 metres, where the Camacho joins the Guadalquivir to form the Tarija river and leave the valley through a narrow canyon. That canyon drained the ancient lake that once filled the basin, and from it come the sandy-clay sediments that carry the vineyards of the whole valley today.",
        "The community was one of the colonial wine parishes and still grows grapes: the Cooperativa Vitivinícola La Angostura Ltda., chaired by Gualberto Quispe, gathers the growers and delivers their harvest to the municipality's wineries. Like the rest of Uriondo it depends on the Camacho's flow, which in the 2022 drought was cut off entirely.",
        "At the canyon entrance, in the town of Valle de la Concepción, La Casa Vieja keeps hacienda patero wine alive: the house is some four centuries old, has bottled under the Doña Vita label since 1978 and still treads part of its grapes by foot, chemical-free, with twelve references across wines and liqueurs.",
      ],
    },
    details: {
      es: [
        "Cooperativa Vitivinícola La Angostura / productores asociados de la comunidad",
        "Confluencia / ríos Camacho y Guadalquivir → río Tarija",
        "Variedades / Moscatel de Alejandría, criollas, uva de mesa",
        "Casa Vieja / hacienda de ≈ 400 años · vinos Doña Vita desde 1978",
        "Altitud / 1.696 m (la más baja del valle)",
        "Municipio / Uriondo",
      ],
      en: [
        "Cooperativa Vitivinícola La Angostura / associated growers of the community",
        "Confluence / Camacho and Guadalquivir rivers → Tarija river",
        "Varieties / Muscat of Alexandria, criollas, table grapes",
        "Casa Vieja / ≈ 400-year-old hacienda · Doña Vita wines since 1978",
        "Altitude / 1,696 m (the valley's lowest)",
        "Municipality / Uriondo",
      ],
    },
    underground: {
      es: [
        { name: "Franco arcilloso de fondo de cuenca", caption: "-0,5 metros" },
        { name: "Sedimentos lacustres arcillo-arenosos", caption: "-2,0 metros" },
        { name: "Conglomerados del cañón de la Angostura", caption: "" },
      ],
      en: [
        { name: "Clay loam of the basin floor", caption: "-0.5 metres" },
        { name: "Sandy-clay lake sediments", caption: "-2.0 metres" },
        { name: "Conglomerates of the Angostura canyon", caption: "" },
      ],
    },
  },
  wine: {
    name: "Vino patero Doña Vita – La Casa Vieja",
    kind: "vino",
    specifications: {
      es: ["Bodega / La Casa Vieja, Valle de la Concepción (Uriondo)", "Método / uva pisada a pie, sin químicos · marca Doña Vita desde 1978", "12 referencias entre vinos y licores"],
      en: ["Producer / La Casa Vieja, Valle de la Concepción (Uriondo)", "Method / foot-trodden grapes, no chemicals · Doña Vita label since 1978", "12 references across wines and liqueurs"],
    },
    columns: {
      es: "La Casa Vieja construyó piletas para pisar la uva y empezó a elaborar vino patero en cantidad a fines de los setenta; el nombre Doña Vita homenajea a Victoria Quiroga. Los vinos son jóvenes, frutales y a menudo dulces o semidulces, embotellados sin conservantes; el patero se sirve fresco con el picante de la casa en el restaurante contiguo.",
      en: "La Casa Vieja built treading troughs and began making patero wine in quantity in the late 1970s; the Doña Vita name honours Victoria Quiroga. The wines are young, fruity and often sweet or semi-sweet, bottled without preservatives; the patero is served cool with the house picante in the adjoining restaurant.",
    },
    highlight: {
      es: "Cuatro siglos de hacienda a la puerta del cañón que dio forma a todo el valle.",
      en: "Four centuries of hacienda at the door of the canyon that shaped the whole valley.",
    },
    paragraph: {
      es: { heading: "VISITA", text: "Abre de lunes a viernes de 10:00 a 18:00 con bodega artesanal y degustación. Junto con el Cañón de la Angostura y el mirador sobre la confluencia, es la parada final clásica de la Ruta del Vino y el Singani de Altura." },
      en: { heading: "VISIT", text: "Open Monday to Friday, 10:00 to 18:00, with an artisanal cellar and tasting. Together with the Angostura canyon and the viewpoint over the confluence, it is the classic last stop of the High-Altitude Wine and Singani Route." },
    },
  },
});

const t13 = build({
  facts: {
    municipality: "Tarija (Cercado)",
    province: "Cercado",
    altitude: 1920,
    varieties: ["Tannat", "Merlot", "Cabernet Franc", "Bonarda", "Moscatel de Alejandría", "Petit Verdot", "Malbec"],
    wineries: ["Bodegas y Viñedos Aranjuez – Finca El Origen (1999)", "Casa Real (destilería, familia Granier, 1925)", "Campos de Solana (2000)"],
    sources: [
      "https://www.vinosaranjuez.com/nosotros/",
      "https://www.vinosaranjuez.com/vinos/juan-cruz/",
      "https://www.singanicasareal.com/gran-singani/",
      "https://www.lostiempos.com/actualidad/economia/20160720/tannat-campos-solana-es-reconocido-londres",
      "https://elperiodico.com.bo/como-campos-de-solana-y-casa-real-han-contribuido-para-celebrar-una-vendimia-resiliente-y-prometedora/",
      "https://nominatim.openstreetmap.org/ (Santa Ana La Nueva, Municipio Tarija) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Pardo claro laminar", en: "Pale laminated brown" },
    moisture: { es: "Franco arcillo-limoso laminar, riego por goteo", en: "Laminated clay-silt loam, drip irrigation" },
    exposure: { es: "Norte / terraza alta del valle de Santa Ana", en: "North / upper terrace of the Santa Ana valley" },
    description: {
      es: [
        "Santa Ana la Nueva es la parte alta del valle de Santa Ana, a 1.920 metros y unos 20 km al sur de la ciudad. Aquí Aranjuez tiene su Finca El Origen, donde en 1999 plantó en el lote 40 la primera Tannat de Bolivia; de esa parcela y de Santa Ana la Vieja salió Juan Cruz, el vino que en 2013 ganó la primera Gran Medalla de Oro OIV del país en Montevideo.",
        "En la misma cuenca está la destilería Casa Real, que la familia Granier opera sin interrupción desde 1925 con alambiques de la zona de Cognac, y la bodega Campos de Solana, fundada en 2000, que cultiva más de 40 hectáreas y produce 1,5 millones de botellas al año; su Tannat Único fue medalla de platino en Decanter 2016.",
        "Los suelos son franco arcillo-limosos de estructura laminar, según la ficha de Aranjuez, sobre la terraza alta del río Santa Ana; con la altitud y la amplitud térmica del valle dan Tannat de hollejo grueso que resiste el sol y madura los taninos sin perder frescura.",
      ],
      en: [
        "Santa Ana la Nueva is the upper part of the Santa Ana valley, at 1,920 metres some 20 km south of the city. Aranjuez has its Finca El Origen here, where in 1999 it planted Bolivia's first Tannat on lot 40; from that plot and from Santa Ana la Vieja came Juan Cruz, the wine that in 2013 won the country's first OIV Grand Gold Medal in Montevideo.",
        "The same basin holds the Casa Real distillery, run by the Granier family without interruption since 1925 with stills from the Cognac region, and the Campos de Solana winery, founded in 2000, which farms more than 40 hectares and makes 1.5 million bottles a year; its Tannat Único took a Platinum medal at Decanter 2016.",
        "Soils are laminated clay-silt loams, according to Aranjuez's sheet, on the upper terrace of the Santa Ana river; with the valley's altitude and thermal swing they give thick-skinned Tannat that withstands the sun and ripens its tannins without losing freshness.",
      ],
    },
    details: {
      es: [
        "Finca El Origen (Aranjuez) / plantada en 1999 · primera Tannat de Bolivia (lote 40)",
        "Casa Real / destilería de la familia Granier desde 1925",
        "Campos de Solana / fundada en 2000 · > 40 ha · 1,5 M botellas",
        "Variedades / Tannat, Merlot, Cabernet Franc, Bonarda, Moscatel de Alejandría",
        "Suelo / franco arcillo-limoso laminar",
        "Altitud / 1.920 m",
      ],
      en: [
        "Finca El Origen (Aranjuez) / planted 1999 · Bolivia's first Tannat (lot 40)",
        "Casa Real / Granier family distillery since 1925",
        "Campos de Solana / founded 2000 · > 40 ha · 1.5 M bottles",
        "Varieties / Tannat, Merlot, Cabernet Franc, Bonarda, Muscat of Alexandria",
        "Soil / laminated clay-silt loam",
        "Altitude / 1,920 m",
      ],
    },
    underground: {
      es: [
        { name: "Franco arcillo-limoso laminar", caption: "-0,5 metros" },
        { name: "Limos y arenas finas de terraza", caption: "-1,6 metros" },
        { name: "Sedimentos lacustres compactos", caption: "" },
      ],
      en: [
        { name: "Laminated clay-silt loam", caption: "-0.5 metres" },
        { name: "Fine terrace silts and sands", caption: "-1.6 metres" },
        { name: "Compact lake sediments", caption: "" },
      ],
    },
  },
  wine: {
    name: "Aranjuez Juan Cruz Tannat",
    kind: "vino",
    specifications: {
      es: ["Bodega / Bodegas y Viñedos Aranjuez", "Variedad / Tannat de Santa Ana la Vieja y Santa Ana la Nueva (añada 2020)", "Crianza / 12 meses en barrica nueva de roble francés + 12 meses en botella"],
      en: ["Producer / Bodegas y Viñedos Aranjuez", "Variety / Tannat from Santa Ana la Vieja and Santa Ana la Nueva (2020 vintage)", "Ageing / 12 months in new French oak + 12 months in bottle"],
    },
    columns: {
      es: "Juan Cruz lleva el nombre del trabajador más antiguo de Aranjuez. La ficha de la bodega lo describe rojo violáceo intenso con matices negros; nariz de fruta negra madura con vainilla y cacao aportados por la barrica; boca untuosa, de taninos amables, larga y armónica. Se recomienda con carnes rojas y de caza con buena grasa.",
      en: "Juan Cruz is named after Aranjuez's longest-serving worker. The winery's sheet describes it as intense violet-red with black nuances; a nose of ripe dark fruit with vanilla and cocoa from the barrel; an unctuous palate with gentle tannins, long and harmonious. Recommended with red meat and game with good fat.",
    },
    highlight: {
      es: "Primera Gran Medalla de Oro de Bolivia en un concurso OIV (Montevideo, 2013): el Tannat de altura entró en el mapa con este vino.",
      en: "Bolivia's first Grand Gold Medal at an OIV competition (Montevideo, 2013): high-altitude Tannat entered the map with this wine.",
    },
    paragraph: {
      es: { heading: "TERRUÑO", text: "Aranjuez atribuye la personalidad del vino a los suelos laminares de Santa Ana y a los más de 1.850 metros de altitud, que engrosan el hollejo de la Tannat y concentran color y taninos. La familia Castellanos-Cortez fundó la bodega el 31 de marzo de 1976 y es hoy la referencia boliviana de la variedad." },
      en: { heading: "TERROIR", text: "Aranjuez credits the wine's personality to Santa Ana's laminated soils and to more than 1,850 metres of altitude, which thicken Tannat's skins and concentrate colour and tannin. The Castellanos-Cortez family founded the winery on 31 March 1976 and is today Bolivia's reference for the variety." },
    },
  },
});

const t14 = build({
  facts: {
    municipality: "Tarija (Cercado)",
    province: "Cercado",
    altitude: 1878,
    varieties: ["Cabernet Sauvignon", "Syrah", "Merlot", "Sangiovese", "Nebbiolo", "Pinot Noir", "Chardonnay", "Moscatel de Alejandría"],
    wineries: ["Bodegas Magnus (bodega y viñedos en Torrecillas)"],
    sources: [
      "https://bodegasmagnus.com.bo/",
      "https://www.uyunisaltflats.travel/blog-es/bodegas-magnus-tarija/",
      "https://rutadelvinobolivia.com/es/bodegas/magnus.html",
      "https://miskisimi.com/products/magnus-gran-reserva",
      "https://nominatim.openstreetmap.org/ (Torrecillas, Municipio Tarija) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Gris pardo pedregoso", en: "Stony grey-brown" },
    moisture: { es: "Suelos francos, arenosos y pedregosos, pobres; drenaje rápido", en: "Loamy, sandy and stony poor soils; fast drainage" },
    exposure: { es: "Noreste / pie de monte al sur de la ciudad", en: "Northeast / foothill south of the city" },
    description: {
      es: [
        "Torrecillas es un barrio rural del extremo sur de Tarija, antes de la terminal de buses y a quince minutos del centro, a unos 1.870 metros. Es la sede de Bodegas Magnus, la unión de dos familias vitivinícolas: Carlos Magnus Hornschuh fundó su bodega en 1932 y los Zambrana hacían vino y singani en el Valle de la Concepción desde 1940; la marca actual nació en 2002 y salió al mercado el 4 de julio de 2006.",
        "Magnus vinifica uva propia de Torrecillas, El Portillo, el Valle de la Concepción y Santa Ana. La bodega describe su terruño con precisión: suelos francos, arenosos y pedregosos, pobres, donde la raíz se esfuerza y concentra aromas; más de 300 días de sol al año y hasta 20 °C de diferencia entre el día y la noche, que sostienen acidez y aroma y ralentizan la maduración.",
        "Desde 2021 la casa abrió su museo privado y ofrece visitas de una a cuatro horas con catas y maridajes, famosas por sus noches de paella. Es la bodega boutique más cercana al casco urbano.",
      ],
      en: [
        "Torrecillas is a rural neighbourhood at the far south of Tarija, just before the bus terminal and fifteen minutes from the centre, at about 1,870 metres. It is home to Bodegas Magnus, the union of two wine families: Carlos Magnus Hornschuh founded his winery in 1932 and the Zambranas had made wine and singani in Valle de la Concepción since 1940; the current brand was born in 2002 and reached the market on 4 July 2006.",
        "Magnus vinifies its own grapes from Torrecillas, El Portillo, Valle de la Concepción and Santa Ana. The winery describes its terroir precisely: loamy, sandy and stony poor soils where roots struggle and concentrate aromas; more than 300 sunny days a year and up to 20 °C between day and night, sustaining acidity and aroma and slowing ripening.",
        "Since 2021 the house has opened its private museum and offers one- to four-hour visits with tastings and pairings, famous for its paella nights. It is the boutique winery closest to the city.",
      ],
    },
    details: {
      es: [
        "Bodegas Magnus / fundada en 2002 (raíces en 1932 y 1940)",
        "Viñedos / Torrecillas, El Portillo, Valle de la Concepción, Santa Ana",
        "Variedades / Cabernet Sauvignon, Syrah, Merlot, Sangiovese, Nebbiolo, Pinot Noir, Chardonnay",
        "Días de sol / > 300 · amplitud térmica hasta 20 °C",
        "Altitud de la bodega / ≈ 1.870 m",
        "Distancia al centro de Tarija / 15 minutos",
      ],
      en: [
        "Bodegas Magnus / founded 2002 (roots in 1932 and 1940)",
        "Vineyards / Torrecillas, El Portillo, Valle de la Concepción, Santa Ana",
        "Varieties / Cabernet Sauvignon, Syrah, Merlot, Sangiovese, Nebbiolo, Pinot Noir, Chardonnay",
        "Sunny days / > 300 · thermal amplitude up to 20 °C",
        "Winery altitude / ≈ 1,870 m",
        "Distance to downtown Tarija / 15 minutes",
      ],
    },
    underground: {
      es: [
        { name: "Franco pedregoso pobre en materia orgánica", caption: "-0,3 metros" },
        { name: "Arenas y gravas de pie de monte", caption: "-1,2 metros" },
        { name: "Conglomerado cementado", caption: "" },
      ],
      en: [
        { name: "Stony loam poor in organic matter", caption: "-0.3 metres" },
        { name: "Foothill sands and gravels", caption: "-1.2 metres" },
        { name: "Cemented conglomerate", caption: "" },
      ],
    },
  },
  wine: {
    name: "Magnus Gran Reserva Cabernet Sauvignon 2016",
    kind: "vino",
    specifications: {
      es: ["Bodega / Bodegas Magnus, Torrecillas", "Variedad / 100 % Cabernet Sauvignon del Valle de la Concepción y El Portillo · 14 % vol.", "Crianza / 24 meses en barrica de roble francés"],
      en: ["Producer / Bodegas Magnus, Torrecillas", "Variety / 100% Cabernet Sauvignon from Valle de la Concepción and El Portillo · 14% vol.", "Ageing / 24 months in French oak barrels"],
    },
    columns: {
      es: "El Gran Reserva 2016 es el tinto de guarda de Magnus: Cabernet Sauvignon de viñedos a unos 1.860 metros, dos años en roble francés y 14 grados. La casa busca «aromas frutales definidos, notas que reflejan el origen del valle y buen equilibrio entre cuerpo, acidez y final en boca». Sus varietales más jóvenes, como la Syrah, muestran rubí intenso, fruta desecada y frutilla que abre a flores con un poco de aire.",
      en: "The 2016 Gran Reserva is Magnus's cellar red: Cabernet Sauvignon from vineyards at about 1,860 metres, two years in French oak and 14% alcohol. The house aims for \"defined fruit aromas, notes that reflect the valley's origin and a good balance of body, acidity and finish\". Its younger varietals, such as the Syrah, show intense ruby, dried fruit and strawberry opening to flowers with a little air.",
    },
    highlight: {
      es: "Dos familias, un barrio a las puertas de la ciudad y un Cabernet que espera dos años en barrica antes de salir.",
      en: "Two families, a neighbourhood at the city gates and a Cabernet that waits two years in barrel before release.",
    },
    paragraph: {
      es: { heading: "GAMA", text: "Magnus también embotella Triada (corte 2017), Merlot-Cabernet, Syrah, Sangiovese, Nebbiolo, Pinot Noir, Chardonnay, un rosado y una Moscatel. La bodega no publica fichas técnicas completas en línea; los datos de crianza se han tomado de su distribuidor." },
      en: { heading: "RANGE", text: "Magnus also bottles Triada (a 2017 blend), Merlot-Cabernet, Syrah, Sangiovese, Nebbiolo, Pinot Noir, Chardonnay, a rosé and a Muscat. The winery does not publish full technical sheets online; ageing data comes from its distributor." },
    },
  },
});

/* ------------------------------------------------------------------ */
/* VALLE DE CINTI · CHUQUISACA                                          */
/* ------------------------------------------------------------------ */

const c01 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2421,
    varieties: ["Moscatel de Alejandría", "Negra Criolla (Listán Prieto)", "Vischoqueña", "Misionera", "Torrontés", "Criolla Cereza"],
    wineries: ["Bodega Cepa de Oro (familia Rivera, viñedo La Primavera)", "Bodega Vacaflores – San Francisco de la Horca", "Hacienda Virreinal La Compañía Baja (1700, reabierta 2024)", "Bodegas & Viñedos Yokich", "San Remo", "Ocho Estrellas"],
    sources: [
      "https://de.wikipedia.org/wiki/Camargo_(Chuquisaca)",
      "https://es.wikipedia.org/wiki/Valle_de_Cinti",
      "https://www.lostiempos.com/oh/tendencias/20230213/camargo-cuna-del-vino-singani",
      "https://www.vinetur.com/2023060773696/valle-de-cinti-mas-de-cuatro-siglos-de-vinos-bolivianos.html",
      "https://elpais.bo/sociales/20250227_el-vino-del-mes-vischoquena-patrimonial-de-cepa-de-oro.html",
      "https://southamericawineguide.com/guide-cinti-valley-bolivian-wines/",
      "https://correodelsur.com/capitales/20190115_la-produccion-vitivinicola-en-cinti-se-reactiva-despues-de-anos-en-crisis.html",
      "https://rutadelvinobolivia.com/es/bodegas/hacienda-virreinal-la-compania-baja.html",
    ],
  },
  ground: {
    soilColour: { es: "Rojo ferroso", en: "Iron red" },
    moisture: { es: "Terrazas del río Chico, 476 mm de lluvia, riego de acequia", en: "Río Chico terraces, 476 mm rainfall, ditch irrigation" },
    exposure: { es: "Este / fondo del cañón, laderas rojas al oeste", en: "East / canyon floor, red slopes to the west" },
    description: {
      es: [
        "Camargo, a 2.421 metros y 187 km de Tarija, es la capital de la provincia Nor Cinti y la «cuna del vino y el singani» de Bolivia. El cañón que baja hacia el sur, de unos 80 km de largo por 5 de ancho, ya se llamaba Cinti en 1584, cuando dominicos, jesuitas y franciscanos lo poblaron de viñas para abastecer a Potosí. Un censo de 1823 contaba 144 viñedos independientes; en 1902 eran 1.291 propiedades.",
        "El clima del cañón es semiárido, con 17 °C de media, unos 476 mm de lluvia y extremos de 35 a 41 °C en verano y hasta −10 °C en invierno. Los suelos del lado oeste son arcillas rojas ricas en hierro, tan intensas que la zona se conoce como Cañón Colorado; al este dominan mezclas calcáreas, arcillosas y arenosas. La vid se cría a menudo trepando molles y chañares, el sistema «mollar» que la protege del granizo y del sol y le presta notas de pimienta.",
        "Hoy el municipio vive de unas 3.500 familias viticultoras y unos 5.000 empleos. Cepa de Oro, la bodega boutique de la familia Rivera, cultiva su viñedo La Primavera a 2.330 metros en el Cañón Colorado; Vacaflores vende su Moscatel seca y su Torrontés a una cuadra de la plaza; la Hacienda La Compañía Baja, construida hacia 1700 por los jesuitas, reabrió en 2024 tras cuatro décadas cerrada.",
      ],
      en: [
        "Camargo, at 2,421 metres and 187 km from Tarija, is the capital of Nor Cinti province and Bolivia's \"cradle of wine and singani\". The canyon running south, some 80 km long by 5 wide, was already called Cinti in 1584, when Dominicans, Jesuits and Franciscans filled it with vines to supply Potosí. An 1823 census counted 144 independent vineyards; by 1902 there were 1,291 properties.",
        "The canyon's climate is semi-arid, 17 °C on average, with about 476 mm of rain and extremes of 35–41 °C in summer and down to −10 °C in winter. Soils on the west bank are iron-rich red clays, so intense that the area is known as Cañón Colorado; on the east, calcareous, clay and sand mixtures prevail. Vines are often grown climbing molle and chañar trees, the \"mollar\" system that shields them from hail and sun and lends peppery notes.",
        "Today the municipality lives from some 3,500 vine-growing families and about 5,000 jobs. Cepa de Oro, the Rivera family's boutique winery, farms its La Primavera vineyard at 2,330 metres in the Cañón Colorado; Vacaflores sells its dry Muscat and Torrontés a block from the plaza; Hacienda La Compañía Baja, built around 1700 by the Jesuits, reopened in 2024 after four decades closed.",
      ],
    },
    details: {
      es: [
        "Familias viticultoras del municipio / ≈ 3.500 · ≈ 5.000 empleos",
        "Superficie de vid del cañón de Cinti / ≈ 400 ha (2019; < 100 ha a fines de los 90)",
        "Variedades / Moscatel de Alejandría, Negra Criolla, Vischoqueña, Misionera, Torrontés",
        "Viñedo La Primavera (Cepa de Oro) / 2.330 m, Cañón Colorado",
        "Clima / 17 °C media · 476 mm · extremos 41 °C / −10 °C",
        "Distancia a Tarija / 187 km · a Sucre 340 km",
      ],
      en: [
        "Vine-growing families in the municipality / ≈ 3,500 · ≈ 5,000 jobs",
        "Vine area of the Cinti canyon / ≈ 400 ha (2019; < 100 ha in the late 1990s)",
        "Varieties / Muscat of Alexandria, Negra Criolla, Vischoqueña, Misionera, Torrontés",
        "La Primavera vineyard (Cepa de Oro) / 2,330 m, Cañón Colorado",
        "Climate / 17 °C mean · 476 mm · extremes 41 °C / −10 °C",
        "Distance to Tarija / 187 km · to Sucre 340 km",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Cepa de Oro – Tradición Cinteña Vischoqueña Patrimonial",
    kind: "vino",
    specifications: {
      es: ["Bodega / Cepa de Oro, Camargo (enólogo Jaime Rivera)", "Variedad / 100 % Vischoqueña, cruce natural de Moscatel de Alejandría y Negra Criolla", "Viñedo La Primavera · vides sobre molles · servir a 13–18 °C"],
      en: ["Producer / Cepa de Oro, Camargo (winemaker Jaime Rivera)", "Variety / 100% Vischoqueña, natural cross of Muscat of Alexandria and Negra Criolla", "La Primavera vineyard · molle-trained vines · serve at 13–18 °C"],
    },
    columns: {
      es: "La Vischoqueña es una uva que sólo existe en los Cintis: un cruce espontáneo de Moscatel y Negra Criolla identificado por ADN como único en el mundo. Cepa de Oro la vinifica sola. Las notas publicadas hablan de un rojo granate de intensidad media-baja; nariz de cereza, frutilla, granada y guinda con pétalos de rosa y pimienta de molle; boca ligera, fresca y de acidez equilibrada.",
      en: "Vischoqueña is a grape that exists only in the Cintis: a spontaneous cross of Muscat and Negra Criolla identified by DNA as unique in the world. Cepa de Oro vinifies it on its own. Published notes speak of a medium-low garnet red; a nose of cherry, strawberry, pomegranate and sour cherry with rose petals and molle pepper; a light, fresh palate with balanced acidity.",
    },
    highlight: {
      es: "Cuatro generaciones de los Rivera y una cepa que no crece en ningún otro valle del planeta.",
      en: "Four generations of the Rivera family and a vine that grows in no other valley on the planet.",
    },
    paragraph: {
      es: { heading: "MESA", text: "La bodega lo recomienda con lechón al horno y platos especiados de la región; la acidez limpia la grasa del cerdo y del cordero. Se vende a 110 bolivianos en la bodega de Camargo. Cepa de Oro también embotella un Blanc de Noir de Negra Criolla y un Moscatel orange de la vendimia 2022." },
      en: { heading: "TABLE", text: "The winery pairs it with roast suckling pig and the region's spiced dishes; the acidity cuts through pork and lamb fat. It sells for 110 bolivianos at the Camargo cellar door. Cepa de Oro also bottles a Blanc de Noir of Negra Criolla and an orange Muscat from the 2022 harvest." },
    },
  },
});

const c02 = build({
  facts: {
    municipality: "Villa Abecia",
    province: "Sud Cinti",
    altitude: 2311,
    varieties: ["Moscatel de Alejandría", "Vischoqueña", "Negra Criolla", "Cabernet Sauvignon", "Malbec", "Syrah", "Merlot"],
    wineries: ["Bodega Tierra Roja", "Bodega Cañón Colorado – Cepas de Fuego", "Cepas de mi Abuelo (hostal-bodega)"],
    sources: [
      "https://de.wikipedia.org/wiki/Villa_Abecia",
      "https://en.wikipedia.org/wiki/Villa_Abecia_Municipality",
      "https://southamericawineguide.com/guide-cinti-valley-bolivian-wines/",
      "https://issuu.com/luchitoguz/docs/gui_a_de_vinos_y_singanis_final_baja/s/12179923",
      "https://www.vivino.com/en/tierra-roja-los-infinitos-moscato-gran-altura/w/5278841",
      "https://rutadelvinobolivia.com/en/wineries/canon-colorado-cepas-de-fuego.html",
      "https://www.boliviaviajes.org/2012/12/la-vida-en-los-vinedos-de-villa-abecia.html",
    ],
  },
  ground: {
    soilColour: { es: "Rojo intenso", en: "Deep red" },
    moisture: { es: "Suelos rojos poco profundos; tierra cultivable muy limitada", en: "Shallow red soils; very limited arable land" },
    exposure: { es: "Este / terrazas estrechas del cañón", en: "East / narrow canyon terraces" },
    description: {
      es: [
        "Villa Abecia, la antigua Camataquí, es la capital de la provincia Sud Cinti, a 2.311 metros sobre la ruta nacional 1 entre Camargo y Tarija. Cambió varias veces de nombre —Villa Rosario, Villa Carlos V. Romero, Villa Germán Busch— hasta adoptar el actual en 1947. El pueblo tiene poco más de mil habitantes y el municipio 65 comunidades.",
        "El paisaje es rojo por el color de la tierra, y de ahí toma el nombre la Bodega Tierra Roja, que cultiva dos hectáreas de Cabernet Sauvignon, Malbec, Moscatel, Vischoqueña y Syrah junto a la bodega. La tierra cultivable es tan escasa que toda la producción es artesanal: pocas botellas, mucha mano.",
        "En el mismo pueblo, Weymar Ríos Cavero elabora unos 4.500 litros al año de vinos, singani y un blanco tipo oporto bajo la marca Cepas de Fuego en la Bodega Cañón Colorado, con cepas viejas y variedades criollas, y Manuel Daroca destila singani en el jardín del hostal Cepas de mi Abuelo, cuyo viñedo orgánico trabaja un rebaño de cincuenta cabras.",
      ],
      en: [
        "Villa Abecia, the old Camataquí, is the capital of Sud Cinti province, at 2,311 metres on national route 1 between Camargo and Tarija. It changed names several times —Villa Rosario, Villa Carlos V. Romero, Villa Germán Busch— before taking the current one in 1947. The town has just over a thousand inhabitants and the municipality 65 communities.",
        "The landscape is red from the colour of the earth, and that is where Bodega Tierra Roja takes its name; it farms two hectares of Cabernet Sauvignon, Malbec, Muscat, Vischoqueña and Syrah beside the winery. Arable land is so scarce that all production is artisanal: few bottles, much handwork.",
        "In the same town, Weymar Ríos Cavero makes about 4,500 litres a year of wine, singani and a white port-style wine under the Cepas de Fuego label at Bodega Cañón Colorado, from old vines and criolla varieties, and Manuel Daroca distils singani in the garden of the Cepas de mi Abuelo guesthouse, whose organic vineyard is worked by a herd of fifty goats.",
      ],
    },
    details: {
      es: [
        "Bodega Tierra Roja / 2 ha junto a la bodega",
        "Bodega Cañón Colorado – Cepas de Fuego / ≈ 4.500 L al año · 280 qq de uva",
        "Variedades / Moscatel de Alejandría, Vischoqueña, Cabernet Sauvignon, Malbec, Syrah",
        "Población del pueblo / 1.211 hab. (2012) · 65 comunidades",
        "Altitud / 2.311 m",
        "Nombre actual / desde 1947 (antes Camataquí)",
      ],
      en: [
        "Bodega Tierra Roja / 2 ha beside the winery",
        "Bodega Cañón Colorado – Cepas de Fuego / ≈ 4,500 L a year · 280 quintals of grapes",
        "Varieties / Muscat of Alexandria, Vischoqueña, Cabernet Sauvignon, Malbec, Syrah",
        "Town population / 1,211 (2012) · 65 communities",
        "Altitude / 2,311 m",
        "Current name / since 1947 (formerly Camataquí)",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Tierra Roja – Los Infinitos Moscatel de Alejandría Gran Altura",
    kind: "vino",
    specifications: {
      es: ["Bodega / Tierra Roja, Villa Abecia", "Variedad / Moscatel de Alejandría de viñedos contiguos a la bodega", "Blanco seco de altura · producción artesanal de 2 ha"],
      en: ["Producer / Tierra Roja, Villa Abecia", "Variety / Muscat of Alexandria from vineyards adjoining the winery", "Dry high-altitude white · artisanal output from 2 ha"],
    },
    columns: {
      es: "Los Infinitos es la Moscatel de Alejandría seca de Tierra Roja, hecha con uva de las parcelas que rodean la bodega en Villa Abecia. La guía South America Wine Guide la cita, en su añada 2017, entre los campeones del valle por su acidez alta y su expresión de terruño; la añada 2024 figura hoy en cartas de restaurantes de La Paz. La casa también embotella el tinto Camtaqui Reserva y un Cabernet Sauvignon que un restaurante paceño llegó a comprar íntegro.",
      en: "Los Infinitos is Tierra Roja's dry Muscat of Alexandria, made from the plots surrounding the winery in Villa Abecia. The South America Wine Guide lists its 2017 vintage among the valley's champions for its high acidity and terroir expression; the 2024 vintage now appears on La Paz restaurant lists. The house also bottles the red Camtaqui Reserva and a Cabernet Sauvignon that one La Paz restaurant once bought in its entirety.",
    },
    highlight: {
      es: "Dos hectáreas de tierra roja y una Moscatel seca que ha puesto a Villa Abecia en las cartas de la capital.",
      en: "Two hectares of red earth and a dry Muscat that has put Villa Abecia on the capital's wine lists.",
    },
    paragraph: {
      es: { heading: "ESTILO", text: "La Moscatel de altura de los Cintis se vinifica seca con más frecuencia que en Tarija: flor de azahar, jazmín y cítrico maduro en nariz, y una boca que engaña con dulzor aromático pero termina seca y fresca. Tierra Roja no publica ficha técnica; graduación y crianza deben consultarse a la bodega." },
      en: { heading: "STYLE", text: "High-altitude Cinti Muscat is more often made dry than in Tarija: orange blossom, jasmine and ripe citrus on the nose, and a palate that fools with aromatic sweetness yet finishes dry and fresh. Tierra Roja publishes no technical sheet; strength and ageing should be checked with the winery." },
    },
  },
});

const c03 = build({
  facts: {
    municipality: "Las Carreras",
    province: "Sud Cinti",
    altitude: 2327,
    varieties: ["Moscatel de Alejandría", "Negra Criolla", "Misionera", "Vischoqueña"],
    wineries: ["Productores criollos del municipio de Las Carreras", "Cepas de mi Abuelo (Villa Abecia, subzona Cinti sur)", "Cepas de Fuego (Villa Abecia)"],
    sources: [
      "https://de.wikipedia.org/wiki/Las_Carreras_(Chuquisaca)",
      "https://de.wikipedia.org/wiki/Municipio_Las_Carreras",
      "https://es.wikipedia.org/wiki/Las_Carreras",
      "https://southamericawineguide.com/guide-cinti-valley-bolivian-wines/",
      "https://southamericawineguide.com/tag/cinti/",
      "https://www.instagram.com/bodegacepasdemiabuelo/",
    ],
  },
  ground: {
    soilColour: { es: "Beige calcáreo", en: "Calcareous beige" },
    moisture: { es: "Terrazas del río Grande, 400 mm de lluvia, riego de acequia", en: "Río Grande terraces, 400 mm of rain, ditch irrigation" },
    exposure: { es: "Noreste / margen del río Grande", en: "Northeast / Río Grande bank" },
    description: {
      es: [
        "Las Carreras es el municipio más meridional del cañón de Cinti, a 2.327 metros, 112 km de Tarija y 250 de Potosí. Ocupa el suroeste de la provincia Sud Cinti con ocho cantones y 56 comunidades, unos 5.000 habitantes y apenas 400 mm de lluvia al año, concentrados entre diciembre y febrero.",
        "Con Camargo y Villa Abecia forma el trío de pueblos vitícolas del valle. Aquí las terrazas del río Grande son más anchas y los suelos, del lado este, tienden a la mezcla calcárea, arcillosa y arenosa; los viñedos criollos —Moscatel de Alejandría, Negra Criolla, Misionera, Vischoqueña— se mantienen en parrales y molles como hace siglos, y el municipio presume de algunos de los mejores vinos criollos del departamento.",
        "La producción es doméstica y las bodegas con marca están unos kilómetros al norte, en Villa Abecia: Cepas de mi Abuelo, que anuncia su «vino de altura» a 2.324 metros, y Cepas de Fuego. La guía South America Wine Guide agrupa ambas en la subzona del Cinti sur que comparten Villa Abecia y Las Carreras.",
      ],
      en: [
        "Las Carreras is the southernmost municipality of the Cinti canyon, at 2,327 metres, 112 km from Tarija and 250 from Potosí. It covers the southwest of Sud Cinti province with eight cantons and 56 communities, some 5,000 inhabitants and barely 400 mm of rain a year, concentrated between December and February.",
        "With Camargo and Villa Abecia it forms the valley's trio of wine towns. Here the Río Grande terraces are wider and the east-bank soils lean to the calcareous, clay and sand mixture; criolla vineyards —Muscat of Alexandria, Negra Criolla, Misionera, Vischoqueña— are kept on arbours and molle trees as they were centuries ago, and the municipality claims some of the department's best criollo wines.",
        "Production is household-scale and the branded wineries lie a few kilometres north in Villa Abecia: Cepas de mi Abuelo, which advertises its \"altitude wine\" at 2,324 metres, and Cepas de Fuego. The South America Wine Guide groups both in the southern Cinti sub-zone shared by Villa Abecia and Las Carreras.",
      ],
    },
    details: {
      es: [
        "Municipio / 8 cantones · 56 comunidades · 5.016 hab. (2024)",
        "Lluvia anual / ≈ 400 mm (diciembre–febrero)",
        "Variedades / Moscatel de Alejandría, Negra Criolla, Misionera, Vischoqueña",
        "Sistema de conducción / parral y molle (vitiforestería)",
        "Altitud / 2.327 m",
        "Distancia / 112 km a Tarija · 250 km a Potosí",
      ],
      en: [
        "Municipality / 8 cantons · 56 communities · 5,016 inhabitants (2024)",
        "Annual rainfall / ≈ 400 mm (December–February)",
        "Varieties / Muscat of Alexandria, Negra Criolla, Misionera, Vischoqueña",
        "Training system / arbour and molle tree (vitiforestry)",
        "Altitude / 2,327 m",
        "Distance / 112 km to Tarija · 250 km to Potosí",
      ],
    },
    underground: CINTI_EAST_PROFILE,
  },
  wine: {
    name: "Singani Cepas de mi Abuelo",
    kind: "singani",
    specifications: {
      es: ["Productor / Hostal-Bodega Cepas de mi Abuelo (Manuel Daroca), Villa Abecia – Cinti sur", "Uva / Moscatel de Alejandría de viñedo orgánico a ≈ 2.324 m", "Destilería propia en el jardín del hostal"],
      en: ["Producer / Cepas de mi Abuelo guesthouse-winery (Manuel Daroca), Villa Abecia – southern Cinti", "Grape / Muscat of Alexandria from an organic vineyard at ≈ 2,324 m", "Own still in the guesthouse garden"],
    },
    columns: {
      es: "Manuel Daroca, piloto retirado, destila singani en el jardín de su hostal junto a la plaza de Villa Abecia con uva de un viñedo orgánico donde un rebaño de cincuenta cabras hace el desmalezado. Vende una botella triple que reúne ratafía, vino y singani, la trilogía tradicional de los Cintis. Es el productor con marca más cercano a Las Carreras y la puerta habitual de los viajeros al Cinti sur.",
      en: "Manuel Daroca, a retired pilot, distils singani in the garden of his guesthouse by the Villa Abecia square, from an organic vineyard where a herd of fifty goats does the weeding. He sells a triple bottle combining ratafia, wine and singani, the traditional Cinti trilogy. He is the branded producer closest to Las Carreras and travellers' usual gateway to southern Cinti.",
    },
    highlight: {
      es: "Cinti sur: vides criollas, cabras en el viñedo y un alambique de jardín.",
      en: "Southern Cinti: criolla vines, goats in the vineyard and a garden still.",
    },
    paragraph: {
      es: { heading: "NOTA", text: "No hay ficha técnica publicada; graduación y reposo se confirman en la bodega. Para Las Carreras propiamente dicho no se ha localizado en fuentes públicas un producto embotellado con marca, por lo que este apartado se apoya en el productor documentado más próximo." },
      en: { heading: "NOTE", text: "No technical sheet is published; strength and rest should be confirmed with the winery. For Las Carreras itself no branded bottled product could be found in public sources, so this sheet relies on the nearest documented producer." },
    },
  },
});

const c04 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2340,
    varieties: ["Moscatel de Alejandría"],
    wineries: ["Bodega San Pedro – Singani San Pedro de Oro (hacienda San Pedro Mártir)"],
    sources: [
      "https://correodelsur.com/ecos/20210725/san-pedro-mucho-mas-que-una-marca-de-singanis.html",
      "https://rutadelvinobolivia.com/en/wineries/san-pedro.html",
      "https://es.wikipedia.org/wiki/Valle_de_Cinti",
      "https://abi.bo/index.php/noticias/culturas/58705-lanzan-edicion-especial-del-singani-san-pedro-de-oro-bicentenario-en-homenaje-a-los-200-anos-de-bolivia",
      "https://nominatim.openstreetmap.org/ (San Pedro, Municipio Camargo) + https://api.open-meteo.com/v1/elevation",
    ],
  },
  ground: {
    soilColour: { es: "Pardo rojizo", en: "Reddish brown" },
    moisture: { es: "Terraza del río Chico, riego de acequia colonial", en: "Río Chico terrace, colonial ditch irrigation" },
    exposure: { es: "Este / terraza media del cañón", en: "East / middle canyon terrace" },
    description: {
      es: [
        "San Pedro es la comunidad de la hacienda San Pedro Mártir, a unos 2.340 metros y pocos kilómetros de Camargo, en el centro del cañón. La hacienda se remonta a la década de 1550 y fue una de las mayores bodegas del Perú colonial: su vino y su aguardiente subían a las minas de Potosí, y la tradición local la considera el lugar donde nació el singani.",
        "En 1925 las familias Ortiz y Patiño fundaron aquí la Sociedad Agrícola, Ganadera e Industrial de los Cintis (SAGIC), que reunió las haciendas de San Pedro, Culpina e Incahuasi e importó por primera vez equipos de Francia y Alemania para industrializar el vino en Bolivia. Simón I. Patiño levantó hacia 1930 la bodega actual, un edificio de piedra de cuatro plantas con columnas toscanas que en su apogeo producía dos millones de litros y daba trabajo a 400 personas.",
        "Tras decaer desde 1983, la bodega se reactivó en 2012. Hoy tiene 50 hectáreas, 20 de ellas de Moscatel de Alejandría aclimatada durante cuatro siglos, alambiques de cobre franceses, la antigua destilería artesanal («konchana») y barricas francesas de 1930 reservadas para un futuro museo.",
      ],
      en: [
        "San Pedro is the community of the San Pedro Mártir hacienda, at about 2,340 metres a few kilometres from Camargo, in the middle of the canyon. The estate dates to the 1550s and was one of the largest wineries of colonial Peru: its wine and spirit went up to the Potosí mines, and local tradition holds it to be the birthplace of singani.",
        "In 1925 the Ortiz and Patiño families founded here the Sociedad Agrícola, Ganadera e Industrial de los Cintis (SAGIC), which joined the San Pedro, Culpina and Incahuasi estates and imported equipment from France and Germany for the first industrial winemaking in Bolivia. Around 1930 Simón I. Patiño raised the current bodega, a four-storey stone building with Tuscan columns that at its peak made two million litres and employed 400 people.",
        "After declining from 1983 the winery was revived in 2012. Today it has 50 hectares, 20 of them Muscat of Alexandria acclimatised over four centuries, French copper stills, the old artisanal distillery (\"konchana\") and French barrels from 1930 set aside for a future museum.",
      ],
    },
    details: {
      es: [
        "Superficie / 50 ha, de ellas 20 ha de viñedo",
        "Variedad / 100 % Moscatel de Alejandría",
        "Hacienda / década de 1550 · SAGIC 1925 · bodega actual ≈ 1930",
        "Capacidad histórica / 2 millones de litros · 400 trabajadores",
        "Altitud / ≈ 2.340 m",
        "Distancia a Sucre / 340 km",
      ],
      en: [
        "Area / 50 ha, of which 20 ha vineyard",
        "Variety / 100% Muscat of Alexandria",
        "Estate / 1550s · SAGIC 1925 · current bodega ≈ 1930",
        "Historic capacity / 2 million litres · 400 workers",
        "Altitude / ≈ 2,340 m",
        "Distance to Sucre / 340 km",
      ],
    },
    underground: CINTI_EAST_PROFILE,
  },
  wine: {
    name: "Singani San Pedro de Oro",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodega San Pedro, Camargo · 40 % vol.", "Uva / selección de Moscatel de Alejandría del Valle de los Cintis", "Alambiques de cobre franceses · edición Bicentenario (2025)"],
      en: ["Distillery / Bodega San Pedro, Camargo · 40% vol.", "Grape / selected Muscat of Alexandria from the Cinti valley", "French copper stills · Bicentenario edition (2025)"],
    },
    columns: {
      es: "San Pedro de Oro se presenta como «el primer singani boliviano», heredero de la hacienda de 1550. Se destila en alambiques de cobre franceses durante una campaña de diez meses, las 24 horas, y sale a 40 grados; la bodega describe notas de flores blancas y cítricos con matices sutiles, y lo recomienda tanto para beber solo como en coctelería. En 2025 lanzó una edición Bicentenario con una selección especial de uva.",
      en: "San Pedro de Oro is presented as \"the first Bolivian singani\", heir to the 1550 estate. It is distilled in French copper stills over a ten-month campaign, around the clock, and bottled at 40% vol.; the house describes white-flower and citrus notes with subtle nuances, and recommends it neat or in cocktails. In 2025 it released a Bicentenario edition from a special grape selection.",
    },
    highlight: {
      es: "Una línea de 300 botellas por hora dentro de una fortaleza de piedra que abastecía a Potosí en el siglo XVI.",
      en: "A 300-bottle-an-hour line inside a stone fortress that supplied Potosí in the 16th century.",
    },
    paragraph: {
      es: { heading: "VISITA", text: "La bodega abre todos los días (9:00–12:00 y 14:30–18:00) y muestra la campana de San Pedro en el primer patio, los alambiques y las barricas de 1930. Es el eslabón que une la denominación de origen moderna con las haciendas que la inventaron." },
      en: { heading: "VISIT", text: "The winery opens daily (9:00–12:00 and 14:30–18:00) and shows the San Pedro bell in the first courtyard, the stills and the 1930 barrels. It is the link between the modern appellation and the haciendas that invented it." },
    },
  },
});

const c05 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2343,
    varieties: ["Misionera", "Moscatel de Alejandría", "Vischoqueña", "Imporeña", "Uvilla", "Rosada Criolla"],
    wineries: ["Bodegas & Viñedos Yokich (Quiskapampa, cantón La Palca Grande)", "Bodega-museo Buitrago (1936)"],
    sources: [
      "https://de.wikipedia.org/wiki/Palca_Grande",
      "https://es.wikipedia.org/wiki/Valle_de_Cinti",
      "https://www.lostiempos.com/oh/tendencias/20250424/primer-premio-mundial-viticultoras-camargo-abre-puertas-bolivia",
      "https://correodelsur.com/local/20250401/diez-mujeres-de-camargo-ganan-concurso-mundial.html",
      "https://yokichwinery.com/",
      "https://miskisimi.com/products/singani-yokich",
      "https://trayectoriasenviaje.com/turismo-gastronomico-valle-de-los-cinti/",
    ],
  },
  ground: {
    soilColour: { es: "Pardo rojizo", en: "Reddish brown" },
    moisture: { es: "Confluencia del río Chico y el Tumusla; vitiforestería bajo molles", en: "Confluence of the Chico and Tumusla rivers; vitiforestry under molle trees" },
    exposure: { es: "Sureste / terraza sobre la unión de los ríos", en: "Southeast / terrace above the river junction" },
    description: {
      es: [
        "Palca Grande, también llamada Quiskapampa, está a 2.343 metros en el punto donde el río Chico se junta con el Tumusla para formar el río Grande de Cinti, a 23 km de Camargo por la carretera de San Pedro. En 1936 Roberto Buitrago y Carmen Gutiérrez fundaron aquí una bodega de vino y singani que hoy es museo y patrimonio regional.",
        "En la comunidad de Quiskapampa está la finca de Bodegas & Viñedos Yokich, una casa de 1700 levantada por jesuitas que compró Natalio Yokich, croata llegado en el siglo XIX; su familia y los Mendoza fueron pioneros de la destilación de singani. Conservan unas 10 hectáreas como banco genético: cepas de 35 a 99 años y patrimoniales de 100 a más de 350, de Misionera, Moscatel, Vischoqueña, Imporeña, Uvilla y Rosada Criolla, criadas entre molles, chañares y algarrobos.",
        "En 2025 el equipo de diez mujeres que lidera Patricia Mendoza Morón ganó el Old Vine Hero Award como mejor equipo de viticultura del mundo en The Old Vine Conference (Reino Unido), compitiendo con 14 países, por su vivero y su banco de cepas antiguas.",
      ],
      en: [
        "Palca Grande, also called Quiskapampa, sits at 2,343 metres where the Río Chico meets the Tumusla to form the Río Grande of Cinti, 23 km from Camargo on the San Pedro road. In 1936 Roberto Buitrago and Carmen Gutiérrez founded a wine and singani cellar here that is now a museum and regional heritage site.",
        "In the Quiskapampa community stands the estate of Bodegas & Viñedos Yokich, a 1700 house built by Jesuits and bought by Natalio Yokich, a Croatian who arrived in the 19th century; his family and the Mendozas were pioneers of singani distillation. They keep some 10 hectares as a genetic bank: vines of 35 to 99 years and heritage vines from 100 to over 350, of Misionera, Muscat, Vischoqueña, Imporeña, Uvilla and Rosada Criolla, grown among molle, chañar and algarrobo trees.",
        "In 2025 the ten-woman team led by Patricia Mendoza Morón won the Old Vine Hero Award as the world's best viticulture team at The Old Vine Conference (UK), against entries from 14 countries, for its nursery and old-vine bank.",
      ],
    },
    details: {
      es: [
        "Banco genético Yokich / ≈ 10 ha · cepas de 35 a > 350 años",
        "Variedades / Misionera, Moscatel de Alejandría, Vischoqueña, Imporeña, Uvilla, Rosada Criolla",
        "Finca / casa jesuita de 1700 · viñedo a 2.450 m",
        "Premio / Old Vine Hero Award 2025 (Reino Unido)",
        "Bodega Buitrago / fundada en 1936, hoy museo",
        "Distancia a Camargo / 23 km",
      ],
      en: [
        "Yokich genetic bank / ≈ 10 ha · vines from 35 to > 350 years",
        "Varieties / Misionera, Muscat of Alexandria, Vischoqueña, Imporeña, Uvilla, Rosada Criolla",
        "Estate / Jesuit house of 1700 · vineyard at 2,450 m",
        "Award / Old Vine Hero Award 2025 (United Kingdom)",
        "Buitrago cellar / founded 1936, now a museum",
        "Distance to Camargo / 23 km",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Singani Yokich",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodegas & Viñedos Yokich, Quiskapampa – Palca Grande", "Uva / 100 % Moscatel de Alejandría a 2.450 m · 34 % vol.", "Triple destilación · más de 36 meses de reposo en botella"],
      en: ["Distillery / Bodegas & Viñedos Yokich, Quiskapampa – Palca Grande", "Grape / 100% Muscat of Alexandria at 2,450 m · 34% vol.", "Triple distilled · more than 36 months of bottle rest"],
    },
    columns: {
      es: "El Singani Yokich se destila tres veces a partir de Moscatel de Alejandría de los viñedos de la finca y reposa más de tres años en botella antes de venderse, a 34 grados, en formato de 700 ml. Su importador europeo lo describe con nariz intensa de cítricos y flores, matices minerales y salinos, y una boca suave, amplia y frutal.",
      en: "Singani Yokich is triple-distilled from estate-grown Muscat of Alexandria and rests more than three years in bottle before sale, at 34% vol. in a 700 ml format. Its European importer describes an intense nose of citrus and flowers with mineral and saline hints, and a soft, ample, fruity palate.",
    },
    highlight: {
      es: "Cinco generaciones, una casa jesuita de 1700 y el mejor equipo de viticultura del mundo en 2025.",
      en: "Five generations, a 1700 Jesuit house and the world's best viticulture team of 2025.",
    },
    paragraph: {
      es: { heading: "VINOS", text: "Además del singani, Yokich embotella tintos de Misionera y otras patrimoniales que ya se venden en Alemania. El proyecto incluye un vivero para multiplicar las cepas tradicionales de los Cintis y devolverlas a los productores del cañón." },
      en: { heading: "WINES", text: "Besides the singani, Yokich bottles reds from Misionera and other heritage grapes already sold in Germany. The project includes a nursery to propagate the Cintis' traditional vines and return them to the canyon's growers." },
    },
  },
});

const c06 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2400,
    varieties: ["Moscatel de Alejandría"],
    wineries: ["Bodega San Remo – Hacienda Isuma"],
    sources: [
      "https://correodelsur.com/ecos/20161016/san-remo-primer-singani-chuquisaqueno-a-estados-unidos.html",
      "https://correodelsur.com/capitales/20190115_la-produccion-vitivinicola-en-cinti-se-reactiva-despues-de-anos-en-crisis.html",
      "https://correodelsur.com/local/20190224/la-feria-en-camargo-es-vino-singani-musica-y-produccion.html",
      "https://biblioteca.uajms.edu.bo/biblioteca/opac_css/doc_num.php?explnum_id=25221",
    ],
  },
  ground: {
    soilColour: { es: "Rojo pardo", en: "Red-brown" },
    moisture: { es: "Terraza del río Chico; uva muy dulce, 14° de azúcar", en: "Río Chico terrace; very sweet grapes, 14° sugar" },
    exposure: { es: "Este / terraza del cañón, 7 km de Camargo", en: "East / canyon terrace, 7 km from Camargo" },
    description: {
      es: [
        "Isuma es una de las haciendas históricas que se suceden a lo largo del río Chico —La Torre, La Colorada, La Florida, La Compañía, Isuma, La Media Luna, San Pedro, La Palca Grande, Vivicha, La Vidriería, El Caserón— y que forman, con sus bodegas y alambiques, la espina dorsal del vino cinteño. Está a 7 km de Camargo, a unos 2.400 metros.",
        "La familia que la trabaja remonta su tradición vitícola a 1729; la bodega actual, San Remo, data de 1936 y ocupa un edificio de tres pisos que aprovecha la gravedad: la uva entra por arriba, fermenta diez días en tanques de acero a temperatura alta, pasa por remontaje, separación y maceración, y baja al alambique.",
        "La Moscatel de Alejandría de Isuma llega a 14 grados de azúcar —«se rompe el diente», dicen en la hacienda— y da un destilado de 60 a 65 grados que se rebaja a 40 para el mercado. En 2016 San Remo fue el primer singani chuquisaqueño exportado a Estados Unidos: 4.500 botellas, registradas allí como brandy con el nombre Unholy Gray.",
      ],
      en: [
        "Isuma is one of the historic haciendas strung along the Río Chico —La Torre, La Colorada, La Florida, La Compañía, Isuma, La Media Luna, San Pedro, La Palca Grande, Vivicha, La Vidriería, El Caserón— which, with their cellars and stills, form the backbone of Cinti wine. It lies 7 km from Camargo at about 2,400 metres.",
        "The family working it traces its vine-growing to 1729; the current bodega, San Remo, dates from 1936 and occupies a three-storey building that uses gravity: grapes enter at the top, ferment ten days in steel tanks at high temperature, go through pumping-over, separation and maceration, and descend to the still.",
        "Isuma's Muscat of Alexandria reaches 14 degrees of sugar —\"it breaks your tooth\", they say at the hacienda— and yields a 60–65% spirit brought down to 40% for market. In 2016 San Remo became the first Chuquisaca singani exported to the United States: 4,500 bottles, registered there as brandy under the name Unholy Gray.",
      ],
    },
    details: {
      es: [
        "Tradición familiar / desde 1729 · bodega San Remo desde 1936",
        "Variedad / Moscatel de Alejandría (≈ 14° de azúcar)",
        "Fermentación / 10 días en acero · destilado a 60–65° rebajado a 40°",
        "Primera exportación a EE. UU. / 2016, ≈ 4.500 botellas",
        "Altitud / ≈ 2.400 m",
        "Distancia a Camargo / 7 km",
      ],
      en: [
        "Family tradition / since 1729 · San Remo cellar since 1936",
        "Variety / Muscat of Alexandria (≈ 14° sugar)",
        "Fermentation / 10 days in steel · distilled to 60–65% cut to 40%",
        "First export to the USA / 2016, ≈ 4,500 bottles",
        "Altitude / ≈ 2,400 m",
        "Distance to Camargo / 7 km",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Singani San Remo",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodega San Remo, Hacienda Isuma (Camargo) · 40 % vol.", "Uva / Moscatel de Alejandría de la propia hacienda", "Exportado a EE. UU. desde 2016 (marca Unholy Gray)"],
      en: ["Distillery / Bodega San Remo, Hacienda Isuma (Camargo) · 40% vol.", "Grape / estate-grown Muscat of Alexandria", "Exported to the USA since 2016 (Unholy Gray label)"],
    },
    columns: {
      es: "San Remo destila en la propia hacienda de Isuma con un sistema por gravedad y tanques de acero. La casa subraya «esa combinación compleja de aromas» que da la Moscatel muy madura del cañón, y sale al mercado a 40 grados Gay-Lussac tras rebajarse con agua desde los 60–65 del alambique. Su contrato de exportación a Estados Unidos, firmado en 2016 por cinco años, preveía dos envíos anuales.",
      en: "San Remo distils at the Isuma estate itself with a gravity system and steel tanks. The house stresses \"that complex combination of aromas\" given by the canyon's very ripe Muscat, and reaches the market at 40% Gay-Lussac after being cut with water from the 60–65% off the still. Its US export contract, signed in 2016 for five years, foresaw two shipments a year.",
    },
    highlight: {
      es: "El primer singani de Chuquisaca que cruzó a Estados Unidos salió de una hacienda con casi tres siglos de viña.",
      en: "The first Chuquisaca singani to cross to the United States came from a hacienda with nearly three centuries of vines.",
    },
    paragraph: {
      es: { heading: "CONTEXTO", text: "Correo del Sur cita a San Remo, junto a San Pedro y El Rancho, entre las bodegas que sostuvieron la recuperación del cañón, que pasó de menos de 100 hectáreas a fines de los noventa a unas 400 en 2019 con rendimientos de 250 a 300 quintales por hectárea." },
      en: { heading: "CONTEXT", text: "Correo del Sur names San Remo, alongside San Pedro and El Rancho, among the cellars that underpinned the canyon's recovery, from under 100 hectares in the late 1990s to some 400 in 2019 at yields of 250–300 quintals per hectare." },
    },
  },
});

const c07 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2310,
    varieties: ["Misionera", "Vischoqueña", "Cabernet Sauvignon", "Moscatel de Alejandría"],
    wineries: ["Bodega Ocho Estrellas (comunidad El Chilcar)"],
    sources: [
      "https://www.deloscintis.com.bo/actualidad/camargo/singani-ocho-estrellas-de-camargo-recibe-el-gran-bacchus-de-oro.html",
      "https://correodelsur.com/local/20190224/la-feria-en-camargo-es-vino-singani-musica-y-produccion.html",
      "https://es.wikipedia.org/wiki/Valle_de_Cinti",
    ],
  },
  ground: {
    soilColour: { es: "Rojo arcilloso", en: "Red clay" },
    moisture: { es: "Ladera baja del cañón, riego de acequia", en: "Lower canyon slope, ditch irrigation" },
    exposure: { es: "Este / salida sur de Camargo hacia Tarija", en: "East / southern exit of Camargo towards Tarija" },
    description: {
      es: [
        "El Chilcar es la comunidad que empieza a 1,5 km de Camargo sobre la carretera a Tarija, a 2.310 metros. Es el primer tramo del cañón al salir de la ciudad hacia el sur, con las laderas rojas del Cañón Colorado enfrente y las terrazas de cultivo pegadas al río Chico.",
        "Aquí destila la Bodega Ocho Estrellas, una de las casas que exponen cada año en la Feria Nacional de la Vid y el Vino (Fenavit) de Camargo junto a Cepa de Oro, San Remo, La Torre, La Quimera, El Patio, Don Trifón, Amador, San Miguel y El Rancho. Cultiva Misionera, Vischoqueña, Cabernet Sauvignon y Moscatel de Alejandría, la base de su singani.",
        "En 2024 el Singani Ocho Estrellas obtuvo el Gran Bacchus de Oro en el concurso Bacchus de España, uno de los certámenes de vinos y destilados más importantes del mundo, la mayor distinción internacional reciente para un singani de los Cintis.",
      ],
      en: [
        "El Chilcar is the community that begins 1.5 km from Camargo on the road to Tarija, at 2,310 metres. It is the first stretch of the canyon leaving the town southward, with the red slopes of the Cañón Colorado opposite and the crop terraces hugging the Río Chico.",
        "Bodega Ocho Estrellas distils here, one of the houses exhibiting every year at Camargo's Feria Nacional de la Vid y el Vino (Fenavit) alongside Cepa de Oro, San Remo, La Torre, La Quimera, El Patio, Don Trifón, Amador, San Miguel and El Rancho. It grows Misionera, Vischoqueña, Cabernet Sauvignon and Muscat of Alexandria, the base of its singani.",
        "In 2024 Singani Ocho Estrellas won the Gran Bacchus de Oro at Spain's Bacchus competition, one of the world's major wine and spirits contests, the most significant recent international award for a Cinti singani.",
      ],
    },
    details: {
      es: [
        "Bodega Ocho Estrellas / El Chilcar, a 1,5 km de Camargo",
        "Variedades / Misionera, Vischoqueña, Cabernet Sauvignon, Moscatel de Alejandría",
        "Premio / Gran Bacchus de Oro 2024 (España)",
        "Feria / expositor de Fenavit (creada en 1963, Ley 302 de 1964)",
        "Altitud / 2.310 m",
        "Municipio / Camargo",
      ],
      en: [
        "Bodega Ocho Estrellas / El Chilcar, 1.5 km from Camargo",
        "Varieties / Misionera, Vischoqueña, Cabernet Sauvignon, Muscat of Alexandria",
        "Award / Gran Bacchus de Oro 2024 (Spain)",
        "Fair / Fenavit exhibitor (created 1963, Law 302 of 1964)",
        "Altitude / 2,310 m",
        "Municipality / Camargo",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Singani Ocho Estrellas",
    kind: "singani",
    specifications: {
      es: ["Destilería / Bodega Ocho Estrellas, El Chilcar – Camargo", "Uva / Moscatel de Alejandría del cañón de Cinti a 2.310 m", "Gran Bacchus de Oro 2024"],
      en: ["Distillery / Bodega Ocho Estrellas, El Chilcar – Camargo", "Grape / Muscat of Alexandria from the Cinti canyon at 2,310 m", "Gran Bacchus de Oro 2024"],
    },
    columns: {
      es: "Ocho Estrellas es un singani artesanal de Camargo elaborado con Moscatel de Alejandría cultivada a 2.310 metros, en el arranque del cañón. La bodega pertenece al grupo de casas familiares que exhiben en Fenavit y que, tras la crisis de los noventa, devolvieron al cañón sus 400 hectáreas de viña. El Gran Bacchus de Oro de 2024 lo colocó entre los destilados bolivianos más laureados.",
      en: "Ocho Estrellas is an artisanal Camargo singani made from Muscat of Alexandria grown at 2,310 metres at the head of the canyon. The winery belongs to the group of family houses that show at Fenavit and that, after the 1990s crisis, brought the canyon back to its 400 hectares of vines. The 2024 Gran Bacchus de Oro placed it among Bolivia's most decorated spirits.",
    },
    highlight: {
      es: "A kilómetro y medio de la plaza de Camargo, el singani que ganó el Gran Bacchus de Oro.",
      en: "A kilometre and a half from Camargo's square, the singani that won the Gran Bacchus de Oro.",
    },
    paragraph: {
      es: { heading: "NOTA", text: "La bodega no publica ficha técnica en línea; graduación y reposo se confirman en Camargo. Como todo singani con denominación de origen se destila de Moscatel de Alejandría de más de 1.600 metros y reposa en recipientes neutros." },
      en: { heading: "NOTE", text: "The winery publishes no technical sheet online; strength and rest should be confirmed in Camargo. Like every appellation singani it is distilled from Muscat of Alexandria grown above 1,600 metres and rests in neutral vessels." },
    },
  },
});

const c08 = build({
  facts: {
    municipality: "Camargo",
    province: "Nor Cinti",
    altitude: 2400,
    varieties: ["Moscatel de Alejandría", "Negra Criolla", "Vischoqueña"],
    wineries: ["Bodega Jardín Oculto – Finca San Roque («Los Arbolitos»)"],
    sources: [
      "https://publiagro.com.bo/2023/07/vinedos-con-historia-que-hacen-de-jardin-oculto-una-joya-de-exportacion/",
      "https://juandeliciasmagazine.com/jardin-oculto-secretos-y-sabores-de-un-vinedo-ancestral-en-bolivia/",
      "https://rutadelvinobolivia.com/es/bodegas/jardin-oculto.html",
      "http://www.bolivia-online.net/es/sucre/134/valle-de-cinti-camargo-villa-abecia",
      "https://www.economy.com.bo/articulo/life/bodega-jardin-oculto-exporta-brasil/20230716191234010322.html",
    ],
  },
  ground: {
    soilColour: { es: "Pardo rojizo bajo hojarasca", en: "Reddish brown under leaf litter" },
    moisture: { es: "Sombra de molles y chañares, sin químicos; parte alta del cañón", en: "Shade of molle and chañar trees, chemical-free; upper canyon" },
    exposure: { es: "Variable / vides trepadas a árboles de hasta 6 m", en: "Variable / vines climbing trees up to 6 m" },
    description: {
      es: [
        "San Roque es la finca de la parte alta del Valle de Cinti, rodeada de montañas y junto al río, que la Bodega Jardín Oculto trabaja desde 2019 bajo la dirección de María José Granier. El viñedo, apodado «Los Arbolitos», es un bosque de vides de más de cien años que trepan molles y chañares hasta seis metros de altura: sobrevivieron a la filoxera de fines del siglo XIX y se vendimian con escalera. La altitud, no publicada por la bodega, se estima en unos 2.400 metros, la del tramo alto del cañón en torno a Camargo.",
        "Guías de turismo describen el viñedo San Roque como el que alberga las cepas más antiguas de Sudamérica y citan la propuesta de la crítica internacional de postularlo ante la UNESCO como «Museo del Paisaje del Vino». La bodega trabaja con pequeños productores de unas cuatro hectáreas cada uno, sin químicos y con mínima intervención, dentro de la Slow Wine Coalition.",
        "Jardín Oculto produce menos de 5.000 botellas al año y en 2023 fue la primera bodega boliviana en exportar a Brasil. Sus tres uvas son las patrimoniales del valle: Moscatel de Alejandría, Negra Criolla y Vischoqueña.",
      ],
      en: [
        "San Roque is the estate in the upper Cinti valley, ringed by mountains and beside the river, that Bodega Jardín Oculto has worked since 2019 under María José Granier. The vineyard, nicknamed \"Los Arbolitos\", is a forest of century-old vines climbing molle and chañar trees up to six metres: they survived the late-19th-century phylloxera and are harvested by ladder. The altitude, not published by the winery, is estimated at about 2,400 metres, that of the upper canyon around Camargo.",
        "Travel guides describe the San Roque vineyard as home to the oldest vines in South America and cite international critics' proposal to nominate it to UNESCO as a \"Wine Landscape Museum\". The winery works with small growers of about four hectares each, chemical-free and with minimal intervention, within the Slow Wine Coalition.",
        "Jardín Oculto makes fewer than 5,000 bottles a year and in 2023 became the first Bolivian winery to export to Brazil. Its three grapes are the valley's heritage varieties: Muscat of Alexandria, Negra Criolla and Vischoqueña.",
      ],
    },
    details: {
      es: [
        "Bodega Jardín Oculto / fundada en 2019 (María José Granier)",
        "Edad de las cepas / > 100 años · hasta 6 m sobre molles y chañares",
        "Variedades / Moscatel de Alejandría, Negra Criolla, Vischoqueña",
        "Producción / < 5.000 botellas al año · exporta a Brasil desde 2023",
        "Productores asociados / parcelas de ≈ 4 ha",
        "Altitud / ≈ 2.400 m (estimada, parte alta del cañón)",
      ],
      en: [
        "Bodega Jardín Oculto / founded 2019 (María José Granier)",
        "Vine age / > 100 years · up to 6 m on molle and chañar trees",
        "Varieties / Muscat of Alexandria, Negra Criolla, Vischoqueña",
        "Output / < 5,000 bottles a year · exported to Brazil since 2023",
        "Partner growers / plots of ≈ 4 ha",
        "Altitude / ≈ 2,400 m (estimated, upper canyon)",
      ],
    },
    underground: CINTI_PROFILE,
  },
  wine: {
    name: "Jardín Oculto Vischoqueña",
    kind: "vino",
    specifications: {
      es: ["Bodega / Jardín Oculto, Finca San Roque – Valle de Cinti", "Variedad / Vischoqueña de cepas centenarias sobre árboles", "Vino natural, mínima intervención · < 5.000 botellas al año"],
      en: ["Producer / Jardín Oculto, Finca San Roque – Cinti valley", "Variety / Vischoqueña from century-old tree-trained vines", "Natural wine, minimal intervention · < 5,000 bottles a year"],
    },
    columns: {
      es: "Jardín Oculto vinifica sus tres uvas por separado y con la menor intervención posible. Según la bodega, la Vischoqueña —autóctona de Bolivia y cruce natural de Negra Criolla y Moscatel— da aromas de pomelo y cítricos; la Negra Criolla, frutilla y frambuesa; la Moscatel de Alejandría, flor blanca y durazno. Son vinos ligeros, frescos y de graduación moderada, hijos de la sombra de los árboles.",
      en: "Jardín Oculto vinifies its three grapes separately and with as little intervention as possible. According to the winery, Vischoqueña —native to Bolivia and a natural cross of Negra Criolla and Muscat— gives grapefruit and citrus aromas; Negra Criolla, strawberry and raspberry; Muscat of Alexandria, white flowers and peach. They are light, fresh, moderate-alcohol wines, children of the trees' shade.",
    },
    highlight: {
      es: "Vides de más de cien años vendimiadas con escalera: la primera bodega boliviana que llegó a Brasil.",
      en: "Century-old vines harvested by ladder: the first Bolivian winery to reach Brazil.",
    },
    paragraph: {
      es: { heading: "VISITA", text: "La bodega recibe de lunes a sábado de 9:00 a 17:00. Ver «Los Arbolitos» es entender por qué el sistema mollar protege del granizo, del viento y del exceso de sol, y por qué las plantas bajo molle heredan una nota pimentada que no existe en la espaldera." },
      en: { heading: "VISIT", text: "The winery receives visitors Monday to Saturday, 9:00 to 17:00. Seeing \"Los Arbolitos\" explains why the mollar system shields against hail, wind and excess sun, and why vines under molle inherit a peppery note absent in trellised vineyards." },
    },
  },
});

/* ------------------------------------------------------------------ */

export const ZONES: Record<string, ZoneEntry> = {
  t01, t02, t03, t04, t05, t06, t07, t08, t09, t10, t11, t12, t13, t14,
  c01, c02, c03, c04, c05, c06, c07, c08,
};

export function getZoneContent(parcelId: string, lang: Lang): ParcelContent | undefined {
  return ZONES[parcelId]?.content[lang];
}
