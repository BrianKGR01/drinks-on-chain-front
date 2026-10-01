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

## O0-WEB-1 · Cierre del Sistema 0 (27-09-2026)

- [x] Node 22 (`.nvmrc`, `engines`), `packageManager` como en los repos de la organización y script `typecheck` (`next typegen && tsc --noEmit`) · 27-09-2026
- [x] Enlaces entre sitios: valores locales por defecto ERP `localhost:3002`, POS `localhost:3004`, landing `localhost:3001` · 27-09-2026
- [x] Pruebas de humo con Playwright (`e2e/`, escritorio y móvil): barrera de edad, controles accesibles del mapa sin depender del lienzo WebGL, menú, rutas de la red, `/acceso` sin credenciales, `/parcelas/…` → `/valles/…` (308), `/vinos` → landing y axe sin violaciones serias en la portada y en una bodega · 27-09-2026
- [x] CI (`.github/workflows/ci.yml`): lint, typecheck, build y Playwright (Chromium) en push y PR a `dev` y `main`; informe como artefacto si falla · 27-09-2026
- [x] Textos del canje: la ruta sigue siendo `/puntos-de-recojo`, pero el menú y las páginas hablan de "puntos de canje", "pase de canje" y NFT quemado al entregar; POS con tablet vinculada y PIN personal del cajero; el dueño invita a su equipo; sin promesas de precio ni de cobro · 27-09-2026
- [x] Botón "Entrar" de la barrera con área real de 200 × 60 px (antes un ancla de 0 × 0) · 27-09-2026
- [ ] Variables `NEXT_PUBLIC_URL_*` en el proyecto de Vercel (las crea la coordinación): `NEXT_PUBLIC_URL_LANDING`, `NEXT_PUBLIC_URL_ERP`; `NEXT_PUBLIC_URL_POS` cuando exista el POS

## O1-WEB-1 · Solicitud de alta real en `/unirse` (27-09-2026)

Contrato: `plan/contratos/o1-backoffice-y-bodegas.md` §0 y §3; proceso en `docs-back/07` §1 y §10.

- [x] `next.config.ts`: `rewrites` de `/api/v1/:path*` a `${API_ORIGIN}/v1/:path*` (variable de servidor; sin ella no hay proxy y el formulario dice que el envío no está disponible); CSP con el script y el iframe de Turnstile · 27-09-2026
- [x] Formulario de `/unirse` con los campos del contrato (razón social, nombre comercial, NIT, categoría, región de `src/content`, contacto, mensaje), validación mínima en cliente, Cloudflare Turnstile (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, clave de prueba por defecto) y campo trampa `website` · 27-09-2026
- [x] Respuestas: 202 → "Revisa tu correo" con los siguientes pasos; 422 marcado en su campo (`details[].field`); 429 con el tiempo de `Retry-After`; error de red y API no disponible; `aria-live`, foco al primer error y al resultado; textos ES/EN · 27-09-2026
- [x] `/unirse/verificar?token=`: confirma el correo (`POST …/verify`) o explica que el enlace no es válido o caducó; reintento ante errores transitorios; `noindex` · 27-09-2026
- [x] Pasos del "Proceso de alta" alineados con el flujo real (solicitud y correo, revisión y reunión, alta e invitación al dueño, equipo y primer lote) · 27-09-2026
- [x] e2e `e2e/unirse.spec.ts` con la API interceptada (éxito, 422 por campo, 429, red, sin API, verificación válida e inválida, campo trampa, teclado) y axe sin violaciones serias · 27-09-2026
- [x] IP real del cliente detrás del proxy (O1-OPS-1): `rewrites` sustituidos por `src/proxy.ts`, que reescribe `/api/v1/*` a `${API_ORIGIN}/v1/*` con `X-DOC-Client-IP` firmada (HMAC con `PROXY_SHARED_SECRET`, variable de servidor); pruebas en `e2e/api-proxy.spec.ts` · 27-09-2026
- [ ] Variables en el proyecto de Vercel (las crea la coordinación): `API_ORIGIN` y `PROXY_SHARED_SECRET` creadas el 01-10-2026 según la coordinación; falta `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- [ ] Prueba contra el backend real (pista E2E, cuando la parte B del backend esté desplegada)
- [ ] Postulación de puntos de canje por formulario (sin contrato todavía; hoy `?tipo=punto` ofrece el correo)

## O1B-WEB · Lista de espera de bodegas (01-10-2026)

Contrato: `plan/contratos/o1b-lista-de-espera.md`; plan: `plan/lista-de-espera.md`. Decisión del usuario (01-10): la lista de espera sustituye por ahora a la solicitud formal de `/unirse`, que en producción no puede enviar porque aún no hay correo para verificar.

- [x] `/lista-de-espera` (ES/EN, metadatos, imagen para compartir propia y sitemap): titular para bodegas y productores, tres beneficios y el formulario (bodega, región de `src/content` + "Otra región de Bolivia", qué produce, persona de contacto, correo, WhatsApp, mensaje opcional, consentimiento con texto de privacidad, campo trampa `website`); `POST /api/v1/public/waitlist` con `type: "WINERY"`, `locale` y `source` · 01-10-2026
- [x] `?src=` → `source`: validado `[a-z0-9-]{1,40}` (en minúsculas), guardado en `sessionStorage` y descartado si no es válido · 01-10-2026
- [x] Respuestas: 201 → "Tu bodega está en la lista" con el número de orden y qué pasa después; 422 marcado en su campo; 429 con el tiempo de `Retry-After`; error de red; API caída; aviso y botón desactivado si el sitio se compiló sin `API_ORIGIN`; foco al primer error y al resultado · 01-10-2026
- [x] Compartir con otra bodega: Web Share donde existe; si no, WhatsApp; siempre "Copiar el enlace"; el enlace lleva `?src=bodega-amiga` · 01-10-2026
- [x] `/unirse`: conserva la propuesta e incrusta la lista de espera (pasos del proceso adaptados); `?tipo=punto` sigue igual. La solicitud formal (`JoinForm`, `/unirse/verificar`) queda detrás de `NEXT_PUBLIC_FLAG_WINERY_APPLICATION=1`, con su código y sus pruebas intactos · 01-10-2026
- [x] "Unirse" en el menú, el pie, `/acceso` y `/bodegas` lleva a `/lista-de-espera` (a `/unirse` con la bandera) · 01-10-2026
- [x] Móvil primero: cómodo en 360 px (sin desbordes, texto de los campos ≥ 16 px, controles ≥ 44 px, teclados de correo y teléfono, botón a todo el ancho); la barrera de edad solo existe en el mapa y no aparece al llegar en frío desde el QR · 01-10-2026
- [x] e2e en tres builds (`pnpm e2e`): lista (por defecto), solicitud (bandera activa) y sin `API_ORIGIN`; axe sin violaciones serias en la página, con errores, en la confirmación y en `/unirse` · 01-10-2026
- [ ] Captcha real en la lista de espera (el contrato lo deja apagado; cuando existan las claves de Turnstile y `WAITLIST_CAPTCHA_REQUIRED=true`, el formulario debe enviar `captchaToken`)
- [ ] Contador "ya somos N" (`GET /v1/public/waitlist/stats`): no se muestra en este sitio; decidir si conviene cuando haya bodegas anotadas
- [ ] Prueba real de punta a punta en producción y códigos QR con `?src=tarija-2026` (coordinación)

## Mediciones (Lighthouse 12, móvil, build de producción local, 25-09-2026)

| Página | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| `/` (mapa WebGL) | sin puntuar | 100 | 93 | 100 |
| `/bodegas/destileria-cinti-viejo` | 79 | 100 | 96 | 100 |
| `/unirse` | 81 | 100 | 96 | 100 |

"Buenas prácticas" pierde puntos por el 404 local del script de analítica (solo existe en Vercel). En el inicio Lighthouse no obtiene el LCP del canvas WebGL y marca textos del HUD menores de 12 px (diseño heredado de la referencia).
