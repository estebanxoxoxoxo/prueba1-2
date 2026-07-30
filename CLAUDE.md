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
  - `src/analytics.js` — facade con cola propia; carga el SDK en idle (con timeout: las animaciones continuas de la landing pueden postergar `requestIdleCallback` para siempre); `page()` manual al cargar; `track()` usable antes de que cargue el SDK.
  - writeKey `LTlHrScEJw3Xe47zz4tw3NjWLjS` en `src/config.js` — debe coincidir con `public/sourceConfig.json` y con el que valide Caddy.
  - Dataplane y `configUrl` **same-origin** (sin CORS ni mixed content): en dev/preview `vite.config.js` sirve `/sourceConfig` y proxya `/v1/batch` al ingestador; en prod lo hacen los rewrites de `vercel.json`. Ojo: el SDK pide `/sourceConfig/` con barra final.
  - Evento `subscribe_click` en `startRegisterAttempt` (`registerWithGoogle.js`) con `properties: { source, attempt_id }` — el mismo `attemptId` que va a Meta (eventId) y a failedLeads, para correlacionar los tres sistemas.
- Migración `tracking-suite` → `facebook-api-template` **completada** (venía a medias y el build estaba roto): imports de `main.jsx`/`App.jsx`/`registerWithGoogle.js` apuntados a `facebook-api-template/facebook-push-events/utils`, dos re-export paths corregidos y `setServerEndpoint` agregado. `TrackingProvider` (sistema viejo de sesiones en Firestore) eliminado de `main.jsx`.
- `rudderstack-suite` (ZIP con README, `init.js`, copias de `vector.yaml`/`bronze_v1.schema`, `Caddyfile`, `schemactl-install.sh`): entregado por chat, falta descomprimirlo en este repo. `src/analytics.js` ya implementa lo que `sdk/init.js` describía.

## Pendiente

1. **Abrir tcp/8080 del security group** (paste de CloudShell entregado el 2026-07-30) — interino hasta Caddy, sin validación de writeKey. Con eso los eventos del navegador llegan a raw/bronze.
2. **Redeploy en Vercel** para activar los rewrites de `/v1/batch` y `/sourceConfig` en prod (verificar que Vercel acepte destino `http://`; si no, esperar a Caddy).
3. **Dominio** con registro A → `44.207.109.162`, luego **Caddy** (TLS + CORS + validación del writeKey de arriba) y cerrar 8080. Después apuntar el dataplane de `src/analytics.js`/rewrites al dominio si se quiere sacar el hop de Vercel.
4. `/api/*` no existe en este repo (`api/` está vacío): el registro con Google (`/api/firebase-config`, `/api/register`) y la CAPI de Meta (`/api/send-server-event`) dependen de endpoints que no están acá. Revisar dónde viven realmente.
