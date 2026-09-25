# Roadmap interno · `drinks-on-chain-front` (sitio de bodegas, `bodegas.`)

Sitio B2B del ecosistema: el mapa grabado de los valles con foco en la red de socios (bodegas y puntos de recojo). Este archivo es el detalle fino; la planificación general vive en la carpeta `docs/` del ecosistema (`02-plan-landing-ecosistema.md` §4 y `03-roadmap-frontend.md` §Sistema 0, pasos B.1–B.5). `docs/PLAN-IMPLEMENTACION.md` es el plan histórico de la primera versión.

Convenciones: trabajo en `dev`, Conventional Commits, PR `dev → main` al cerrar. Una casilla se marca (`- [x]`) cuando el cambio está commiteado en `dev`, con la fecha al lado.

## Hecho antes de este roadmap

- [x] Experiencia WebGL del mapa grabado, barrera de edad, menú, navegador de parcelas, sonido · 24-09-2026
- [x] 22 zonas reales con fuentes y fotografías con licencia libre; `/parcelas/[valle]/[parcela]`, `/vinos`, `/historia`, `/contacto`, `/aviso-legal` · 24-09-2026
- [x] Despliegue en Vercel (producción desde `main`, previews desde `dev`) · 24-09-2026

## 0 · Correcciones reportadas (25-09-2026)

- [ ] 0.1 Nada se mueve debajo de la barrera de edad: el documento no se desplaza y la rueda o el gesto táctil no llegan a la cámara del mapa.
- [ ] 0.2 Al entrar, la página y la cámara parten de su posición inicial.

## 1 · Marca

- [ ] 1.1 Solo Drinks on Chain en contacto, aviso legal y menú.

## B.1 · Datos de la red

- [ ] B.1.1 `src/content/data/bodegas.json`: las cuatro bodegas del catálogo de prueba (`08-datos-de-prueba.md` §3) con estado Socia / En conversación / Referencia, relación con las parcelas del mapa, sede, productos y lotes con trazabilidad pública.
- [ ] B.1.2 `src/content/data/puntos-de-recojo.json`: los cinco puntos de prueba enlazados a sus bodegas.
- [ ] B.1.3 `src/content/network.ts`: tipos y consultas (bodega por slug, bodegas de una parcela, puntos de una bodega), con los mismos identificadores que `@doc/mocks` (`win_altos`, `pp_lacava`…).
- [ ] B.1.4 Aviso visible: la red es de prueba; ninguna bodega real tiene acuerdo.

## B.2 · Navegación

- [ ] B.2.1 Menú: Mapa · Bodegas · Puntos de recojo · Unirse · Acceso (más Historia y Contacto en el pie del menú).
- [ ] B.2.2 Pie común con la landing principal en las páginas de contenido.
- [ ] B.2.3 `/vinos` redirige a la landing principal (`/vinos` de la raíz).
- [ ] B.2.4 Enlaces salientes por variables de entorno: `NEXT_PUBLIC_URL_LANDING`, `NEXT_PUBLIC_URL_ERP`, `NEXT_PUBLIC_URL_POS`, con valores de producción por defecto; nunca hosts escritos en los componentes.

## B.3 · Páginas

- [ ] B.3.1 `/acceso`: dos tarjetas, "Soy bodega → ERP" y "Soy punto de recojo → POS". No es un login.
- [ ] B.3.2 `/unirse`: propuesta para bodegas (beneficios, cómo es el ERP, requisitos D.O., proceso de alta) y formulario de contacto de prueba (valida en cliente, no envía datos, sin cuentas).
- [ ] B.3.3 `/puntos-de-recojo`: qué es un punto autorizado, cómo se habilita, lista de puntos activos, "Contactar" y "Acceso al POS".
- [ ] B.3.4 `/bodegas`: directorio con estado en la red.
- [ ] B.3.5 `/bodegas/[slug]`: historia, mini-mapa SVG con sus parcelas, productos, lotes con trazabilidad pública, puntos de recojo, estado en la red y "Acceso al ERP".

## B.4 · Mapa

- [ ] B.4.1 Conmutador "Parcelas / Bodegas" en el mapa.
- [ ] B.4.2 Capa de bodegas: marcadores de sede en el valle.
- [ ] B.4.3 Al elegir una bodega se encuadran sus parcelas y se enlaza su perfil.

## B.5 · Rutas y calidad

- [ ] B.5.1 `/parcelas/[v]/[p]` → `/valles/[v]/[p]` con redirección permanente; enlaces internos actualizados.
- [ ] B.5.2 `sitemap.ts` y `robots.ts`; metadatos por ruta; `metadataBase`.
- [ ] B.5.3 Cabeceras de seguridad (misma política que la landing, con `worker-src`/`blob:` si el mapa lo necesita).
- [ ] B.5.4 `pnpm lint`, `tsc` y `pnpm build` sin errores; prueba en móvil y escritorio; Lighthouse accesibilidad ≥ 95.
- [ ] B.5.5 PR `dev → main` con capturas.
