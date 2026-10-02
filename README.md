# Drinks on Chain — Sitio de las bodegas (`bodegas.`)

Sitio B2B del ecosistema **Drinks on Chain**: el mapa grabado de los valles de Tarija y Cinti con foco en la red de socios. Muestra las parcelas y las bodegas de la red, los puntos de canje (ruta `/puntos-de-recojo`), la propuesta para unirse y el acceso a los sistemas de los socios (ERP para bodegas, POS para puntos de canje). La experiencia del mapa replica el modelo de [chartogne-taillet.com](https://chartogne-taillet.com/fr): un mapa aéreo dibujado a tinta sobre papel.

Este sitio **no autentica a nadie**: no tiene sesión, cookies propias ni formularios de credenciales. "Acceso" solo enlaza al subdominio de cada sistema. El único envío de datos es la **lista de espera de bodegas** (`/lista-de-espera`, también incrustada en `/unirse`), pública y protegida con campo trampa y límites en el servidor; la solicitud de alta formal de `/unirse` (con captcha y verificación por correo) queda detrás de la bandera `NEXT_PUBLIC_FLAG_WINERY_APPLICATION` hasta que exista el correo.

Plan: `../docs/02-plan-landing-ecosistema.md` §4 y `../docs/03-roadmap-frontend.md` §Sistema 0. Avance fino: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript estricto
- Tailwind CSS 4 + CSS Modules para las coreografías finas
- React Three Fiber + drei + three (mapa WebGL procedural con shaders de grabado)
- GSAP (micro-animaciones) · zustand (estado de la experiencia)
- Tipografías: Cormorant Garamond (display) y EB Garamond (texto), vía `next/font` (autoalojadas)
- Vercel Web Analytics (sin cookies)

## Scripts

Node 22 (`.nvmrc`) y pnpm 10.

```bash
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm typecheck    # next typegen + tsc --noEmit
pnpm e2e          # Playwright: las tres variantes de abajo, una tras otra
pnpm e2e:lista    # build con lista de espera, API y Marketplace (NEXT_PUBLIC_URL_APP), puerto 3120 (E2E_PORT para cambiarlo)
pnpm e2e:solicitud  # build con NEXT_PUBLIC_FLAG_WINERY_APPLICATION=1, con API y sin NEXT_PUBLIC_URL_APP, puerto 3130
pnpm e2e:sin-api  # build sin API_ORIGIN ni NEXT_PUBLIC_URL_APP, puerto 3140
```

La primera vez: `pnpm exec playwright install chromium`. Las pruebas de humo (`e2e/smoke.spec.ts`) cubren la barrera de edad, los controles accesibles del mapa (capa y navegador de parcelas), el menú, las rutas de la red, la redirección `/parcelas/…` → `/valles/…` y axe (sin violaciones serias) en escritorio y móvil. No dependen del lienzo WebGL, que puede no dibujarse en una máquina sin GPU. `e2e/lista-de-espera.spec.ts` prueba la lista de espera de bodegas interceptando la API en el navegador (`page.route`): llegada en frío desde el QR sin barrera de edad, envío con número de orden, validación en cliente, 422 por campo, 429, error de red, API caída, `?src=` → `source` (y su paso por `sessionStorage`), compartir (Web Share, WhatsApp y copiar), inglés, 360 px (sin desbordes, teclados y tamaños táctiles), metadatos y axe; y `/unirse` sin la bandera (propuesta + lista incrustada, `?tipo=punto`, `/unirse/verificar` en 404, enlaces del menú, `/acceso` y el pie). `e2e/unirse.spec.ts` prueba la solicitud de alta formal y la verificación del correo (éxito, 422 por campo, 429, error de red, API no disponible, token válido e inválido) y sustituye el script de Turnstile por uno local. `e2e/sin-api.spec.ts` comprueba el aviso cuando falta `API_ORIGIN`. `e2e/bodegas.spec.ts` prueba el directorio de bodegas con la API interceptada (la API decide las socias, bodegas que solo conoce la API, inglés, teclado, axe; y el respaldo de `src/content` con 500, 404, red vacía, otra forma, sin red y API lenta), la ficha de una bodega y los enlaces al Marketplace del pie, el menú y `/acceso`; `e2e/sin-marketplace.spec.ts`, lo mismo sin `NEXT_PUBLIC_URL_APP` (ningún enlace al Marketplace). La lógica pura se prueba sin navegador: `e2e/api-proxy.spec.ts` (proxy), `e2e/links.spec.ts` (enlaces) y `e2e/winery-directory.spec.ts` (validación, caché y unión de la API con el contenido).

La bandera, `API_ORIGIN` y `NEXT_PUBLIC_URL_APP` se leen al compilar, así que cada combinación necesita su propio build (`playwright.config.ts`): **lista** (lista de espera, API y Marketplace; todas las pruebas menos las siguientes), **solicitud** (bandera activa, con API y sin Marketplace; `unirse.spec.ts` y `sin-marketplace.spec.ts`) y **sin-api** (sin API ni Marketplace; `sin-api.spec.ts`). Comparten `.next`, por eso van una tras otra, cada una en su puerto. Donde hay API, el servidor de las pruebas arranca con un `API_ORIGIN` ficticio (`E2E_API_ORIGIN` para cambiarlo) que nunca se alcanza. La CI (`.github/workflows/ci.yml`) corre lint, typecheck, build y Playwright en cada push y PR a `dev` y `main`; si falla, el informe queda como artefacto.

## Variables de entorno

Copia `.env.example` a `.env.local`. Los enlaces a los otros sitios nunca se escriben en el código (`src/lib/links.ts`):

| Variable | Uso | Sin definir |
|---|---|---|
| `NEXT_PUBLIC_URL_LANDING` | Landing principal (raíz): `/vinos`, privacidad, "Para consumidores" | Vercel en producción, `localhost:3001` en desarrollo |
| `NEXT_PUBLIC_URL_ERP` | ERP de trazabilidad (`erp.`), puerta "Soy bodega" de `/acceso` | `localhost:3002` en desarrollo; en producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_URL_POS` | Aplicación de canje (`pos.`), puerta "Soy punto de recojo" | `localhost:3004` en desarrollo; en producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_URL_APP` | Marketplace (S2): "Marketplace" y "Verifica una botella" (`/b`) en el pie, el menú y `/acceso`, y la página de cada bodega socia (`/bodegas/{slug}`) desde `/bodegas` y su ficha. Se lee al compilar | `localhost:3005` en desarrollo; en producción **no se muestra ningún enlace al Marketplace** (aún no tiene URL pública): la ficha de una socia enlaza a los vinos de la landing |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico (metadatos, sitemap, robots) | `drinks-on-chain-bodegas.vercel.app` en producción |
| `API_ORIGIN` | **De servidor.** Origen del backend: `src/proxy.ts` reescribe `/api/v1/*` de este sitio a `${API_ORIGIN}/v1/*`, así el navegador solo habla con su propio origen. `/lista-de-espera` y `/unirse` la leen al compilar (cambiarla exige redesplegar) | Sin proxy: los formularios avisan de que el envío no está disponible, ofrecen el correo y no dejan enviar |
| `PROXY_SHARED_SECRET` | **De servidor, nunca `NEXT_PUBLIC_`.** Firma la IP del cliente (`X-DOC-Client-IP` + HMAC-SHA256 con marca de tiempo) para los límites y el captcha del backend (O1-OPS-1); el mismo valor que en el backend del entorno (con varios separados por comas, firma con el primero) | Sin firma: el backend ve la IP de Vercel |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clave de sitio de Cloudflare Turnstile para el captcha de la solicitud formal de `/unirse` (la secreta la tiene el backend) | La clave de prueba pública `1x00000000000000000000AA`, que siempre valida: solo sirve contra un backend con la secreta de prueba |
| `NEXT_PUBLIC_FLAG_WINERY_APPLICATION` | `1` activa la **solicitud de alta formal** de `/unirse` (formulario con NIT y captcha, `/unirse/verificar`) y devuelve a `/unirse` los enlaces de "Unirse". Se lee al compilar (`src/lib/flags.ts`) | La lista de espera ocupa su lugar: "Unirse" lleva a `/lista-de-espera`, `/unirse` la incrusta y `/unirse/verificar` responde 404 |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Barrera de edad y mapa WebGL con navegador; conmutador **Parcelas / Bodegas** |
| `/bodegas`, `/bodegas/[slug]` | Directorio de la red con su estado y perfil de cada bodega (historia, parcelas en el mapa, productos, lotes con trazabilidad pública, puntos de recojo). El directorio se sirve con `src/content` y, ya en el navegador, lee los **perfiles públicos de la API** (`GET /api/v1/public/wineries`, ORG-11): ver "Directorio de bodegas" |
| `/puntos-de-recojo` | Qué es un punto autorizado, cómo se habilita y puntos activos |
| `/lista-de-espera` | **Lista de espera de bodegas** (móvil primero: se llega por un QR, sin barrera de edad): titular, tres beneficios y el formulario (bodega, región, qué produce, contacto, correo, WhatsApp, mensaje opcional, consentimiento, campo trampa `website`). `POST /api/v1/public/waitlist` con `type: "WINERY"`, `locale` y `source` (de `?src=`, validado `[a-z0-9-]{1,40}` y guardado en `sessionStorage`). Al enviarla, "Tu bodega está en la lista" con el número de orden, qué pasa después y compartir con otra bodega (Web Share, o WhatsApp y copiar el enlace, con `?src=bodega-amiga`) |
| `/unirse` | Propuesta para bodegas (beneficios, ERP, requisitos D.O., proceso) y, al final, la **lista de espera incrustada**. Con `?tipo=punto`, el correo de contacto de los puntos de canje (su formulario llega más adelante). Con `NEXT_PUBLIC_FLAG_WINERY_APPLICATION=1`, en lugar de la lista, la **solicitud de alta formal**: `POST /api/v1/public/winery-applications` con captcha (Turnstile) y campo trampa; al enviarla, "Revisa tu correo" con los siguientes pasos |
| `/unirse/verificar?token=` | Solo con la bandera (sin ella, 404). Enlace del correo de verificación: `POST /api/v1/public/winery-applications/verify`; confirma o explica que el enlace no es válido o caducó. No se indexa |
| `/acceso` | Dos puertas: ERP (bodegas) y POS (puntos de recojo). No es un login |
| `/valles/[valle]/[parcela]` | Ficha de parcela (`/parcelas/…` redirige aquí con 308) |
| `/historia`, `/contacto`, `/aviso-legal` | Páginas editoriales |
| `/vinos` | Redirige al catálogo de la landing principal |


## Directorio de bodegas: API con respaldo de `src/content`

`/bodegas` nunca depende del backend para pintarse: el HTML lleva el directorio de `src/content` (el de siempre). Con `API_ORIGIN`, ya en el navegador pide `GET /api/v1/public/wineries?limit=100&offset=0` por el proxy firmado (`src/lib/public-wineries.ts`), valida la respuesta con zod (`src/lib/public-wineries-schema.ts`, un fragmento aparte que solo se descarga en ese momento) y une los perfiles con el contenido por `slug` (`src/lib/winery-directory.ts`):

- **Con una respuesta buena, la API decide las socias**: cada perfil sale como "Socia" con su nombre comercial y su texto; una bodega que `src/content` da por socia y la API no lista se retira; las bodegas "en conversación" y "de referencia", que la API nunca lista, siguen saliendo del contenido.
- **Lo que solo sabe `src/content`** se conserva para las bodegas que coinciden: mapa y parcelas, sede, lotes, productos, puntos de canje y los textos en inglés. Una bodega que solo conoce la API se dibuja con el mapa del valle que nombra su región (si lo nombra) y enlaza a su página del Marketplace (texto sin enlace si falta `NEXT_PUBLIC_URL_APP`).
- **Respaldo**: API caída, lenta (8 s), vacía, con otra forma o sin `API_ORIGIN` → la página se queda como se sirvió. Una respuesta buena se reutiliza 5 minutos dentro de la visita; si la revalidación falla, se conserva la última buena.
- Los `logoUrl` del entorno de desarrollo (`/mocks/uploads/…`) y los sitios `*.test` se tratan como ausentes. Los logos todavía no se dibujan: la CSP solo admite imágenes del propio origen y aún no se conoce el host de las subidas.
- El mapa WebGL de la portada sigue leyendo `src/content`.

## Estructura

```
src/
  app/                 rutas (arriba), sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    intro/             barrera de edad (AgeGate)
    hud/               MENU, MAPA, conmutador de capa, navegador, marcadores de bodegas, CTA
    menu/              menú principal a pantalla completa
    network/           páginas de la red (acceso, unirse, lista de espera, puntos, bodegas) y NetworkMap (SVG)
    scene/             escena 3D (terreno, parcelas, pueblo, cámara, anclas de bodegas, shaders)
    pages/, site/      páginas editoriales, marco y pie común con la landing
    ui/, brand/        utilidades, wordmark
  content/             valles y parcelas, zonas con fuentes, textos ES/EN, red de socios (data/*.json + network.ts)
  lib/                 contrato de la escena, enlaces, SEO (site.ts, og-image.tsx), banderas (flags.ts), cliente de la API pública y lista de espera, geometría del mapa
  store/               estado global de la experiencia (zustand)
docs/                  roadmap interno, fuentes del contenido, créditos de imágenes, análisis de la referencia
```

## Contenido

Las 22 parcelas son zonas vitivinícolas reales del Valle Central de Tarija y del Valle de Cinti, con fuentes (`docs/FUENTES-CONTENIDO.md`) y fotografías con licencia libre (`docs/CREDITOS-IMAGENES.md`). La geometría del mapa es ilustrativa hasta recibir datos de las bodegas.

La **red de socios** (`src/content/data/bodegas.json` y `puntos-de-recojo.json`) es la red de prueba del ecosistema (`../docs/08-datos-de-prueba.md` §3), con los mismos identificadores que `@doc/mocks`. Es ficticia hasta cerrar los primeros acuerdos y el sitio lo indica. La landing principal lleva una copia de estos archivos; se editan aquí.

## Seguridad

Cabeceras en `next.config.ts`: CSP sin nonce (sitio estático, sin datos de usuario; admite el script y el iframe de `challenges.cloudflare.com` para Turnstile), `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción.

Los formularios (lista de espera y solicitud de alta) validan en el cliente solo lo que la persona puede corregir antes de enviar (obligatorios y forma del correo y del teléfono); las reglas (duplicados, límites, NIT) son del servidor, que responde 422 con `details[].field` y el formulario marca cada campo. Las peticiones van sin cookies (`credentials: "omit"`) y con `X-Client-App: PUBLIC`. La lista de espera no lleva captcha por ahora (el contrato lo deja apagado hasta tener claves reales): se protege con el campo trampa y los límites por IP real y por correo del backend, que dependen de `PROXY_SHARED_SECRET`. Un `?src=` que no cumple `[a-z0-9-]{1,40}` se descarta y nunca se envía. El token de Turnstile es de un solo uso: se pide otro tras cada intento. El script de Turnstile solo se descarga cuando el formulario se acerca a la vista.

## Flujo de trabajo en Git

- `main`: versiones estables. No se hace commit directo.
- `dev`: rama de integración; todo el trabajo diario se commitea aquí.
- Cuando `dev` acumula un cambio significativo se abre un PR `dev → main`.
- Mensajes con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat(scope): …`, `fix(scope): …`, `style(scope): …`, `perf(scope): …`, `docs: …`, `refactor: …`, `chore: …`. Scopes habituales: `scene`, `map`, `hud`, `intro`, `nav`, `pages`, `network`, `content`, `seo`, `a11y`.
