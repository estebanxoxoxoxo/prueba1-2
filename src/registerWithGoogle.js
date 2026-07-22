import { sendMetaEvent } from './metaEventSender';
import { MetaEvent } from './metaEventsTypes';

// Carga diferida: Firebase (SDK + config) solo se baja cuando el usuario
// muestra intención (hover/tap del botón), no en cada visita.
let googleReady = null;
let registered = null; // { email, name } una vez completado

export function preloadGoogle() {
  if (!googleReady) {
    googleReady = (async () => {
      const res = await fetch('/api/firebase-config');
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
      };
    })().catch((e) => {
      googleReady = null; // permite reintentar si falló la precarga
      throw e;
    });
  }
  return googleReady;
}

export async function registerWithGoogle(source = 'cta') {
  if (registered) return registered;

  const { auth, GoogleAuthProvider, signInWithPopup } = await preloadGoogle();
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
    throw err;
  }
  const user = result.user;
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
  return registered;
}
