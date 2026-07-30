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

## Estado al 2026-07-30

- Core del pipeline: desplegado y verificado.
- Columnas `group_id`/`previous_id` (`cols.sh`) y logging por etapa (`taps.sh`): scripts entregados el 2026-07-30, ejecución pendiente de confirmar.
- `rudderstack-suite` (ZIP: README de arquitectura, `sdk/init.js` canónico, copias de referencia de `vector.yaml` y `bronze_v1.schema`, `Caddyfile` template, `schemactl-install.sh`): entregado por chat, **falta descomprimirlo en la raíz de este repo**.

## Pendiente

1. **Dominio** con registro A → `44.207.109.162` (bloqueado por el usuario).
2. Con el dominio: desplegar **Caddy** (TLS automático + preflight CORS + validación de writeKey). El Caddyfile de la suite solo necesita dos reemplazos: dominio y base64 del key.
3. Con Caddy arriba: `sdk/init.js` pasa de template a producción en la landing (reemplazar writeKey y dominio).
