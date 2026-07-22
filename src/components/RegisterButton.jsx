import { useState } from 'react';
import { UserCheckIcon, CheckIcon } from './icons';
import { registerWithGoogle, preloadGoogle } from '../registerWithGoogle';

// Botón "Registrarse": abre el registro con Google (popup), verifica el token
// en el servidor y guarda el usuario real en Firestore. Sin popup propio.
export default function RegisterButton({ children = 'Registrarse', className = '', source = 'cta' }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done

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
      await registerWithGoogle(source);
      setStatus('done');
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
