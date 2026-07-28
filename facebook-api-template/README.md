# facebook-api-template

Todo el código para mandar eventos **server-side a Meta** (Conversions API / CAPI),
listo para copiar a cualquier proyecto. Cero dependencias: solo `crypto` de Node en el
server y APIs del navegador en el cliente.

## Por qué server-side

El pixel solo (navegador) pierde entre el 20% y el 40% de las conversiones: ad blockers,
Safari/ITP, cookies bloqueadas, pestañas que se cierran antes de que cargue el script.
La CAPI manda el evento desde **tu server**, donde nada de eso aplica.

La clave es mandar **los dos** y con el **mismo `event_id`**: Meta deduplica y cuenta una
sola conversión, pero se queda con la que llegó. Eso es exactamente lo que hace
`pushEvent()`.

```
                       ┌── fbq('track', ev, {}, {eventID}) ──────────► Meta
  pushEvent(FbEvent.Lead)                                                 ▲ dedup por event_id
                       └── POST /api/send-server-event ──► tu server ─────┘
```

## Estructura

```
facebook-api-template/
├── api/send-server-event.ts     ← el endpoint. Copialo a /api de tu proyecto.
├── browser/
│   ├── index.ts                 ← superficie pública (importá siempre desde acá)
│   ├── pushEvent.ts             ← pixel + CAPI con el mismo eventId
│   ├── pixel.ts                 ← wrapper de fbq
│   ├── cookies.ts               ← _fbp / _fbc (+ reconstrucción desde ?fbclid)
│   ├── beacon.ts                ← sendBeacon con fallback a fetch keepalive
│   ├── ids.ts                   ← id de evento
│   └── types.ts                 ← FbEvent, FbUserData, FbCustomData
├── examples/pixel-snippet.html  ← el snippet del pixel para el <head>
├── scripts/send-test-event.mjs  ← probar la CAPI desde la terminal
└── .env.example
```

## Instalación (4 pasos)

**1. El endpoint.** Copiá `api/send-server-event.ts` a la carpeta `/api` de la raíz del
proyecto (Vercel deploya como función serverless todo lo que esté ahí). Ese fichero es
**self-contained a propósito**: importa solo `crypto` y no tiene imports relativos, porque
Vercel empaqueta cada función por separado y los imports a carpetas hermanas revientan en
runtime con `ERR_MODULE_NOT_FOUND`. No lo partas en módulos.

**2. Las variables de entorno.** Copiá `.env.example` a `.env` en la raíz y completalas.
En Vercel: Settings → Environment Variables, las mismas dos claves.

| Variable | Dónde sale |
|---|---|
| `META_PIXEL_ID` | Events Manager → tu pixel → Configuración |
| `META_ACCESS_TOKEN` | Events Manager → Conversions API → Generar token de acceso |
| `META_TEST_EVENT_CODE` | Events Manager → Test Events. **Vacío en producción.** |
| `META_GRAPH_VERSION` | Opcional, default `v23.0` |

> El token da de alta conversiones en tu cuenta publicitaria. Nunca lo pongas con prefijo
> `VITE_` / `NEXT_PUBLIC_` ni lo commitees.

**3. El pixel en el `<head>`.** Pegá `examples/pixel-snippet.html` en tu `index.html` con
tu pixel id. Sin esto no hay cookie `_fbp` y el match rate cae.

**4. El cliente.** Importá desde `browser/`:

```js
import { pushEvent, FbEvent } from '../facebook-api-template/browser';
```

## Uso

```js
// Evento simple: pixel + CAPI, mismo eventId, dedup automático.
pushEvent(FbEvent.ViewContent);

// PageView: el snippet del pixel ya lo dispara al init → solo navegador.
pushEvent(FbEvent.PageView, { browserOnly: true });

// Lead con el email del usuario (se hashea SHA-256 EN EL SERVER, nunca viaja en crudo).
pushEvent(FbEvent.Lead, { contact: 'juan@mail.com' });

// Atar el evento a un id propio (dedup entre disparos del mismo flujo).
const attemptId = crypto.randomUUID();
pushEvent(FbEvent.Lead, { eventId: attemptId });

// Advanced Matching completo: cuantos más campos, mejor el match rate.
pushEvent(FbEvent.CompleteRegistration, {
  userData: {
    email: user.email,
    firstName: 'Juan',
    lastName: 'Pérez',
    country: 'AR',
    externalId: user.uid,
  },
});

// Compra: value + currency son obligatorios.
pushEvent(FbEvent.Purchase, {
  contact: user.email,
  customData: { value: 29.99, currency: 'USD', content_name: 'Plan Pro' },
});
```

`pushEvent` devuelve el `eventId` usado y **nunca lanza**: si el pixel no cargó o la red
falla, la página sigue andando.

### Enganchar tu propia analítica

El template no sabe nada de tu DB a propósito. Si querés registrar cada evento (agregado
de sesión, logs), registrá un listener una sola vez al arrancar la app:

```js
import { onFbEvent } from '../facebook-api-template/browser';

onFbEvent((event, eventId) => {
  // guardar en tu DB, contador de sesión, etc.
});
```

Si el endpoint no está en `/api/send-server-event`, avisale: `setServerEndpoint('/otra/ruta')`.

## Verificar que funciona

```bash
node facebook-api-template/scripts/send-test-event.mjs Lead
```

Con `META_TEST_EVENT_CODE` seteado, el evento aparece en **Events Manager → Test Events**
en unos segundos. Un `HTTP 200` con `events_received: 1` es todo lo que necesitás ver.

Después, en producción, mirá en Events Manager que el evento diga **"Procesado con
Conversions API y pixel"** y que el % de deduplicación no sea 0: si es 0, el `eventId` no
está coincidiendo entre las dos patas.

## Detalles que importan

- **Hashing.** Todos los datos personales van SHA-256 hex, normalizados primero
  (minúsculas, sin espacios; teléfono solo dígitos con código de país). Normalizar mal es
  la causa #1 de match rate bajo: el hash de `"Juan@Mail.com "` no matchea con el de
  `"juan@mail.com"`. Si un valor ya viene hasheado, el server lo detecta y no lo re-hashea.
- **`_fbp` y `_fbc`.** Son los campos que más levantan el matching. `_fbc` se reconstruye
  desde `?fbclid=` de la URL si el pixel todavía no la escribió.
- **`sendBeacon`.** El evento sale aunque el usuario cierre la pestaña o navegue de
  inmediato — clave para el Lead que se dispara justo antes de un redirect a login.
- **IP del cliente.** Se toma la primera de `x-forwarded-for`; mandarle la cadena entera a
  Meta hace que descarte el campo.
- **Reintento.** Un retry ante error de red o 5xx, con timeout de 6s. Los 4xx no se
  reintentan: son errores de payload y el detalle queda en los logs con el `fbtrace_id`.
- **Privacidad.** El navegador manda el email/teléfono en claro a **tu propio** endpoint
  (HTTPS); el hasheo pasa en el server. A Meta nunca le llega nada sin hashear. Declaralo
  en tu política de privacidad.
