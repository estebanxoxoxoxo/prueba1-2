import { sendMetaEvent } from './metaEventSender';
import { MetaEvent } from './metaEventsTypes';

// Carga diferida: Firebase (SDK + config) solo se baja cuando el usuario
// muestra intención (hover/tap del botón), no en cada visita.
let googleReady = null;
let registered = null; // { email, name } una vez completado

export const REGISTERED_EVENT = 'smarty:google-registered';
const REDIRECT_SOURCE_KEY = 'smarty_google_redirect_source';

// Códigos para los que tiene sentido reintentar con signInWithRedirect: el
// popup no llegó a abrirse (el navegador lo bloqueó porque hubo una espera de
// red entre el click y el intento de abrirlo, algo mucho más común en
// producción que en local) o directamente no está soportado en ese entorno.
const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
]);

// ---- Tracking del intento: capturar "empezó y no terminó" aunque cierren la
// pestaña. Un mismo `attemptId` se upsertea en failedLeads (started → motivo
// real) y /api/register lo borra si el registro completa. ----
let currentAttemptId = null;
const ATTEMPT_KEY = 'smarty_register_attempt';

function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function getAttemptId() {
  if (currentAttemptId) return currentAttemptId;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage.getItem(ATTEMPT_KEY) || null;
  }
  return null;
}
function clearAttempt() {
  currentAttemptId = null;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem(ATTEMPT_KEY);
  }
}
function postFailedLead(body, keepalive) {
  if (typeof fetch !== 'function') return;
  fetch('/api/failed-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: !!keepalive,
  }).catch(() => {});
}

// Apenas se toca "Registrarse":
//   1) Dispara la conversión Meta Lead (browser fbq + servidor/CAPI, mismo
//      eventID = attemptId → dedup). SIN datos de Google a propósito: la
//      estrategia es captar a TODOS los que tocan el botón.
//   2) Crea el failedLead con reason "started" (keepalive → llega aunque
//      cierren la pestaña). Se borra si completa; se actualiza si falla.
export function startRegisterAttempt(source = 'cta') {
  const attemptId = newId();
  currentAttemptId = attemptId;
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(ATTEMPT_KEY, attemptId);
  }

  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {}, { eventID: attemptId });
    }
    sendMetaEvent(MetaEvent.Lead, attemptId).catch(() => {});
    if (typeof window !== 'undefined' && typeof window.hj === 'function') {
      window.hj('event', 'lead_click');
    }
  } catch {
    /* noop */
  }

  postFailedLead({ attemptId, source, reason: 'started' }, true);
  return attemptId;
}

// Actualiza el failedLead del intento actual con el motivo real del error.
export function logFailedLead(source, err) {
  postFailedLead({
    attemptId: getAttemptId() || undefined,
    source,
    reason: err?.code || 'unknown',
    message: err?.message || null,
    email: err?.email || null,
  });
}

export function preloadGoogle() {
  if (!googleReady) {
    googleReady = (async () => {
      // cache: 'no-store' para no arrastrar una respuesta vieja que haya
      // quedado guardada en el navegador de antes de que este endpoint
      // mandara Cache-Control: no-store (esa respuesta vieja podía traer la
      // apiKey con comillas/coma pegadas y romper el login).
      const res = await fetch('/api/firebase-config', { cache: 'no-store' });
      if (!res.ok) throw new Error('config_failed');
      const config = await res.json();
      const [{ initializeApp, getApps }, authMod] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
      ]);
      const app = getApps().length ? getApps()[0] : initializeApp(config);
      return {
        auth: authMod.getAuth(app),
        GoogleAuthProvider: authMod.GoogleAuthProvider,
        signInWithPopup: authMod.signInWithPopup,
        signInWithRedirect: authMod.signInWithRedirect,
        getRedirectResult: authMod.getRedirectResult,
      };
    })().catch((e) => {
      googleReady = null; // permite reintentar si falló la precarga
      throw e;
    });
  }
  return googleReady;
}

async function finishSignIn(user, source) {
  // Autenticó con Google → para el usuario, el registro YA fue exitoso.
  // Mostramos el modal de éxito de una, sin depender del guardado en el server.
  registered = { email: user.email, name: user.displayName };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REGISTERED_EVENT, { detail: registered }));
  }

  // La conversión Meta Lead ya se disparó en el CLICK (startRegisterAttempt),
  // para captar a todos. Acá el registro completó: solo marcamos el funnel.
  if (typeof window !== 'undefined' && typeof window.hj === 'function') {
    window.hj('event', 'lead_register_complete');
  }

  // Persistencia en el server. El servidor intenta verificar el token con el
  // Admin SDK; si esa verificación falla, igual guarda el lead con estos datos
  // (el usuario ya está autenticado por Google acá). Solo cae a failedLeads si
  // el server realmente se cae (500) al escribir en la DB.
  try {
    const idToken = await user.getIdToken();
    const reg = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken,
        source,
        attemptId: getAttemptId(),
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        picture: user.photoURL,
      }),
    });
    if (!reg.ok) {
      const detail = await reg.text().catch(() => '');
      logFailedLead(source, {
        code: 'register/verify-failed',
        message: `HTTP ${reg.status} ${detail}`.slice(0, 300),
        email: user.email || null,
      });
    } else {
      // Completó → el server ya borró el intento de failedLeads; limpiamos acá.
      clearAttempt();
    }
  } catch (err) {
    logFailedLead(source, {
      code: 'register/network-error',
      message: err?.message || null,
      email: user.email || null,
    });
  }

  return registered;
}

export async function registerWithGoogle(source = 'cta') {
  if (registered) return registered;

  const { auth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await preloadGoogle();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  // Abre el popup de Google (lanza si el usuario lo cierra/cancela).
  let result;
  try {
    result = await signInWithPopup(auth, provider);
  } catch (err) {
    // Deja el código real visible para diagnosticar (auth/unauthorized-domain,
    // auth/popup-closed-by-user, etc.). Mirá la consola del navegador.
    // eslint-disable-next-line no-console
    console.error('[Registro Google] signInWithPopup falló →', err?.code, '—', err?.message);
    if (typeof window !== 'undefined') window.__googleAuthError = err;

    if (POPUP_FALLBACK_CODES.has(err?.code)) {
      // El popup no se abrió: seguimos con signInWithRedirect, que navega la
      // página entera y no depende de que el navegador reconozca el click.
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(REDIRECT_SOURCE_KEY, source);
      }
      await signInWithRedirect(auth, provider);
      return null; // la página está navegando a Google, no hay más que hacer acá
    }
    // Popup cerrado/cancelado, dominio no autorizado, etc. → no completó.
    // El log a failedLeads lo hace el caller (RegisterButton) para cubrir
    // CUALQUIER error del flujo, incluida la precarga de Firebase.
    throw err;
  }

  return finishSignIn(result.user, source);
}

// Se llama una vez al cargar la app para completar el registro si venimos de
// vuelta de un signInWithRedirect (fallback de arriba).
export async function completeRedirectSignIn() {
  if (registered) return registered;

  let auth, getRedirectResult;
  try {
    ({ auth, getRedirectResult } = await preloadGoogle());
  } catch {
    return null;
  }

  let result;
  try {
    result = await getRedirectResult(auth);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[Registro Google] getRedirectResult falló →', err?.code, '—', err?.message);
    if (typeof window !== 'undefined') window.__googleAuthError = err;
    const src =
      (typeof window !== 'undefined' && window.sessionStorage?.getItem(REDIRECT_SOURCE_KEY)) || 'cta';
    logFailedLead(src, err);
    return null;
  }
  if (!result?.user) return null;

  const source =
    (typeof window !== 'undefined' && window.sessionStorage?.getItem(REDIRECT_SOURCE_KEY)) ||
    'cta';
  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.removeItem(REDIRECT_SOURCE_KEY);
  }
  return finishSignIn(result.user, source);
}
