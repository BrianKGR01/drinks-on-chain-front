# Análisis de la referencia: chartogne-taillet.com

Fecha del análisis: 24 de septiembre de 2026. Analizado con el navegador integrado (DOM, CSS, bundle JS y peticiones de red).

## Qué es técnicamente

- SPA en **Vue 2** (chunk-vendors + app.js) hecha por Bruno Simon. Solo dos rutas reales en el router (`/` y `*`); todo lo demás (menú, parcelas, mapa, páginas de vino) es estado interno.
- Toda la vista principal es **un único `<canvas>` WebGL2** a pantalla completa (`.scene`). MENU, CARTE, la regla numerada y los nombres de parcelas también se dibujan dentro del canvas (no hay DOM para ellos).
- Assets: 7 modelos `.glb` (terreno, pueblo, calles, campos, árboles, edificios por pueblo), texturas de datos de terreno (`terrainData1/2/3`), `perlin-512`, `paper-256`, `clouds`, `paintingMask`, títulos de parcela pre-renderizados como PNG (`merfyField01Title`…`14`), etiquetas de vino, blasones. Sonido: 7 mp3 (intro, loop modo libre, loop parcela, transiciones).
- Dos "pueblos": **Merfy** (14 parcelas) y **Avize** (parcelas de Avize y Oger). Se cambia con el enlace "Avize →" a la derecha de la lista.

## Flujo de la experiencia

1. **Barrera de edad**: logo (eyebrow "CHAMPAGNE", nombre entre filetes, "Vignerons à Merfy depuis 1683"), frase en mayúsculas espaciadas ("Je certifie…"), botón "Entrer" en rojo con una barra vertical fina debajo, idiomas FR/EN/JP y "Mentions légales" abajo a la izquierda. Coreografía: letras a 2 s, botón a 2,2 s, barra a 2,5 s / 3,3 s. Hover: las letras rojas se apagan y aparecen negras con retardos por letra.
2. **Modo libre**: vista aérea a ~50° del pueblo dibujado a tinta sobre papel crema. La rueda del ratón orbita la cámara (lento, amortiguado); arrastrar también orbita. Nubes suaves flotan y oscurecen levemente el terreno.
3. **Selección de parcela**: clic en la parcela o en su nombre → la cámara vuela hasta ella, sus hileras se tiñen de rojo, el nombre queda en rojo en la lista y la línea roja de la regla avanza.
4. **CARTE**: vista cenital, norte arriba, con brújula; la rueda hace zoom.
5. **MENU**: overlay papel con rejilla tenue, "FERMER" rotado a la izquierda, logo, enlaces enormes (Histoire, Vins, Contact…) con un indicador vertical rojo, y pie con idiomas, avisos, redes y crédito.
6. **Páginas de contenido** (datos en JSON embebido por parcela): `ground` (specifications, description, details, underground.levels), `wine` (name, specifications, packshot, bloques `block-column` / `block-highlight` / `block-image` / `block-paragraph`, fichetechnique PDF). La página de vinos tiene lista fija a la izquierda, packshot centrado con sombra, detalles a la derecha, "Découvrir" abajo.

## Tokens de diseño observados

| Token | Valor |
|---|---|
| Fondo papel | `#fdfcf5` (secundario `#f9f6ee`) |
| Rojo de acento | `#c23d2a` |
| Grises | `#625e54`, `#a0a095`, `#464340` |
| Reglas | `rgba(0,0,0,.32)`, hairline `rgba(0,0,0,.11)` / `.05` |
| Display | *Shipley Regular* (mayúsculas con tracking 0.2–0.4em) |
| Texto | *Sabon LT Std* |
| Root font-size | `.8333vw` entre 768 y 1920 px, 16 px desde 1920, `4.2666vw` bajo 375 px |
| Tamaños | títulos 4.375–5.5rem, texto 1.5625rem/1.52, UI 14px, small-heading .875rem |

## Cómo lo replicamos

| Referencia | Nuestra implementación |
|---|---|
| Vue 2 + Three.js imperativo | Next.js 16 + React Three Fiber + drei + GSAP + zustand |
| GLB modelados a mano | Terreno, parcelas, casas, árboles y caminos **procedurales** desde `src/content/villages.ts` (semilla por valle) con shaders de grabado (hatching por pendiente, contornos, desvanecido a papel) |
| UI dentro del canvas | UI en DOM (accesible, indexable): `AgeGate`, `MainCta`, `MapCta`, `ParcelNavigator`, `DiscoverCta`, `MainMenu` |
| Shipley / Sabon (comerciales) | Cormorant Garamond / EB Garamond (Google Fonts, gratuitas) |
| Textura paper-256 | Grano SVG `feTurbulence` en `body::before` con `multiply` |
| Merfy / Avize | Valle Central de Tarija (14 parcelas) / Valle de Cinti (8 parcelas) |
| Sonido | Pendiente (el store ya tiene `soundOn`) |

Contenido de parcelas y vinos: placeholder plausible en `src/content/parcels.ts`, generado por parcela a partir de variedad, altitud y valle; se reemplaza cuando lleguen las fichas técnicas de las bodegas.
