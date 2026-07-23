import { useEffect, useState } from 'react';
import { UserCheckIcon, CheckIcon } from './icons';
import { registerWithGoogle, preloadGoogle, logFailedLead, REGISTERED_EVENT } from '../registerWithGoogle';
import { useT } from '../i18n/core';

// Botón "Registrarse": abre el registro con Google (popup, con fallback a
// redirect si el navegador bloquea el popup), verifica el token en el
// servidor y guarda el usuario real en Firestore.
export default function RegisterButton({ children, className = '', source = 'cta' }) {
  const t = useT();
  const [status, setStatus] = useState('idle'); // idle | loading | done

  // El registro puede completarse recién al volver de signInWithRedirect,
  // en cuyo caso lo dispara App vía completeRedirectSignIn(), no este botón.
  useEffect(() => {
    const onRegistered = () => setStatus('done');
    window.addEventListener(REGISTERED_EVENT, onRegistered);
    return () => window.removeEventListener(REGISTERED_EVENT, onRegistered);
  }, []);

  // Precarga Firebase al mostrar intención → el popup abre sin trabas.
  const onIntent = () => {
    preloadGoogle().catch(() => {});
  };

  const onClick = async () => {
    if (status !== 'idle') return;

    setStatus('loading');
    try {
      // Éxito → el lead viaja a `leads` (+ evento Meta Lead) vía finishSignIn.
      const result = await registerWithGoogle(source);
      // Si result es null, estamos siendo redirigidos a Google: la página
      // está navegando, así que se queda en "loading" hasta que se vaya.
      if (result) setStatus('done');
    } catch (err) {
      // Empezó el registro y no lo terminó por CUALQUIER motivo (precarga,
      // popup cerrado/cancelado, dominio no autorizado, etc.) → failedLeads.
      logFailedLead(source, err);
      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      className={`btn btn-wa ${className}`}
      onClick={onClick}
      onMouseEnter={onIntent}
      onFocus={onIntent}
      onPointerDown={onIntent}
      disabled={status !== 'idle'}
    >
      {status === 'done' ? (
        <><CheckIcon /> {t.register.done}</>
      ) : status === 'loading' ? (
        t.register.opening
      ) : (
        <><UserCheckIcon /> {children || t.register.cta}</>
      )}
    </button>
  );
}
