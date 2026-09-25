# Roadmap interno · `drinks-on-chain-front` (sitio de bodegas, `bodegas.`)

Sitio B2B del ecosistema: el mapa grabado de los valles con foco en la red de socios (bodegas y puntos de recojo). Este archivo es el detalle fino; la planificación general vive en la carpeta `docs/` del ecosistema (`02-plan-landing-ecosistema.md` §4 y `03-roadmap-frontend.md` §Sistema 0, pasos B.1–B.5). `docs/PLAN-IMPLEMENTACION.md` es el plan histórico de la primera versión.

Convenciones: trabajo en `dev`, Conventional Commits, PR `dev → main` al cerrar. Una casilla se marca (`- [x]`) cuando el cambio está commiteado en `dev`, con la fecha al lado.

## Hecho antes de este roadmap

- [x] Experiencia WebGL del mapa grabado, barrera de edad, menú, navegador de parcelas, sonido · 24-09-2026
- [x] 22 zonas reales con fuentes y fotografías con licencia libre; `/parcelas/[valle]/[parcela]`, `/vinos`, `/historia`, `/contacto`, `/aviso-legal` · 24-09-2026
- [x] Despliegue en Vercel (producción desde `main`, previews desde `dev`) · 24-09-2026

## 0 · Correcciones reportadas (25-09-2026)

- [x] 0.1 Nada se mueve debajo de la barrera de edad: el documento no se desplaza y la rueda o el gesto táctil no llegan a la cámara del mapa. · 25-09-2026
- [x] 0.2 Al entrar, la página y la cámara parten de su posición inicial. · 25-09-2026

## 1 · Marca

- [x] 1.1 Solo Drinks on Chain en contacto, aviso legal y menú. · 25-09-2026

## B.1 · Datos de la red

- [x] B.1.1 `src/content/data/bodegas.json`: las cuatro bodegas del catálogo de prueba (`08-datos-de-prueba.md` §3) con estado Socia / En conversación / Referencia, relación con las parcelas del mapa, sede, productos y lotes con trazabilidad pública. · 25-09-2026
- [x] B.1.2 `src/content/data/puntos-de-recojo.json`: los cinco puntos de prueba enlazados a sus bodegas. · 25-09-2026
- [x] B.1.3 `src/content/network.ts`: tipos y consultas (bodega por slug, bodegas de una parcela, puntos de una bodega), con los mismos identificadores que `@doc/mocks` (`win_altos`, `pp_lacava`…). · 25-09-2026
- [x] B.1.4 Aviso visible: la red es de prueba; ninguna bodega real tiene acuerdo. · 25-09-2026

## B.2 · Navegación

- [x] B.2.1 Menú: Mapa · Bodegas · Puntos de recojo · Unirse · Acceso (más Historia y Contacto en el pie del menú). · 25-09-2026
- [x] B.2.2 Pie común con la landing principal en las páginas de contenido. · 25-09-2026
- [x] B.2.3 `/vinos` redirige a la landing principal (`/vinos` de la raíz). · 25-09-2026
- [x] B.2.4 Enlaces salientes por variables de entorno: `NEXT_PUBLIC_URL_LANDING`, `NEXT_PUBLIC_URL_ERP`, `NEXT_PUBLIC_URL_POS`, con valores de producción por defecto; nunca hosts escritos en los componentes. · 25-09-2026

## B.3 · Páginas

- [x] B.3.1 `/acceso`: dos tarjetas, "Soy bodega → ERP" y "Soy punto de recojo → POS". No es un login. · 25-09-2026
- [x] B.3.2 `/unirse`: propuesta para bodegas (beneficios, cómo es el ERP, requisitos D.O., proceso de alta) y formulario de contacto de prueba (valida en cliente, no envía datos, sin cuentas). · 25-09-2026
- [x] B.3.3 `/puntos-de-recojo`: qué es un punto autorizado, cómo se habilita, lista de puntos activos, "Contactar" y "Acceso al POS". · 25-09-2026
- [x] B.3.4 `/bodegas`: directorio con estado en la red. · 25-09-2026
- [x] B.3.5 `/bodegas/[slug]`: historia, mini-mapa SVG con sus parcelas, productos, lotes con trazabilidad pública, puntos de recojo, estado en la red y "Acceso al ERP". · 25-09-2026

## B.4 · Mapa

- [x] B.4.1 Conmutador "Parcelas / Bodegas" en el mapa. · 25-09-2026
- [x] B.4.2 Capa de bodegas: marcadores de sede en el valle. · 25-09-2026
- [x] B.4.3 Al elegir una bodega se encuadran sus parcelas y se enlaza su perfil. · 25-09-2026

## B.5 · Rutas y calidad

- [x] B.5.1 `/parcelas/[v]/[p]` → `/valles/[v]/[p]` con redirección permanente; enlaces internos actualizados. · 25-09-2026
- [x] B.5.2 `sitemap.ts` y `robots.ts`; metadatos por ruta; `metadataBase`. · 25-09-2026
- [x] B.5.3 Cabeceras de seguridad (misma política que la landing, con `worker-src`/`blob:` si el mapa lo necesita). · 25-09-2026
- [x] B.5.4 `pnpm lint`, `tsc` y `pnpm build` sin errores; prueba en móvil y escritorio; Lighthouse accesibilidad ≥ 95. · 25-09-2026
- [ ] B.5.5 PR `dev → main` con capturas.

## Extras hechos en esta ronda

- [x] Doble clic en "Entrar" ya no atraviesa la barrera; la barrera es un modal real (todo lo demás `inert`) · 25-09-2026
- [x] Los marcadores de bodegas son botones DOM posicionados por la escena (sin raíces React de drei) · 25-09-2026
- [x] El mapa WebGL solo se descarga al visitar el inicio (TBT móvil de `/unirse`: ~2,1 s → ~0,2 s) · 25-09-2026
- [x] Tamaños de texto legibles sobre la raíz fluida; contraste AA en botones dorados · 25-09-2026
- [x] Vercel Web Analytics (sin cookies). **Acción manual pendiente**: activarlo en el panel del proyecto · 25-09-2026

## Correcciones tras la revisión del cliente (25-09-2026)

- [x] Las sedes de las bodegas ya no tiemblan al girar el mapa (matrices de cámara actualizadas en el mismo frame) · 25-09-2026
- [x] "Volver al valle" y el conmutador Parcelas / Bodegas ya no se superponen: comparten el hueco superior · 25-09-2026
- [ ] Grosor de trazo del mapa en móvil: pendiente de decisión (opiniones divididas)

## Mediciones (Lighthouse 12, móvil, build de producción local, 25-09-2026)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` (mapa WebGL) | sin puntuar | 100 | 93 | 100 |
| `/bodegas/destileria-cinti-viejo` | 79 | 100 | 96 | 100 |
| `/unirse` | 81 | 100 | 96 | 100 |

"Buenas prácticas" pierde puntos por el 404 local del script de analítica (solo existe en Vercel). En el inicio Lighthouse no obtiene el LCP del canvas WebGL y marca textos del HUD menores de 12 px (diseño heredado de la referencia).
