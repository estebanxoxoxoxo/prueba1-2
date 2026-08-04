# Contexto del proyecto

Este repo es la landing de **Smarty** (React + Vite — ver `README.md` para el desarrollo de la landing) y además el hogar previsto de `rudderstack-suite/`: el pipeline de analytics propio, compatible con el protocolo RudderStack. Este archivo documenta ese segundo frente, que no vive en ningún otro lado del repo.

## Pipeline de analytics

**Flujo:** SDK JS (rudder-analytics) → `POST /v1/batch` → Vector en EC2 → S3 en dos capas:
- **raw** — el JSON crudo de cada request, tal como llegó.
- **bronze** — Parquet con envelope de 17 columnas (esquema `bronze_v1`), un registro por evento ya spliteado del batch. Incluye `group_id` y `previous_id`.

Flush a S3 cada 10 minutos o al apagar Vector.

**Reglas no negociables del SDK** (el porqué está en el README de la suite):
- Batch obligatorio: `queueOptions.batch.enabled: true`.
- Sin beacon, sin autoTrack; `page()` se llama manualmente.
- writeKey validado por header (base64) en el edge.

**Capa plata (diseñada, no construida):** traits en `context.traits`, dedup por `message_id`, particionado por fecha.

**Observabilidad:** taps de consola por etapa en el journal de Vector — una línea JSON `{"stage":"INGEST",...}` por request recibido, una `{"stage":"TRANSFORM",...}` por evento individual (un batch de N = 1 INGEST + N TRANSFORM), y el debug de `aws_smithy_runtime` loguea cada PutObject a S3. Ver en vivo: `journalctl -u vector -f`. Es logging por evento: con volumen alto se apaga quitando el sink `console_taps` y borrando `logging.conf`.

## Infra

| Qué | Dónde |
|---|---|
| EC2 | `i-0c3181f7280153931` · `us-east-1` · IP pública `44.207.109.162` |
| Vector | servicio systemd; config `/etc/vector/vector.yaml`, esquema `/etc/vector/bronze_v1.schema` |
| Ingest | `http://127.0.0.1:8080/v1/batch` (aún no público) |
| Log level | drop-in `/etc/systemd/system/vector.service.d/logging.conf` (`VECTOR_LOG=info,aws_smithy_runtime=debug`) |

## Mecanismo de deploy al servidor

No hay acceso directo a la instancia desde esta máquina. Todo cambio se entrega como **dos bloques bash para pegar en AWS CloudShell**:

1. Un heredoc `cat > X.sh << 'OUTER' … OUTER` con el script completo.
2. El despacho: `aws ssm send-command` (AWS-RunShellScript) + `aws ssm get-command-invocation` para traer el output.

Cada script debe ser **idempotente** (guard `grep … && echo YA_EXISTE`), con **backup + `vector validate` + rollback** automático, y **autoverificable**: imprime `VALIDATE_OK` / `SVC_active` / `CURL_200` y manda un evento de prueba con curl. Un cambio cuenta como desplegado solo cuando el output muestra esos marcadores. Para comandos sueltos existe `bash run.sh "…"` en CloudShell.

## Estado al 2026-07-30 (noche)

- Core del pipeline: desplegado y verificado. Columnas `group_id`/`previous_id` y logging por etapa **confirmados**: los eventos de prueba `test-g1` y `test-log1` aparecen en bronze en S3.
- **Frontend integrado**: SDK `@rudderstack/analytics-js` (v3, npm) en la landing.
  - `src/analytics.js` **ya no existe** (2026-07-31): su lógica vive en `events-suite/3-delivery/pushers/rudderstack.ts` (SDK en idle con timeout, cola pre-SDK, `page()` manual, batch, sin beacon). La suite completa es sources → FSMs → gateway → adapters (puros) → pushers, con `metadata/` (vercel/login/fb) para enriquecer al despachar. LA única conexión app↔suite es el espejo `src/eventsSuite.tsx` (ÚNICO archivo de la app que importa de `events-suite`; el resto importa del espejo) → `<EventsSuiteProvider reader>` (en `main.jsx`, solo rama App — no placas) + `useEventsSuite()` → `{ pushBusinessEvent, startDelivery }`; importar la suite ya auto-inicia la detección (cero red), y `App.jsx` llama `suite.startDelivery({ rudderStackWriteKey: ANALYTICS_WRITE_KEY, fb: true, vercelMetadataCollect: true })` (mapping de Meta conservador: Lead excluido a propósito — ya lo dispara `startRegisterAttempt` con `eventId = attemptId`). `pushers/fb/` es copia de `facebook-push-events`; `subscribe_click` lo emite `RegisterButton` (no `registerWithGoogle`, que quedó sin tracking) con el mismo `attempt_id`, y el adapter lo aplana al shape de siempre.
  - writeKey `LTlHrScEJw3Xe47zz4tw3NjWLjS` en `src/config.js` — debe coincidir con `public/sourceConfig.json` y con el que valide Caddy.
  - Dataplane y `configUrl` **same-origin** (sin CORS ni mixed content): en dev/preview `vite.config.js` sirve `/sourceConfig` y proxya `/v1/batch` al ingestador; en prod lo hacen los rewrites de `vercel.json`. Ojo: el SDK pide `/sourceConfig/` con barra final.
  - Evento `subscribe_click` en `startRegisterAttempt` (`registerWithGoogle.js`) con `properties: { source, attempt_id }` — el mismo `attemptId` que va a Meta (eventId) y a failedLeads, para correlacionar los tres sistemas.
- `facebook-api-template/` **retirado del repo** (2026-08-03): su copia vive en `events-suite/3-delivery/pushers/fb/` y la suite es el único motor Meta. Las conversiones directas (PageView/ViewContent en `App.jsx`, Lead en `registerWithGoogle.js`) usan `pushEvent`/`FbEvent` importados del espejo `src/eventsSuiteMirror.tsx`. `TrackingProvider` (sistema viejo de sesiones en Firestore) sigue eliminado de `main.jsx`.
- `rudderstack-suite` (ZIP con README, `init.js`, copias de `vector.yaml`/`bronze_v1.schema`, `Caddyfile`, `schemactl-install.sh`): entregado por chat, falta descomprimirlo en este repo. `src/analytics.js` ya implementa lo que `sdk/init.js` describía.

## Pendiente

1. **Abrir tcp/8080 del security group** (paste de CloudShell entregado el 2026-07-30) — interino hasta Caddy, sin validación de writeKey. Con eso los eventos del navegador llegan a raw/bronze.
2. **Redeploy en Vercel** para activar los rewrites de `/v1/batch` y `/sourceConfig` en prod (verificar que Vercel acepte destino `http://`; si no, esperar a Caddy).
3. **Dominio** con registro A → `44.207.109.162`, luego **Caddy** (TLS + CORS + validación del writeKey de arriba) y cerrar 8080. Después apuntar el dataplane de `src/analytics.js`/rewrites al dominio si se quiere sacar el hop de Vercel.
4. `api/` ya tiene dos funciones: `send-server-event.ts` (CAPI de Meta — el pusher de fb ya corre `browserOnly: false`: pixel + CAPI con el mismo eventID; requiere `META_PIXEL_ID` y `META_ACCESS_TOKEN` en las env de Vercel, sin ellas la CAPI da 500 y solo cuenta el pixel) y `get-vercel-session-metadata.ts` (geo/IP de sesión). Siguen sin vivir acá `/api/firebase-config` y `/api/register` (registro con Google) — revisar dónde viven realmente.
