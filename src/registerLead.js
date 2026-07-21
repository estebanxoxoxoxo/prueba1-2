import { sendMetaEvent } from './metaEventSender';
import { MetaEvent } from './metaEventsTypes';

// Evita registrar dos veces en la misma visita (si se tocan varios botones).
let alreadyRegistered = false;

// Al tocar "Registrarse": dispara la conversión Lead en Meta (pixel del
// navegador + servidor/CAPI, mismo eventID → dedup) y guarda el lead en la
// colección "leads" de Firestore. Sin popup: es un registro directo.
export async function registerLead(source = 'cta') {
  if (alreadyRegistered) return;
  alreadyRegistered = true;

  const eventId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now());

  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {}, { eventID: eventId });
    }
    sendMetaEvent(MetaEvent.Lead, eventId).catch(() => {});
    if (typeof window !== 'undefined' && typeof window.hj === 'function') {
      window.hj('event', 'lead_register');
    }
  } catch {
    /* noop */
  }

  // El servidor lee país/IP/cookies (fbp, fbc) del request.
  await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source }),
  });
}
