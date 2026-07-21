import { useState } from 'react';
import { UserCheckIcon, CheckIcon } from './icons';
import { registerLead } from '../registerLead';

// Botón "Registrarse": guarda un lead directo (sin popup) y dispara la
// conversión Lead de Meta. Muestra confirmación en el propio botón.
export default function RegisterButton({ children = 'Registrarse', className = '', source = 'cta' }) {
  const [status, setStatus] = useState('idle'); // idle | loading | done

  const onClick = async () => {
    if (status !== 'idle') return;
    setStatus('loading');
    try {
      await registerLead(source);
    } catch {
      /* noop: no bloqueamos la confirmación */
    }
    setStatus('done');
  };

  return (
    <button
      type="button"
      className={`btn btn-wa ${className}`}
      onClick={onClick}
      disabled={status !== 'idle'}
    >
      {status === 'done' ? (
        <><CheckIcon /> ¡Registrado!</>
      ) : status === 'loading' ? (
        'Enviando…'
      ) : (
        <><UserCheckIcon /> {children}</>
      )}
    </button>
  );
}
