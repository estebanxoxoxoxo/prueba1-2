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
  const idToken = await user.getIdToken();

  // El servidor verifica el token con el Admin SDK y guarda el lead real.
  await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, source }),
  });

  // Conversión Lead con email real (se hashea en el servidor → mejor matching).
  try {
    const eventId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {}, { eventID: eventId });
    }
    sendMetaEvent(MetaEvent.Lead, eventId, user.email || undefined).catch(() => {});
    if (typeof window !== 'undefined' && typeof window.hj === 'function') {
      window.hj('event', 'lead_register');
    }
  } catch {
    /* noop */
  }

  registered = { email: user.email, name: user.displayName };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REGISTERED_EVENT, { detail: registered }));
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
