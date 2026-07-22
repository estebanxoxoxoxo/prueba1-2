import { useEffect, useState } from 'react';
import { UserCheckIcon, CheckIcon } from './icons';
import { registerWithGoogle, preloadGoogle, REGISTERED_EVENT } from '../registerWithGoogle';

// Botón "Registrarse": abre el registro con Google (popup, con fallback a
// redirect si el navegador bloquea el popup), verifica el token en el
// servidor y guarda el usuario real en Firestore.
export default function RegisterButton({ children = 'Registrarse', className = '', source = 'cta' }) {
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

    // LO PRIMERO al hacer click: mandar el lead a la DB. Fire-and-forget: no
    // esperamos la respuesta ni dependemos de Google, así queda registrado
    // aunque el popup falle o se cancele.
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    }).catch(() => {});

    setStatus('loading');
    try {
      const result = await registerWithGoogle(source);
      // Si result es null, estamos siendo redirigidos a Google: la página
      // está navegando, así que se queda en "loading" hasta que se vaya.
      if (result) setStatus('done');
    } catch {
      // Popup cerrado/cancelado o error → volver a permitir el intento.
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
        <><CheckIcon /> ¡Registrado!</>
      ) : status === 'loading' ? (
        'Abriendo Google…'
      ) : (
        <><UserCheckIcon /> {children}</>
      )}
    </button>
  );
}
