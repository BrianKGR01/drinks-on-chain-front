# Drinks on Chain — Sitio de las bodegas (`bodegas.`)

Sitio B2B del ecosistema **Drinks on Chain**: el mapa grabado de los valles de Tarija y Cinti con foco en la red de socios. Muestra las parcelas y las bodegas de la red, los puntos de canje (ruta `/puntos-de-recojo`), la propuesta para unirse y el acceso a los sistemas de los socios (ERP para bodegas, POS para puntos de canje). La experiencia del mapa replica el modelo de [chartogne-taillet.com](https://chartogne-taillet.com/fr): un mapa aéreo dibujado a tinta sobre papel.

Este sitio **no autentica a nadie**: no tiene sesión, cookies propias ni formularios de credenciales. "Acceso" solo enlaza al subdominio de cada sistema. El único envío de datos es la solicitud de alta de `/unirse`, pública y protegida con captcha.

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
pnpm e2e          # Playwright: build de producción en el puerto 3120 (E2E_PORT para cambiarlo)
```

La primera vez: `pnpm exec playwright install chromium`. Las pruebas de humo (`e2e/smoke.spec.ts`) cubren la barrera de edad, los controles accesibles del mapa (capa y navegador de parcelas), el menú, las rutas de la red, la redirección `/parcelas/…` → `/valles/…` y axe (sin violaciones serias) en escritorio y móvil. No dependen del lienzo WebGL, que puede no dibujarse en una máquina sin GPU. `e2e/unirse.spec.ts` prueba la solicitud de alta y la verificación del correo interceptando la API en el navegador (`page.route`: éxito, 422 por campo, 429, error de red, API no disponible, token válido e inválido) y sustituye el script de Turnstile por uno local; el servidor de las pruebas arranca con un `API_ORIGIN` ficticio (`E2E_API_ORIGIN` para cambiarlo) que nunca se alcanza. La CI (`.github/workflows/ci.yml`) corre lint, typecheck, build y Playwright en cada push y PR a `dev` y `main`; si falla, el informe queda como artefacto.

## Variables de entorno

Copia `.env.example` a `.env.local`. Los enlaces a los otros sitios nunca se escriben en el código (`src/lib/links.ts`):

| Variable | Uso | Sin definir |
|---|---|---|
| `NEXT_PUBLIC_URL_LANDING` | Landing principal (raíz): `/vinos`, privacidad, "Para consumidores" | Vercel en producción, `localhost:3001` en desarrollo |
| `NEXT_PUBLIC_URL_ERP` | ERP de trazabilidad (`erp.`), puerta "Soy bodega" de `/acceso` | `localhost:3002` en desarrollo; en producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_URL_POS` | Aplicación de canje (`pos.`), puerta "Soy punto de recojo" | `localhost:3004` en desarrollo; en producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico (metadatos, sitemap, robots) | `drinks-on-chain-bodegas.vercel.app` en producción |
| `API_ORIGIN` | **De servidor.** Origen del backend: Next reescribe `/api/v1/*` de este sitio a `${API_ORIGIN}/v1/*`, así el navegador solo habla con su propio origen. Se lee al compilar (cambiarla exige redesplegar) | Sin proxy: `/unirse` muestra que el envío no está disponible y ofrece el correo |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Clave de sitio de Cloudflare Turnstile para el captcha de `/unirse` (la secreta la tiene el backend) | La clave de prueba pública `1x00000000000000000000AA`, que siempre valida: solo sirve contra un backend con la secreta de prueba |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Barrera de edad y mapa WebGL con navegador; conmutador **Parcelas / Bodegas** |
| `/bodegas`, `/bodegas/[slug]` | Directorio de la red con su estado y perfil de cada bodega (historia, parcelas en el mapa, productos, lotes con trazabilidad pública, puntos de recojo) |
| `/puntos-de-recojo` | Qué es un punto autorizado, cómo se habilita y puntos activos |
| `/unirse` | Propuesta para bodegas y **solicitud de alta**: `POST /api/v1/public/winery-applications` con captcha (Turnstile) y campo trampa `website`; al enviarla, "Revisa tu correo" con los siguientes pasos. Con `?tipo=punto`, el correo de contacto de los puntos de canje (su formulario llega más adelante) |
| `/unirse/verificar?token=` | Enlace del correo de verificación: `POST /api/v1/public/winery-applications/verify`; confirma o explica que el enlace no es válido o caducó. No se indexa |
| `/acceso` | Dos puertas: ERP (bodegas) y POS (puntos de recojo). No es un login |
| `/valles/[valle]/[parcela]` | Ficha de parcela (`/parcelas/…` redirige aquí con 308) |
| `/historia`, `/contacto`, `/aviso-legal` | Páginas editoriales |
| `/vinos` | Redirige al catálogo de la landing principal |

## Estructura

```
src/
  app/                 rutas (arriba), sitemap.ts, robots.ts, opengraph-image.tsx
  components/
    intro/             barrera de edad (AgeGate)
    hud/               MENU, MAPA, conmutador de capa, navegador, marcadores de bodegas, CTA
    menu/              menú principal a pantalla completa
    network/           páginas de la red (acceso, unirse, puntos, bodegas) y NetworkMap (SVG)
    scene/             escena 3D (terreno, parcelas, pueblo, cámara, anclas de bodegas, shaders)
    pages/, site/      páginas editoriales, marco y pie común con la landing
    ui/, brand/        utilidades, wordmark
  content/             valles y parcelas, zonas con fuentes, textos ES/EN, red de socios (data/*.json + network.ts)
  lib/                 contrato de la escena, enlaces, SEO (site.ts), geometría del mapa
  store/               estado global de la experiencia (zustand)
docs/                  roadmap interno, fuentes del contenido, créditos de imágenes, análisis de la referencia
```

## Contenido

Las 22 parcelas son zonas vitivinícolas reales del Valle Central de Tarija y del Valle de Cinti, con fuentes (`docs/FUENTES-CONTENIDO.md`) y fotografías con licencia libre (`docs/CREDITOS-IMAGENES.md`). La geometría del mapa es ilustrativa hasta recibir datos de las bodegas.

La **red de socios** (`src/content/data/bodegas.json` y `puntos-de-recojo.json`) es la red de prueba del ecosistema (`../docs/08-datos-de-prueba.md` §3), con los mismos identificadores que `@doc/mocks`. Es ficticia hasta cerrar los primeros acuerdos y el sitio lo indica. La landing principal lleva una copia de estos archivos; se editan aquí.

## Seguridad

Cabeceras en `next.config.ts`: CSP sin nonce (sitio estático, sin datos de usuario; admite el script y el iframe de `challenges.cloudflare.com` para Turnstile), `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción.

La solicitud de alta valida en el cliente solo lo que la persona puede corregir antes de enviar (obligatorios y forma del correo); las reglas (NIT, duplicados, límites) son del servidor, que responde 422 con `details[].field` y el formulario marca cada campo. Las peticiones van sin cookies (`credentials: "omit"`) y con `X-Client-App: PUBLIC`. El token de Turnstile es de un solo uso: se pide otro tras cada intento. El script de Turnstile solo se descarga cuando el formulario se acerca a la vista.

## Flujo de trabajo en Git

- `main`: versiones estables. No se hace commit directo.
- `dev`: rama de integración; todo el trabajo diario se commitea aquí.
- Cuando `dev` acumula un cambio significativo se abre un PR `dev → main`.
- Mensajes con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat(scope): …`, `fix(scope): …`, `style(scope): …`, `perf(scope): …`, `docs: …`, `refactor: …`, `chore: …`. Scopes habituales: `scene`, `map`, `hud`, `intro`, `nav`, `pages`, `network`, `content`, `seo`, `a11y`.
