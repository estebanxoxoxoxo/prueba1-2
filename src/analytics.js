// Analytics propio: SDK de RudderStack apuntando a NUESTRO pipeline
// (Vector en EC2 → S3 raw/bronze), no a RudderStack Cloud. Las decisiones
// no negociables del pipeline:
//   - batch obligatorio: el ingestador solo implementa POST /v1/batch
//   - sin beacon, sin autoTrack de sesiones; page() se llama manualmente acá
//   - dataplane y sourceConfig same-origin: /v1/batch y /sourceConfig los
//     sirve el propio dominio (proxy de Vite en dev/preview, rewrites de
//     vercel.json en prod) → sin CORS, sin mixed content y menos ad-blockers
// El SDK se carga con import dinámico en idle para no pesar en el LCP; lo
// que se trackee antes de eso queda en cola y sale al cargar.

import { ANALYTICS_WRITE_KEY } from './config';

let sdk = null; // instancia viva una vez cargado el SDK
let pending = []; // [método, args] encolados antes de la carga
let started = false;

async function loadSdk() {
  try {
    const { RudderAnalytics } = await import('@rudderstack/analytics-js');
    const origin = window.location.origin;
    const a = new RudderAnalytics();
    a.load(ANALYTICS_WRITE_KEY, origin, {
      configUrl: origin, // /sourceConfig lo servimos nosotros, no api.rudderstack.com
      queueOptions: { batch: { enabled: true, flushInterval: 3000 } },
      useBeacon: false,
      polyfillIfRequired: false,
      sessions: { autoTrack: false },
      sendAdblockPage: false,
    });
    a.page(); // page() manual: un pageview por carga de la landing
    sdk = a;
    const calls = pending;
    pending = [];
    calls.forEach(([method, args]) => {
      try {
        sdk[method](...args);
      } catch {
        /* el tracking nunca rompe la página */
      }
    });
  } catch {
    /* SDK bloqueado o sin red: la página sigue como si nada */
  }
}

// Idempotente (StrictMode monta dos veces en dev).
export function initAnalytics() {
  if (started || typeof window === 'undefined') return;
  started = true;
  // El timeout es obligatorio: con animaciones corriendo (el demo del teléfono
  // loopea siempre) el navegador puede no reportar idle nunca.
  const idle = window.requestIdleCallback
    ? (fn) => window.requestIdleCallback(fn, { timeout: 3000 })
    : (fn) => setTimeout(fn, 1500);
  idle(() => loadSdk());
}

// Usable desde cualquier lado sin importar si el SDK ya cargó.
export function track(event, properties) {
  if (sdk) {
    try {
      sdk.track(event, properties);
    } catch {
      /* noop */
    }
  } else {
    pending.push(['track', [event, properties]]);
  }
}
