# Drinks on Chain — Landing

Landing pública de **Drinks on Chain**: vinos de altura y singani de Bolivia con trazabilidad desde la parcela. La experiencia replica el modelo de [chartogne-taillet.com](https://chartogne-taillet.com/fr): un mapa aéreo dibujado a tinta sobre papel, con las parcelas de cada valle recorribles una a una.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript estricto
- Tailwind CSS 4 + CSS Modules para las coreografías finas
- React Three Fiber + drei + three (mapa WebGL procedural con shaders de grabado)
- GSAP (micro-animaciones) · zustand (estado de la experiencia)
- Tipografías: Cormorant Garamond (display) y EB Garamond (texto), vía `next/font`

## Scripts

```bash
pnpm dev      # http://localhost:3000
pnpm build
pnpm start
pnpm lint
pnpm tsc --noEmit
```

## Estructura

```
src/
  app/                 rutas: /, /historia, /vinos, /contacto, /aviso-legal, /parcelas/[valle]/[parcela]
  components/
    intro/             barrera de edad (AgeGate)
    hud/               MENU, MAPA, navegador de parcelas, CTA "Descubrir"
    menu/              menú principal a pantalla completa
    scene/             escena 3D (terreno, parcelas, pueblo, cámara, shaders)
    pages/             páginas editoriales
    ui/                utilidades (LetterSplit, ilustraciones a tinta)
  content/             valles y parcelas (geometría), textos ES/EN, fichas placeholder
  store/               estado global de la experiencia (zustand)
  lib/scene-contract   tipos compartidos entre la escena y la interfaz
docs/                  análisis de la referencia y plan de implementación del ecosistema
```

## Contenido

Las 22 parcelas son zonas vitivinícolas reales del Valle Central de Tarija y del Valle de Cinti, con altitud, municipio, variedades, bodegas y un vino o singani real por zona, todo con fuentes (`docs/FUENTES-CONTENIDO.md`). Las fotografías son de Wikimedia Commons con licencia libre (`docs/CREDITOS-IMAGENES.md`). La geometría del mapa (posición y tamaño de parcelas, trazado del pueblo) es ilustrativa hasta recibir datos de las bodegas. Todo se edita en `src/content/`.

## Flujo de trabajo en Git

- `main`: versiones estables. No se hace commit directo.
- `dev`: rama de integración; todo el trabajo diario se commitea aquí.
- Cuando `dev` acumula un cambio significativo se abre un PR `dev → main`.
- Mensajes con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat(scope): …`, `fix(scope): …`, `style(theme): …`, `docs: …`, `refactor: …`, `chore: …`. Scopes habituales: `scene`, `hud`, `intro`, `menu`, `pages`, `content`, `theme`.

## Documentación

- `docs/analisis-referencia-chartogne.md` — qué es la referencia y cómo la replicamos.
- `docs/PLAN-IMPLEMENTACION.md` — primera versión del plan (superada; ver la carpeta `docs/` de la raíz del ecosistema: análisis, plan de la landing, roadmap, billeteras Stellar, sistema de diseño).
