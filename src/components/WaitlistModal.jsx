import { useEffect, useRef, useState } from 'react';
import Mascot from './Mascot';
import { XIcon, CheckIcon, BellIcon, ShieldFilledIcon } from './icons';
import { closeWaitlist, useWaitlistOpen } from '../waitlist';
import { sendMetaEvent } from '../metaEventSender';
import { MetaEvent } from '../metaEventsTypes';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistModal() {
  const open = useWaitlistOpen();
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === 'Escape') closeWaitlist(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reinicia el estado al cerrar (para la próxima apertura).
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { setStatus('idle'); setContact(''); setError(''); }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const value = contact.trim();

    // Si hay "@" lo tratamos como email y validamos; si no, es un número y no se valida.
    if (!value) {
      setError('Dejanos tu email o tu WhatsApp.');
      return;
    }
    if (value.includes('@') && !EMAIL_RE.test(value)) {
      setError('Ese email no parece válido.');
      return;
    }

    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: value }),
      });
      if (!res.ok) throw new Error('request_failed');
      setStatus('success');

      // Conversión: CompleteRegistration por navegador (pixel) y servidor (CAPI).
      // Mismo eventID en ambos → Meta deduplica.
      try {
        const eventId = crypto.randomUUID();
        if (typeof window.fbq === 'function') {
          window.fbq('track', 'CompleteRegistration', {}, { eventID: eventId });
        }
        // Pasamos el contacto: el server lo hashea (email/teléfono) para Advanced Matching.
        sendMetaEvent(MetaEvent.CompleteRegistration, eventId, value).catch(() => {});
        if (typeof window.hj === 'function') window.hj('event', 'waitlist_submit');
      } catch { /* noop */ }
    } catch {
      setStatus('error');
      setError('No pudimos guardar tus datos. Probá de nuevo en un momento.');
    }
  };

  return (
    <div className="wl-overlay" onClick={closeWaitlist} role="presentation">
      <div
        className="wl-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="wl-close" onClick={closeWaitlist} aria-label="Cerrar">
          <XIcon />
        </button>

        {status === 'success' ? (
          <div className="wl-success">
            <span className="wl-check"><CheckIcon /></span>
            <h3>¡Listo! Ya estás en la lista 🦉</h3>
            <p>
              Te avisamos a <b>{contact.trim()}</b> apenas Smarty esté
              disponible. Sin spam, prometido.
            </p>
            <button type="button" className="btn btn-ghost wl-block" onClick={closeWaitlist}>
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <Mascot className="wl-owl" />
            <h3 id="wl-title">Te avisamos cuando Smarty esté listo</h3>
            <p className="wl-sub">
              Dejanos tu <b>email</b> o tu <b>WhatsApp</b> y sé de los primeros
              en probarlo.
            </p>
            <form className="wl-form" onSubmit={submit} noValidate>
              <input
                ref={inputRef}
                type="text"
                autoComplete="off"
                placeholder="Tu email o número de WhatsApp"
                value={contact}
                onChange={(e) => { setContact(e.target.value); setError(''); }}
                className={error ? 'err' : ''}
                aria-label="Tu email o número de WhatsApp"
              />
              <button type="submit" className="btn btn-wa wl-block" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando…' : <><BellIcon /> Avísame</>}
              </button>
            </form>
            {error && <p className="wl-error">{error}</p>}
            <p className="wl-fine">
              <ShieldFilledIcon /> Solo lo usamos para avisarte del lanzamiento.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
