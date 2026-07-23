import { useEffect, useState } from 'react';
import { UserCheckIcon, CheckIcon } from './icons';
import { registerWithGoogle, preloadGoogle, captureRegisterClick, REGISTERED_EVENT } from '../registerWithGoogle';
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

    // LO PRIMERO: capturar el click (evento Meta Lead + lead a la DB), pase lo
    // que pase con Google. Así no perdemos a quien toca Registrarse y no completa.
    captureRegisterClick(source);

    setStatus('loading');
    try {
      // Éxito → el lead viaja a `leads` con la info de Google (vía /api/register).
      const result = await registerWithGoogle(source);
      // Si result es null, estamos siendo redirigidos a Google: la página
      // está navegando, así que se queda en "loading" hasta que se vaya.
      if (result) setStatus('done');
    } catch {
      // No terminó el proceso → registerWithGoogle ya logueó a failedLeads.
      // Acá solo habilitamos otro intento.
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
