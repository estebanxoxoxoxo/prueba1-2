# tracking-suite

Suite de tracking portable (Meta / Facebook) para landings sobre Vercel + Firestore.
Da soporte a la landing en **una línea** y se lleva a otros proyectos copiando esta
carpeta + dos adaptadores en `/api`.

## Qué hace

- `pushEvent(FbEvent.X)` en **una línea**: dispara el evento en el **navegador**
  (Pixel `fbq`) y en el **servidor** (Conversions API) **en el momento**, con el mismo
  `eventId` (Meta deduplica), y lo **reporta al agregado** (+1 a su contador → raíz del doc).
- **Sesión**: dos fuentes crudas (segundos activos + gestos de scroll con debounce
  150ms) y **detectores** que reportan su evento al agregado: `commonScroll` (<2000px),
  `masiveScroll` (>2000px), `secondsToInitialScroll` (1er >500px), `readerScroll`
  (3×<300px en 60s). Los one-shot mueren al detectar; el contexto suma `seconds` al cierre.
- El **agregado** (payload) crece incremental: cada evento (fb o propio) reporta y esto
  acumula. Al **cerrarse la sesión** (`visibilitychange→hidden` / `pagehide` / desmontaje)
  manda **un doc** a `log-[campaign]` con todos los eventos en la raíz. Upsert por
  `sessionId` → **un solo doc por sesión**.

## Estructura

Criterio: lo **central** (orquesta / define el core) va a la **raíz**; una **acción
puntual** (hace una sola cosa) va a **`utils/`**. `session/` agrupa lo de la sesión.

```
tracking-suite/
  index.ts               → barrel público (lo que importa la landing)
  browserEvent.ts        → TODO el evento de browser: pushEvent + sendFbBrowserEvent + sendFbServerEvent
  session.tsx            → TODA la orquestación de sesión: contexto/Provider + agregado + snapshot
  events.ts              → taxonomía tipada: FbEvent, OwnEvent y el tipo que los nuclea (EventKey)
  handleServerEvent.ts   → handler /api/track: TODO el envío a la CAPI en un fichero (self-contained)
  handleSession.ts       → handler /api/session: guarda el doc de sesión (orquesta acciones)
  utils/                 → acciones puntuales (una por archivo): cookies, beacon, createRandomId,
                           readUrlParams, sanitizeCampaign, readRequest, db
  session/               → piezas de la sesión (las cablea session.tsx)
    sources/             → señales crudas: scrollSource (gestos, debounce 150ms) + secondsSource
    detectors/           → un detector por archivo (reportan vía sources.report):
                           commonScroll, masiveScroll (por gesto) · secondsToInitialScroll,
                           readerScroll (one-shot, mueren) · activeSession, relevantSession
                           (clasificaciones, se evalúan al cierre con flush)
    types.ts
api/
  track.ts    → adaptador fino → tracking-suite/handleServerEvent
  session.ts  → adaptador fino → tracking-suite/handleSession
```

## Cómo se usa en la landing

Envolvé la app con el `TrackingProvider`. Él lee la URL inicial una vez, la sostiene
en el contexto y **es dueño del ciclo de vida de la sesión**: la arranca al montar y
la flushea a la DB en el cleanup. No hace falta ningún hook aparte.

```jsx
import { TrackingProvider } from "../tracking-suite";

createRoot(el).render(
  <TrackingProvider>
    <App />
  </TrackingProvider>
);
```

```jsx
import { pushEvent, FbEvent, useTracking } from "../tracking-suite";

function App() {
  useEffect(() => {
    pushEvent(FbEvent.PageView, { browserOnly: true }); // solo pixel
    pushEvent(FbEvent.ViewContent);                     // pixel + CAPI + cuenta
  }, []);

  // En un click de conversión, atado a un id externo (para dedup / funnel):
  // pushEvent(FbEvent.Lead, { eventId: attemptId, contact: email });

  // Cualquier componente puede leer los params:
  // const { campaign, variant, heroVariant } = useTracking();
}
```

## Modelo de datos — un doc por sesión en `log-[campaign]`

```jsonc
{
  "campaign": "primavera",      // ?campaign= (sanitizado) — también nombra la colección
  "variant": "b",               // ?variant=  → o "default"
  "heroVariant": "video",       // ?heroVariant= → o "default"

  // --- Eventos, TODOS como campos en la raíz (no en un array) ---
  // Propios (OwnEvent):
  "seconds": 42,                // segundos activos de sesión
  "commonScroll": 11,           // scrolls < 2000px (deliberados)
  "masiveScroll": 2,            // scrolls > 2000px (fling/skim)
  "secondsToInitialScroll": 4,  // segundos hasta el 1er scroll > 500px (null si nunca)
  "readerScroll": true,         // hubo 3 scrolls < 300px en una ventana de 60s
  // Clasificaciones (detectores que se evalúan al cierre, en el cliente):
  "activeSession": true,        // seconds >= 5  && commonScroll >= 1
  "relevantSession": true,      // seconds > 30  && commonScroll > 8
  // De Facebook (FbEvent) — contadores de cuántas veces se dispararon:
  "PageView": 1,
  "ViewContent": 1,
  "Lead": 1,
  "ip": "…", "userAgent": "…", "language": "…", "referer": "…",
  "country": "AR", "region": "…", "city": "…", "timezone": "…",
  "latitude": "…", "longitude": "…", "fbp": "…", "fbc": "…",
  "sessionStart": 0, "sessionEnd": 0, "updatedAt": "<serverTimestamp>"
}
```

## Parámetros de URL

- `?campaign=` → colección `log-[campaign]` (fallback `log-default`).
- `?variant=` y `?heroVariant=` → propiedades del doc (default `"default"`).

Se leen de la URL **inicial** una sola vez (en `TrackingProvider`) y viven en el
contexto de React + el estado de sesión (memoria) hasta el flush. **Sin browser
storage** (`sessionStorage` / `localStorage`).

## Requisitos para portarla a otro proyecto

1. Copiar la carpeta `tracking-suite/`.
2. Crear los adaptadores en `/api` (ver `api/track.ts` y `api/session.ts`).
3. Poner el snippet del **Pixel de Meta** en el `<head>` (`fbq('init', '<PIXEL_ID>')`).
4. Setear las **env vars** en Vercel:

| Variable                   | Dónde   | Para qué                                   |
| -------------------------- | ------- | ------------------------------------------ |
| `FIREBASE_SERVICE_ACCOUNT` | server  | Escribir el doc de sesión en Firestore     |
| `META_PIXEL_ID`            | server  | Conversions API (el pixel del `<head>` es público) |
| `META_ACCESS_TOKEN`        | server  | Token secreto de la Conversions API        |

## Tradeoff de "DB al final"

La conversión a Meta (navegador + CAPI) llega **en tiempo real**; para el ad no se
pierde nada. El **doc de sesión** depende del beacon de cierre (`sendBeacon`, con
fallback a `fetch keepalive`): en el caso raro de que el navegador mate la pestaña y
el beacon falle, se pierde ese registro de **analytics** en la DB, pero **no** la
conversión en Meta.
