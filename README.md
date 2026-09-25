# Drinks on Chain — Sitio de las bodegas (`bodegas.`)

Sitio B2B del ecosistema **Drinks on Chain**: el mapa grabado de los valles de Tarija y Cinti con foco en la red de socios. Muestra las parcelas y las bodegas de la red, los puntos de recojo, la propuesta para unirse y el acceso a los sistemas de los socios (ERP para bodegas, POS para puntos de recojo). La experiencia del mapa replica el modelo de [chartogne-taillet.com](https://chartogne-taillet.com/fr): un mapa aéreo dibujado a tinta sobre papel.

Este sitio **no autentica a nadie**: no tiene sesión ni formularios de credenciales. "Acceso" solo enlaza al subdominio de cada sistema.

Plan: `../docs/02-plan-landing-ecosistema.md` §4 y `../docs/03-roadmap-frontend.md` §Sistema 0. Avance fino: [`docs/ROADMAP.md`](docs/ROADMAP.md).

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript estricto
- Tailwind CSS 4 + CSS Modules para las coreografías finas
- React Three Fiber + drei + three (mapa WebGL procedural con shaders de grabado)
- GSAP (micro-animaciones) · zustand (estado de la experiencia)
- Tipografías: Cormorant Garamond (display) y EB Garamond (texto), vía `next/font` (autoalojadas)
- Vercel Web Analytics (sin cookies)

## Scripts

```bash
pnpm dev      # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm exec tsc --noEmit
```

## Variables de entorno

Copia `.env.example` a `.env.local`. Los enlaces a los otros sitios nunca se escriben en el código (`src/lib/links.ts`):

| Variable | Uso | Sin definir |
|---|---|---|
| `NEXT_PUBLIC_URL_LANDING` | Landing principal (raíz): `/vinos`, privacidad, "Para consumidores" | Vercel en producción, `localhost:3001` en desarrollo |
| `NEXT_PUBLIC_URL_ERP` | ERP de trazabilidad (`erp.`), puerta "Soy bodega" de `/acceso` | En producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_URL_POS` | Aplicación de entregas (`pos.`), puerta "Soy punto de recojo" | En producción la puerta dice "Disponible pronto" |
| `NEXT_PUBLIC_SITE_URL` | Origen canónico (metadatos, sitemap, robots) | `drinks-on-chain-bodegas.vercel.app` en producción |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Barrera de edad y mapa WebGL con navegador; conmutador **Parcelas / Bodegas** |
| `/bodegas`, `/bodegas/[slug]` | Directorio de la red con su estado y perfil de cada bodega (historia, parcelas en el mapa, productos, lotes con trazabilidad pública, puntos de recojo) |
| `/puntos-de-recojo` | Qué es un punto autorizado, cómo se habilita y puntos activos |
| `/unirse` | Propuesta para bodegas y formulario de contacto de demostración (no envía datos) |
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

Cabeceras en `next.config.ts`: CSP sin nonce (sitio estático, sin datos de usuario), `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` y HSTS en producción.

## Flujo de trabajo en Git

- `main`: versiones estables. No se hace commit directo.
- `dev`: rama de integración; todo el trabajo diario se commitea aquí.
- Cuando `dev` acumula un cambio significativo se abre un PR `dev → main`.
- Mensajes con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat(scope): …`, `fix(scope): …`, `style(scope): …`, `perf(scope): …`, `docs: …`, `refactor: …`, `chore: …`. Scopes habituales: `scene`, `map`, `hud`, `intro`, `nav`, `pages`, `network`, `content`, `seo`, `a11y`.
