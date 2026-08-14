# Contexto del proyecto

Este repo es **la landing de Smarty** y nada más: React + Vite (ver `README.md`). La analítica no vive acá — vive en **`events-suite`**, un repo aparte que entra como **submódulo de git** en `events-suite/`.

## El split (2026-08-14)

La suite salió de este repo al suyo (`C:\Users\esteb\Desktop\events-suite`, con la historia del `subtree split`). Se llevó:

| Se fue | Dónde vive ahora |
|---|---|
| `events-suite/` | la raíz del repo de la suite (por eso el espejo sigue importando de `../events-suite`) |
| `api/` (las 5 funciones) | `events-suite/api/` |
| `infra/` (Vector, EC2, CloudShell) | `events-suite/infra/` |
| `public/sourceConfig.json` + el dataplane del `vite.config.js` | `events-suite/host/` |
| script `publish:event-types` | `package.json` de la suite |

**Consecuencia viva, a resolver**: `/api/register`, `/api/failed-lead` y `/api/firebase-config` son del registro con Google de ESTA landing y se fueron con `api/` por decisión explícita. Hasta que se re-expongan desde la raíz (un re-export de una línea por función, receta en `events-suite/host/README.md`), en producción el botón de registro va a dar 404. En dev nunca existieron.

Lo mismo, en menor escala, para la suite: sin `/api/send-server-event` la CAPI de Meta no cuenta (queda el pixel solo) y sin `/api/get-vercel-session-metadata` los eventos viajan sin geo/IP de sesión. Degradan sin romper la página.

## La conexión con la suite — el espejo, y solo el espejo

`src/eventsSuiteMirror.tsx` es **el único archivo de la landing que importa de `events-suite`**. Todo lo demás importa del espejo. Es verificable con un grep y es la regla que hace que mover, renombrar o versionar la suite no toque más de un archivo acá.

Lo que la landing implementa del contrato:

- `main.jsx` — `<EventsSuiteProvider reader>` envuelve `<App />`, **solo esa rama**: las rutas `/placas` de ads quedan afuera a propósito.
- `App.jsx` — `suite.startDelivery({ rudderStackWriteKey, fb: true, vercelMetadataCollect: true, activeSessions })` una sola vez, con la config de `src/config.js`. Ahí también salen las conversiones directas de Meta: `pushEvent(FbEvent.PageView)` y `ViewContent`.
- `RegisterButton.tsx` — `pushBusinessEvent(RegisterButtonClick)` y `pushBusinessEvent(SubscribeClick, { metadata: { source, attempt_id } })`.
- `registerWithGoogle.js` — `pushEvent(FbEvent.Lead, { eventId: attemptId })`. El `attemptId` es el mismo id en Meta, en `failedLeads` y en bronze: correlaciona los tres sistemas.
- Markup — `data-analytics-id` en las secciones a medir (habilita `component_focus`).
- `vite.config.js` — una línea: `eventsSuiteVite({ writeKey, sourceName, workspace })`, el plugin que la propia suite trae en `host/vite.js`. Cero código de la suite acá.

**Qué NO hacer**: importar de `events-suite` fuera del espejo · emitir eventos de comportamiento desde la landing (son de las FSMs) · editar la suite desde acá sin commitear en su repo (es un submódulo: los cambios se commitean allá y acá se actualiza el puntero).

## Trabajar con el submódulo

```bash
git clone --recurse-submodules <repo>          # o, si ya está clonado:
git submodule update --init --recursive
```

El submódulo apunta a **`https://github.com/estebanxoxoxoxo/events-suite.git`** (rama `main`). Verificado el 2026-08-14 con un clon limpio desde GitHub: trae la suite sola.

Si se toca la suite: commit en su repo → `git add events-suite` acá (eso mueve el puntero) → commit.

## Configuración de la landing

`src/config.js` — WhatsApp, marca, y las dos constantes públicas que la landing le pasa a la suite: `ANALYTICS_WRITE_KEY` (tiene que coincidir con el sourceConfig que emite el plugin y con el que valide Caddy) y `ACTIVE_SESSIONS_DB` (RTDB de presencia en vivo, hoy el proyecto `sessions-ingest`).

`index.html` — snippet del pixel de Meta (`fbq`) y de Hotjar. El pixel es requisito de la suite: ella lo usa, no lo instala.

`vercel.json` — el rewrite del SPA + los dos del dataplane (`/v1/batch` y `/sourceConfig`), copiados de `events-suite/host/vercel.json`.

`TrackingProvider` (sistema viejo de sesiones en Firestore) sigue eliminado de `main.jsx`.
