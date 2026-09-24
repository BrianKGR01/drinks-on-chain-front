# Fuentes del contenido editorial

Registro de las fuentes usadas para `src/content/zones.ts`, `src/content/images.ts` y los cambios de nombre/altitud en `src/content/villages.ts`. Investigación realizada el 24-09-2026. Los textos son redacción propia a partir de estas fuentes; las notas de cata se citan como las publica cada productor o medio.

## Criterios

- **Altitud**: se prefiere la infobox de la Wikipedia alemana (que documenta las localidades bolivianas con cota) o el dato publicado por la bodega/prensa; cuando no existe, se usó la coordenada de OpenStreetMap (Nominatim) resuelta con la API de elevación de Open-Meteo, y así se indica en `facts.sources`.
- **Municipio/provincia**: OSM + Wikipedia (de/es/en).
- **Un producto real por zona**: se eligió un vino o singani de una bodega ubicada en la zona o que declara cultivar allí. Cuando no existe producto embotellado documentado en la zona exacta se usó el productor documentado más próximo y se dice explícitamente en el texto (casos: Calamuchita → Tarijeñito en San Isidro de Uriondo; La Angostura → Casa Vieja en el pueblo del Valle; Las Carreras → Cepas de mi Abuelo en Villa Abecia; Sella Méndez → singani casero de la feria, sin marca).
- **Perfiles de suelo**: no existen calicatas publicadas por parcela. Se usan perfiles típicos del valle (Tarija: SciELO 2021 + PDOT Tarija; Cinti: South America Wine Guide + Wikipedia «Valle de Cinti») y, en tres casos, la descripción de suelo publicada por la bodega (Chaguaya: «ripioso»; Santa Ana la Nueva: «franco arcillo-limoso laminar»; Torrecillas: «francos, arenosos y pedregosos, pobres»). Los espesores son ilustrativos.

## Cambios de nombre respecto al placeholder

| id | Antes | Ahora | Motivo |
|---|---|---|---|
| t01 | Santa Ana | **Santa Ana la Vieja** | Hay dos comunidades distintas (la Vieja y la Nueva); ambas documentadas con bodegas. |
| t06 | Uriondo | **Sunchuhuayco** | «Uriondo» es el municipio cuya capital es el propio Valle de la Concepción (t02): duplicado. Sunchuhuayco es comunidad de Uriondo con viñedos de Sausini. |
| t07 | Tolomosa | **Chaguaya** | Tolomosa es real (registros de 1590) pero no se localizó ningún vino/singani producido allí. Chaguaya tiene 55 ha de Moscatel de Aranjuez a 2.095 m y el singani Insignia; el texto conserva la cita histórica de Tolomosa. |
| t09 | Sella | **Sella Méndez** | Nombre completo de la comunidad (existe también Sella Cercado). |
| t10 | Tomatitas | **Yesera** | Tomatitas es un balneario sin viticultura documentada. Yesera Norte tiene la Finca La Tradición (singani, falca de 1940) a 2.230 m. |
| t11 | Erquis | **Colón Norte** | Erquis (Norte/Sud) no aparece como comunidad vitícola en ninguna fuente. Colón Norte es distrito vitícola de Uriondo con viñedos de Bodega Daroca. |
| t13 | Cenavit | **Santa Ana la Nueva** | CENAVIT es el Centro Nacional Vitivinícola (km 25, Valle de la Concepción), no una zona. Santa Ana la Nueva alberga la Finca El Origen de Aranjuez (primera Tannat, 1999). |
| t14 | El Valle | **Torrecillas** | «El Valle» es el apodo local del Valle de la Concepción (t02). Torrecillas es la sede y viñedo de Bodegas Magnus. |
| c05 | Saladillo | **Palca Grande** | Existe un caserío Saladillo en el municipio de Camargo (OSM) pero sin viticultura documentada; el «Saladillo» vitícola que aparece en prensa está en Tarija. Palca Grande (Quiskapampa) tiene la bodega Yokich (Old Vine Hero Award 2025) y la bodega-museo Buitrago (1936). |
| c06 | El Patronato | **Isuma** | El Patronato es una hacienda colonial visitable cerca de Camargo, pero no se localizó producto ni datos vitícolas. Isuma (7 km de Camargo) es la hacienda de la bodega San Remo, con datos completos. |
| c07 | La Torre | **El Chilcar** | La Torre existe (caserío en Patapampa/Camargo y bodega expositora en Fenavit 2019) pero sin ningún dato publicado de producto. El Chilcar (1,5 km de Camargo) es la comunidad de Ocho Estrellas (Gran Bacchus de Oro 2024). |
| c08 | El Arbolar | **San Roque** | «El Arbolar» no aparece en OSM, Wikipedia ni prensa. Finca San Roque (Jardín Oculto) es el viñedo de vides sobre árboles más citado del valle. |

Se conservan: Valle de la Concepción (antes «La Concepción»), Calamuchita, Chocloca, El Portillo, San Lorenzo, La Angostura, Camargo, Villa Abecia, Las Carreras, San Pedro.

## Fuentes generales — Valle Central de Tarija

- Wikipedia (es): Viticultura en Tarija — <https://es.wikipedia.org/wiki/Viticultura_en_Tarija> (1.629 ha, 77 % de los viñedos del país, 2.800 familias, 37 bodegas, 85 % de la uva, 59,2 M kg).
- Wikipedia (es): Vino de Bolivia — <https://es.wikipedia.org/wiki/Vino_de_Bolivia> (registros de 1589–1590, viña de 20.000 cepas de Luis de Fuentes, «llano de viñas», Tolomosa; 1925 San Pedro; 4.960 ha en 2023).
- El País (Tarija), «La vid en Tarija, la cronología…» — <https://elpais.bo/reportajes/20230501_la-vid-en-tarija-la-cronologia-del-producto-emblema-del-valle-central.html> (1574, 1755, parroquias coloniales, 1962 Kohlberg, 1977 portainjertos, 1987 CEVITA, censos 1992/2002, bodegas y fundadores).
- El País, «Avilés y la variedad de su producción agrícola» — <https://elpais.bo/tarija/20230415_aviles-y-la-variedad-de-su-produccion-agricola.html> (53 comunidades, 9 distritos, > 80 % de 3.700 ha, 16 M L vino / 5 M L singani).
- El País, «Tarija produce el 85 % de la uva…» — <https://elpais.bo/tarija/20230327_tarija-produce-el-85-de-la-uva-del-pais-con-59-2-millones-de-kilos-al-ano.html> (reparto por provincias: Avilés 72,8 %, Cercado 25,1 %, Arce 1,6 %, Méndez 0,5 %).
- SciELO / Idesia 2021, «Caracterización de los productores de vid…» — <https://www.scielo.cl/scielo.php?script=sci_arttext&pid=S0719-49942021000200051> (1.854 m, 18 °C, 480 mm, suelos profundos de textura media, pendiente 0–5 %, pedregosidad < 15 %, espaldera, riego por gravedad).
- PDOT Tarija 2006-2025 (UAJMS) — <https://www.uajms.edu.bo/secretaria-academica/wp-content/uploads/sites/48/2024/09/3.4___Plan-Departamental-de-Ordenamiento-Territorial-deTarija-PDOTT-2006-2025.pdf> (zona aluvial, llanuras de origen lacustre, 330–1.100 mm, 18 °C).
- Wikipedia (de): Municipio Uriondo, Municipio Tarija, Municipio San Lorenzo, y páginas de localidades (Valle de Concepción 1.710 m, Calamuchita 1.688 m, Chocloca 1.806 m, Muturayo 1.684 m, Juntas 1.889 m, San Lorenzo 2.002 m, Sella Méndez 2.102 m, Tomatitas 1.933 m, Erquis Norte 2.066 m, Tolomosa Grande 1.930 m).
- WineWiki Tarija — <https://www.winewithseth.com/winewiki/tarija/> (1.600–2.150 m; Tannat, Cabernet Sauvignon, Malbec, Syrah, Cabernet Franc, Moscatel).
- Singani, denominación de origen: Wikipedia es/en — <https://es.wikipedia.org/wiki/Singani>, <https://en.wikipedia.org/wiki/Singani> (Ley 1334 de 4-5-1992; DS 21948 de 1988; DS 25569: Gran Singani / Singani de Altura ≥ 1.600 m, Moscatel de Alejandría; categorías Primera y Segunda Selección; zonas: Tarija; Nor Cinti, Sud Cinti y Tomina en Chuquisaca; Loayza y Murillo en La Paz; Nor y Sud Chichas, C. Saavedra y Linares en Potosí; 40 % vol.; sin madera; reposo ≥ 6 meses). Cancillería 2020 — <https://cancilleria.gob.bo/mre/2020/03/03/6899/>.

## Fuentes generales — Valle de Cinti

- Wikipedia (es): Valle de Cinti — <https://es.wikipedia.org/wiki/Valle_de_Cinti> (1584, órdenes religiosas; censo 1823: 144 viñedos; 1902: 1.291 propiedades; 1925 SAGIC; 476 mm; 17 °C en el cañón; extremos 35–41 °C / −10 °C; Vischoqueña, Borgoña y Albilla únicas; ríos Chico, Tumusla y Grande).
- South America Wine Guide, «A guide to Cinti Valley» — <https://southamericawineguide.com/guide-cinti-valley-bolivian-wines/> (Camargo 2.410 m, Villa Abecia 2.320 m, Las Carreras ≈ 2.220 m; suelos rojos ferrosos al oeste «Cañón Colorado», calcáreos/arcillosos/arenosos al este; molles; productores por subzona).
- South America Wine Guide, etiqueta Cinti — <https://southamericawineguide.com/tag/cinti/> (cañón de ≈ 80 × 5 km, ríos Grande y Chico, Cepas de mi Abuelo en Villa Abecia).
- Revista Moscatel, «Valle de Cinti, vinos de altura con identidad propia» — <https://revistamoscatel.com.bo/valle-de-cinti-vinos-de-altura-con-identidad-propia/> (2.200–2.800 m; suelos franco-arenosos y franco-arcillosos; sistema mollar; Cepa de Oro).
- Revista Moscatel, «Camargo apuesta por las cepas históricas» — <https://revistamoscatel.com.bo/camargo-apuesta-por-las-cepas-historicas/> (ADN de Vischoqueña, Borgoña, Albilla; Fenavit DS 06518/1963 y Ley 302/1964; Ley 774/2016).
- Verdad con Tinta, «La vid en Bolivia: historia y orígenes» — <https://verdadcontinta.com/2018/03/02/la-vid-en-bolivia-historia-y-origenes/> (agustinos 1550–1570 en Pilaya, Paspaya, Cinti y Tomina; Real Cédula de 1601; mercado de Potosí).
- Los Tiempos, «Camargo, cuna del vino y el singani» — <https://www.lostiempos.com/oh/tendencias/20230213/camargo-cuna-del-vino-singani> (3.500 familias, 5.000 empleos, 450 años, 75 % de exportaciones a EE. UU.).
- Correo del Sur, «La producción vitivinícola en Cinti se reactiva…» — <https://correodelsur.com/capitales/20190115_la-produccion-vitivinicola-en-cinti-se-reactiva-despues-de-anos-en-crisis.html> (< 100 ha a fines de los 90 → ≈ 400 ha en 2019; 250–300 qq/ha; San Pedro, El Rancho, San Remo).
- Wikipedia (de): Camargo (Chuquisaca) 2.421 m, Villa Abecia 2.311 m, Las Carreras (Chuquisaca) 2.327 m, Palca Grande 2.343 m, Culpina 2.959 m, Municipio Villa Abecia, Municipio Las Carreras; Wikipedia (es): Provincia de Sud Cinti, Las Carreras.

## Fuentes por zona

Las URL concretas de cada parcela están en `ZONES[id].facts.sources`. Resumen:

- **t01 Santa Ana la Vieja** — kohlberg.com.bo (La Cabaña, 147 ha, 1963; Block 63: 1.950 m, 27 años, 50.000 botellas, notas de cata); Los Tiempos 2016 (Kohlberg 53 años); vinosaranjuez.com (viñedos en Santa Ana la Vieja y la Nueva); OSM + Open-Meteo (1.822 m).
- **t02 Valle de la Concepción** — de.wikipedia (1.710 m); Jornada (Cepas de Altura Tannat, Hacienda La Loma, > 1.850 m, notas); Los Tiempos 2018 (Rujero: 100 ha, 50 familias, 1.700 m, doble destilación, oros 2018); lacasavieja.info (Casa Vieja, Doña Vita 1978); tarija.gob.bo / búsqueda (CENAVIT km 25).
- **t03 Calamuchita** — de.wikipedia (1.688 m, 1.228 hab.); reyqui.com 2018 (350–400 ha, 400 afiliados, variedades, 400–450 qq/ha); La Voz de Tarija 2024 (granizo); Infotarija (riego Guadalquivir–Cenavit–Calamuchita); rutadelvinobolivia.com y economy.com.bo (Tarijeñito, San Isidro, 2014, Empodérate Tannat 2021).
- **t04 Chocloca** — de.wikipedia (1.806 m; cantón: 15 localidades, 2.454 hab., La Compañía 639); La Voz de Tarija 2024 (El Legado, Arce 1964 en La Compañía de Jesús, Reconquista); El País (Luis Arce entre los pioneros).
- **t05 El Portillo** — rutadelvinobolivia.com (Kuhlmann: 1930 Vivicha, El Portillo; Altosama, Santo Patrono); bodegaskuhlmann.com (Los Parrales 40 %, notas); economy.com.bo 2022 (3 etiquetas, 400.000 botellas, Doble Oro 2017); vinosaranjuez.com (Finca El Portillo 2012); El País 2022 (40 % de productores de Cercado); eju.tv 2025 (urbanizaciones); OSM + Open-Meteo (1.859 m).
- **t06 Sunchuhuayco** — southamericawineguide.com (Sausini 2006, Mario Hinojosa, viñedos San Luis y Sunchuhuayco, estilo); Vivino (Phi Blend: Cabernet Sauvignon + Syrah); OSM + Open-Meteo (1.718 m).
- **t07 Chaguaya** — Revista Moscatel (Finca Chaguaya: 65 km, 2.095 m, 55 ha, desde 2012, suelo ripioso, I.G. Chaguaya, Chalvignac, notas de Insignia); El País 2025 (Insignia Platinum); vinosaranjuez.com (Finca Chaguaya 2015, 2.050 m); es.wikipedia Vino de Bolivia (Tolomosa «camino al valle de Chaguaya»).
- **t08 San Lorenzo** — de.wikipedia (2.002 m; 3.401 hab.; 550 mm); es.wikipedia Vino de Bolivia (1589–1590); rutadelvinobolivia.com (Vinacopio Patero 2015, patero desde 1604, productos); El País 2023 (Méndez 0,5 %).
- **t09 Sella Méndez** — de.wikipedia (2.102 m); El País 2024 y 2019 (feria de junio, > 25 años, 30 expositores, comunidades, precios); El País cronología (parroquias coloniales).
- **t10 Yesera** — El País 2023 «Singani La Tradición» (2.230 m, 1940, falca más antigua, 2005 Tárraga, 1,5 ha, 2.000 L, exportaciones, certificaciones); tarijaturismo.com (ruta del singani artesanal y molinos de piedra); OSM (2.282 m, no usado).
- **t11 Colón Norte** — bodegadaroca.com y Revista Moscatel (Daroca 1920, Tomás Daroca, viñedos Colón Norte y Pampa la Villa, Miraflores, Singañac); bodegakindgard.com (Etiqueta Negra 38 %, notas); El País 2024 (exportación a Argentina); La Voz de Tarija 2024 (granizo en Colón); OSM + Open-Meteo (1.762 m).
- **t12 La Angostura** — El País cronología (parroquia colonial); Opinión 2012 (Cooperativa La Angostura, Gualberto Quispe); UAJMS tesis 26431 (cooperativa; PDF no legible por la herramienta, citado por título); lacasavieja.info (Casa Vieja); PDOT Tarija (origen lacustre); OSM + Open-Meteo (1.696 m).
- **t13 Santa Ana la Nueva** — vinosaranjuez.com (Finca El Origen 1999, lote 40, Juan Cruz: crianza, suelo laminar, notas, Gran Medalla de Oro 2013); singanicasareal.com (Gran Singani, 1925, alambiques franceses); Los Tiempos 2016 (Campos de Solana 2000, > 40 ha, 1,5 M botellas, Decanter platino); El Periódico (Casa Real a 18 km, 1.850 m); OSM + Open-Meteo (1.920 m).
- **t14 Torrecillas** — bodegasmagnus.com.bo (historia 1932/1940/2002/2006/2021, gama); uyunisaltflats.travel (1.860 m, suelos, 300 días de sol, 20 °C); rutadelvinobolivia.com (Torrecillas, viñedos); miskisimi.com (Gran Reserva 2016: 100 % CS, 24 meses roble francés, 14 %); OSM + Open-Meteo (1.878 m).
- **c01 Camargo** — de.wikipedia (2.421 m); es.wikipedia Valle de Cinti; Los Tiempos 2023; Vinetur 2023 (Cepa de Oro, La Primavera 2.330 m); El País 2025 (Vischoqueña Patrimonial: notas, precio, servicio); SAWG (Vacaflores, Cañón Colorado); rutadelvinobolivia.com (La Compañía Baja 1700, reabierta 2024, Leyenda e Insolente); Correo del Sur 2019.
- **c02 Villa Abecia** — de.wikipedia (2.311 m); en.wikipedia (Camataquí, 1947, 65 comunidades); Issuu guía (Tierra Roja 2 ha, variedades); Vivino (Los Infinitos, Camtaqui Reserva); rutadelvinobolivia.com y SAWG (Cepas de Fuego / Bodega Cañón Colorado, 4.500 L, 280 qq, Weymar Ríos Cavero); Tripadvisor / Mariela around the world (Cepas de mi Abuelo, Manuel Daroca, cabras); boliviaviajes.org 2012 (tierra roja, producción artesanal).
- **c03 Las Carreras** — de.wikipedia (2.327 m; 8 cantones, 56 comunidades, 400 mm, 5.016 hab.); es.wikipedia (112 km a Tarija, 250 a Potosí, «mejores vinos criollos»); SAWG (subzona Cinti sur); Instagram de Cepas de mi Abuelo («vino de altura 2.324 m»).
- **c04 San Pedro** — Correo del Sur 2021 (1550s, SAGIC 1925, Patiño ≈ 1930, 2.340 m, 50/20 ha, 2 M L, 400 trabajadores, 40 °, 300 botellas/h, alambiques franceses, konchana); rutadelvinobolivia.com (declive 1983, revitalización 2012, barricas de 1930); ABI 2025 (Bicentenario, notas); Vino de Bolivia (1925 Ortiz y Patiño).
- **c05 Palca Grande** — de.wikipedia (2.343 m, = Quiskapampa); Los Tiempos y Correo del Sur 2025 (Yokich: Old Vine Hero Award, 10 ha, edades de cepas, variedades, 2.406–2.450 m, vitiforestería); yokichwinery.com (1700, Natalio Yokich, 2.450 m); miskisimi.com (Singani Yokich 34 %, triple destilación, 36 meses); trayectoriasenviaje.com (Buitrago 1936; dirección de Yokich km 23).
- **c06 Isuma** — Correo del Sur 2016 (San Remo: Hacienda Isuma, 7 km, 2.400 m, 1729/1936, proceso, 40 GL, Unholy Gray); Correo del Sur 2019 (San Remo entre las bodegas de la recuperación); UAJMS tesis 25221 (lista de haciendas del río Chico, citada vía resumen de búsqueda).
- **c07 El Chilcar** — De los Cintis (Ocho Estrellas: El Chilcar, 1,5 km, 2.310 m, variedades, Gran Bacchus de Oro 2024; sitio no accesible desde la herramienta, datos tomados del resumen de búsqueda); Correo del Sur 2019 (expositores de Fenavit).
- **c08 San Roque** — Publiagro 2023 (vides > 100 años, 6 m, filoxera, < 5.000 botellas, Brasil, notas por variedad, María José Granier); Juan Delicias Magazine (Finca San Roque, parte alta del valle); rutadelvinobolivia.com (Los Arbolitos, Slow Wine, horario); bolivia-online.net (viñedo San Roque, cepas más antiguas, propuesta UNESCO; certificado TLS del sitio inválido, dato tomado del resumen de búsqueda).

## Lo que no se pudo verificar o queda estimado

- **Altitud de San Roque (c08)**: la bodega no la publica; se estima ≈ 2.400 m (parte alta del cañón) y así se indica en el texto.
- **Altitud de El Chilcar (c07)** y **datos de Ocho Estrellas**: proceden del portal De los Cintis, cuyo dominio no resolvió durante la investigación; se citan tal como aparecieron en el índice de búsqueda.
- **Cooperativa Vitivinícola La Angostura**: la tesis de la UAJMS es un PDF que la herramienta no pudo leer; sólo se usó lo confirmado por prensa (existencia, presidente, entrega de uva a bodegas).
- **Fichas técnicas ausentes** (graduación, crianza): Reconquista (El Legado), Phi Blend (Sausini), Los Infinitos (Tierra Roja), Cepas de mi Abuelo, Ocho Estrellas, singani casero de Sella. En cada caso el texto lo advierte.
- **Bodega La Torre** y **hacienda El Patronato** existen pero sin datos de producto; se sustituyeron (ver tabla) y se mencionan en el texto de Isuma y El Chilcar.
- Los sitios bodegalaconcepcion.com, singanisanpedro.com (dominio en venta) y singanirujero.com (redirige a un sitio ajeno) no estaban operativos; se usaron artículos de prensa en su lugar.
- Las cifras de superficie de La Concepción (> 100 ha) y de Campos de Solana (> 40 ha) son las declaradas a prensa en 2018 y 2016 respectivamente.
