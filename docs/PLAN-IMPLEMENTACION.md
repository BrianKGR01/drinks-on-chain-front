> **Superado (24 de septiembre de 2026).** La planificación vigente del ecosistema vive en la carpeta raíz `F:\Project\DrinksOnChain\docs\` (`01-analisis-ecosistema.md` … `06-decisiones-y-preguntas.md`). Dos cambios importantes respecto a este documento: la cadena es **Stellar** (smart wallets con passkeys y tokens SEP-41, no Privy/EVM) y la landing evoluciona a **portada del ecosistema** con perfiles por bodega. Se conserva como registro de la primera versión.

# Drinks on Chain — Plan de implementación del frontend

Versión 0.1 · 24 de septiembre de 2026 · Alcance: **solo cliente/frontend** de cada plataforma. El backend, la blockchain y la infraestructura los provee otro equipo; nosotros definimos los contratos que el frontend necesita y trabajamos contra mocks hasta que existan.

Fuentes: `docs/Drinks On Chain.pdf` (arquitectura y flujo de producto) y `docs/Estructura de pantallas.pdf` (UI/UX, Fase 1 MVP).

---

## 1. Mapa de repositorios

La carpeta `F:\Project\DrinksOnChain\` es el paraguas. Un repositorio de GitHub por sistema, todos bajo la cuenta `BrianKGR01`:

| Repo | Sistema | Tipo de cliente | Estado |
|---|---|---|---|
| `drinks-on-chain-front` | Landing pública | Web, escritorio primero, WebGL | **En construcción** |
| `doc-design-system` | Tokens, componentes y utilidades compartidas | Paquete npm (GitHub Packages) | Propuesto, sprint 0 |
| `doc-api-contracts` | Tipos TypeScript + OpenAPI + servidor de mocks (MSW) | Paquete npm | Propuesto, sprint 0 |
| `doc-erp-web` | Sistema 1 · ERP de trazabilidad | Web B2B, escritorio + tablet de planta | Sprint 2 |
| `doc-marketplace-app` | Sistema 2 · Marketplace + visor QR + cava | Web B2C mobile-first, PWA instalable | Sprint 3 |
| `doc-backoffice-web` | Sistema 3 · Panel de control Debro | Web escritorio, densa | Sprint 5 |
| `doc-claim-pos` | Sistema 4 · App de claim y entregas | PWA para tablet en modo kiosco | Sprint 6 |

Por qué multirepo y no monorepo: cada sistema tiene ciclo de vida, equipo de uso y despliegue distintos, y el usuario ya definió la carpeta paraguas como forma de trabajo. Lo compartido se extrae a dos paquetes (`design-system`, `api-contracts`) para no duplicar.

## 2. Stack común

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript estricto. Mismo stack en los cinco frontends para reutilizar componentes y conocimiento.
- **Estilos**: Tailwind CSS 4 con tokens del design system. Dos temas del documento UI/UX: *Oro Líquido* (claro) y *Cava Reserva* (oscuro).
- **Componentes base**: Radix UI primitives + componentes propios (tabla, slide-over, modal, badge, stat card, stepper). No usar plantillas admin: el UI/UX pide identidad propia.
- **Datos**: TanStack Query para servidor; zustand para estado de UI; react-hook-form + zod para formularios (los mismos esquemas zod viven en `api-contracts`).
- **Tablas densas**: TanStack Table (ERP y Backoffice).
- **Gráficos**: Recharts para KPIs; ninguna librería de trading en el MVP.
- **QR**: `qrcode` para generar (pase de retiro, exportación de lote); `@zxing/browser` para escanear con cámara (POS y visor).
- **Animación**: GSAP (splash de bóveda, sellos de éxito) y CSS; Motion solo donde haya layout animations.
- **i18n**: diccionarios ES/EN propios (misma estructura que `src/content/i18n.ts` de la landing). ES por defecto.
- **Testing**: Vitest + Testing Library para unidades; Playwright para flujos críticos (login por rol, bifurcación, compra, claim).
- **Calidad**: ESLint (config next) + Prettier + Husky/lint-staged; GitHub Actions con `lint`, `tsc`, `test`, `build` en cada PR.
- **Despliegue**: Vercel (una app por repo, previews por PR). El usuario ya tiene Vercel conectado.
- **Autenticación (frontend)**: abstracción `AuthProvider` con dos adaptadores, `mock` y `backend`, para no depender de la decisión del backend (JWT propio, Supabase Auth o Clerk). Todos los sistemas usan roles: `enologo | operario | admin_bodega | admin_debro | cajero | miembro`.

## 3. Blockchain y billeteras desde el cliente

El documento maestro pide en el MVP una **bóveda invisible**: el usuario se registra con teléfono y correo, y el sistema le crea la billetera sin que vea nada de Web3. Eso decide la arquitectura:

**Fase 1 (MVP)**
- Billetera **embebida / custodiada** creada en el registro. Opciones que encajan con "sin conocimientos Web3": Privy, Web3Auth, Dynamic o thirdweb In-App Wallets. Recomendación: **Privy** (login con email/teléfono, recuperación sencilla, SDK React maduro, soporte de EVM). La decisión final la comparte el backend porque el minting y el burn los firma un signer del servidor, no el usuario.
- Cadena: una L2 EVM de bajo costo (Polygon PoS o Base). Estándar sugerido: **ERC-1155** por lote (una colección por lote de botellas, `tokenId` por lote, cantidad = botellas), o ERC-721 si cada botella debe ser única desde el día uno. Las fichas del visor leen metadatos desde nuestra API, no directo de la cadena.
- Lo que hace el frontend del Marketplace: inicializar el SDK de billetera, mostrar "Mi Cava" a partir de la API (`GET /me/assets`), pedir el pase de retiro (`POST /claims`) y renderizar el QR firmado. No firma transacciones el usuario en el MVP.
- Lo que hace el POS: escanea el QR del pase, valida contra la API (`POST /claims/validate`), confirma la entrega (`POST /claims/:id/confirm`). El burn ocurre en el backend.
- Lo que hace el Backoffice: botón "Aprobar, mintear y publicar" → `POST /lots/:id/mint`; muestra el hash de la transacción y el estado (pendiente / confirmado / fallido) por polling o websocket.

**Fase 2 (post-MVP)**
- Conectar billeteras externas con **wagmi + viem + WalletConnect** además de la embebida; firma de listados P2P; KYC con proveedor externo (Persona) embebido con su SDK; preventas con fases de precio (contador y curva de precio en la PDP); quema por NFC (Web NFC solo en Chrome Android; iOS requiere app nativa, se documenta como riesgo).

## 4. Fases y calendario

Estimación con un equipo de dos personas de frontend a tiempo completo. Sprints de dos semanas.

| Sprint | Entregable | Dependencias |
|---|---|---|
| 0 (semanas 1–2) | `doc-design-system` v0 (tokens Oro Líquido / Cava Reserva, tipografía, botones, inputs, tabla, slide-over, modal, stat card), `doc-api-contracts` v0 (tipos de Lote, Terroir, Cosecha, Tanque, Colección, Activo, Claim, Ticket, Bodega, Usuario) con MSW | Aprobación de paleta y tipografías |
| 1 (semanas 1–4, en paralelo) | **Landing** replicando la referencia y luego tematizada a Bolivia: intro, mapa WebGL, parcelas, menú, páginas historia / vinos / parcela / contacto / aviso legal; SEO, OG, analítica | Fotos y textos de bodegas para la versión final |
| 2–3 (semanas 5–8) | **ERP** flujos 1–6: login por rol, dashboard, terroirs (badge D.O. Singani), vendimia y laboratorio, mapa de tanques, bitácora, modal de bifurcación, crianza (candado de tiempo), destilación (cortes, candado normativo), embotellado y exportación de QR | Contratos de lote y tanque; reglas de D.O. (altitud > 1.600 m, Moscatel de Alejandría) confirmadas |
| 3–4 (semanas 7–10) | **Marketplace** mobile-first: registro ligero + splash de bóveda, catálogo y PDP con checkout en slide-over, Mi Cava, generador de pase de retiro, scan gate, viaje del producto (scroll narrativo), cata y brand story, reviews; PWA | SDK de billetera elegido; pasarela de pago (tarjeta o QR local); API de activos y claims |
| 5 (semanas 11–12) | **Backoffice**: login con 2FA, dashboard KPI + alertas ERP, directorio y perfil de bodegas, "Generar credenciales ERP", pipeline de emisiones (kanban), modal de minting, helpdesk y resolución de disputas | Eventos del ERP hacia el backoffice (websocket o polling) |
| 6 (semanas 13–14) | **POS de claim**: PIN de sucursal, escáner continuo, semáforo verde/rojo, swipe para confirmar, éxito y vuelta automática, historial y cierre de turno; modo kiosco y offline básico (cola de reintentos) | Endpoints de validación y confirmación |
| 7 (semanas 15–16) | Integración de extremo a extremo con backend real, Playwright de los cuatro flujos críticos, accesibilidad AA, rendimiento (Lighthouse ≥ 90 en Marketplace), hardening | Backend en staging |

La landing corre en paralelo al sprint 0 porque no depende de contratos ni backend.

## 5. Detalle por sistema (rutas y componentes clave)

### 5.1 ERP de trazabilidad (`doc-erp-web`)
Layout: sidebar fija con logo serif, contenido con breadcrumbs y acción principal arriba a la derecha.
- `/login` split screen; redirección por rol.
- `/dashboard` widgets (lotes activos, kilos hoy, alertas) + tabla de tareas.
- `/terroirs`, `/terroirs/[id]` (badge "Apto para Singani D.O."), slide-over "Nueva cosecha".
- `/vendimia/pesaje` (input gigante tipo báscula), `/vendimia/analisis` (Brix, pH, acidez; aprobar/rechazar).
- `/tanques` (mapa visual), `/tanques/[id]` (bitácora), modal de bifurcación obligatorio.
- `/crianza` (barricas, madera, meses, cuenta regresiva), `/destilacion/cortes`, `/destilacion/reposo` (candado con días restantes).
- `/embotellado/[loteId]` y `/embotellado/[loteId]/exito` (exportar QR).
Componentes propios: `BigNumberInput`, `TankGrid`, `CountdownLock`, `DecisionModal`, `LotTimeline`.

### 5.2 Marketplace + visor (`doc-marketplace-app`)
Layout: header transparente en escritorio; bottom tabs (Inicio, Escáner, Cava, Perfil) en móvil.
- `/` escaparate con hero del último lanzamiento y grid.
- `/unete` registro ligero (teléfono + correo, Google/Apple) → `/bienvenida` splash de bóveda (GSAP).
- `/coleccion/[slug]` PDP con imagen sticky y CTA "Adquirir botella" → checkout en slide-over.
- `/cava` Mi Cava; modal de activo con "Ver trazabilidad" / "Retirar botella".
- `/cava/retiro/[claimId]` pase tipo ticket con QR temporal y cuenta atrás.
- `/b/[codigo]` scan gate → `/b/[codigo]/viaje` scroll narrativo (sello, línea de tiempo, cata, brand story, reviews).
Componentes: `BottleCard`, `StickyBuyBar`, `CheckoutSheet`, `VaultSplash`, `ClaimTicket`, `JourneyTimeline`, `StarRating`.

### 5.3 Backoffice (`doc-backoffice-web`)
Layout: sidebar oscura (Cava Reserva), header con buscador global y notificaciones.
- `/login` con 2FA; `/` dashboard KPI + alertas.
- `/bodegas`, `/bodegas/[id]` (credenciales ERP).
- `/emisiones` kanban; modal de minting (revisión + precio fijo + "Aprobar, mintear y publicar").
- `/soporte`, `/soporte/[ticketId]` split con verificación de cava del cliente.
Componentes: `DataGrid`, `KanbanBoard`, `MintReviewModal`, `TxStatusBadge`, `TicketSplitView`.

### 5.4 POS de claim (`doc-claim-pos`)
Pantalla completa, tablet, alto contraste, tipografía gigante.
- `/pin` teclado numérico; `/scan` cámara con retícula, linterna, "Ver historial de hoy".
- Overlays: `GreenApproval` (foto, "ENTREGAR: N botellas", swipe), `RedRejection` (motivo, "Volver a escanear"), `SuccessStamp` (2 s y vuelta al escáner).
- `/historial` recibo del turno y "Cerrar turno y bloquear".
Componentes: `PinPad`, `CameraScanner`, `SwipeToConfirm`, `TrafficLightOverlay`, `ShiftReceipt`.

## 6. Contratos mínimos que necesitamos del backend

Definidos por nosotros en `doc-api-contracts` para arrancar, y negociados después:
- Auth: `POST /auth/login`, `POST /auth/otp`, `GET /me` (rol, bodega, sucursal).
- ERP: `terroirs`, `harvests`, `lots` (estado: origen → vendimia → fermentación → crianza|destilación → reposo → embotellado → listo), `tanks`, `tank-logs`, `barrels`, `distillations`, `bottlings`, `lots/:id/qr-export`.
- Marketplace: `collections`, `collections/:slug`, `orders`, `me/assets`, `claims`, `bottles/:code` (viaje), `reviews`.
- Backoffice: `wineries`, `wineries/:id/credentials`, `mint-queue`, `lots/:id/mint`, `tickets`, `users/:email/assets`.
- POS: `pos/session` (PIN), `claims/validate`, `claims/:id/confirm`, `pos/shift/summary`.
- Eventos en tiempo real: `lot.ready`, `mint.confirmed`, `claim.confirmed` (websocket o SSE).

## 7. Riesgos y preguntas abiertas

1. **Proveedor de billetera y cadena**: decide el alcance de "Mi Cava" y del minting. Necesitamos la respuesta antes del sprint 3.
2. **Pasarela de pago en Bolivia**: tarjeta (¿Libélula, Todotix?) o QR bancario. Afecta el checkout del Marketplace.
3. **Reglas de D.O. Singani** (altitud, variedad, meses de reposo por categoría) deben venir por escrito para codificar validaciones.
4. **Cámara en tablets**: `getUserMedia` funciona en Safari iPadOS y Chrome Android; el modo kiosco y la linterna varían por dispositivo. Probar hardware real en el sprint 6.
5. **Contenido de la landing**: fotos, textos y fichas de las bodegas de Tarija y Cinti; hasta entonces usamos placeholders declarados.
6. **Tipografías**: la referencia usa fuentes comerciales (Shipley, Sabon). Usamos Cormorant Garamond y EB Garamond; si el cliente quiere las originales hay que comprar licencia web.

## 8. Siguientes pasos inmediatos

1. Terminar la landing replicada y publicarla en Vercel (preview) para revisión.
2. Crear `doc-design-system` y `doc-api-contracts` con la estructura mínima (sprint 0).
3. Validar con el cliente los puntos 1–3 de riesgos.
4. Crear los repos `doc-erp-web` y `doc-marketplace-app` con el andamiaje común (mismo `create-next-app`, mismos lint/CI) para que el equipo pueda empezar en paralelo.
