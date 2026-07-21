import { BellIcon } from './icons';
import { openWaitlist } from '../waitlist';

// Botón principal: antes abría WhatsApp, ahora abre el popup de lista de espera.
export default function WhatsAppButton({ children = 'Quiero acceso anticipado', className = '' }) {
  return (
    <button type="button" className={`btn btn-wa ${className}`} onClick={openWaitlist}>
      <BellIcon />
      {children}
    </button>
  );
}

// Botón flotante fijo (esquina inferior derecha) → también abre el popup.
export function WhatsAppFloat() {
  return (
    <button
      type="button"
      className="wa-float"
      aria-label="Avísame cuando esté disponible"
      onClick={openWaitlist}
    >
      <span className="wa-pulse" aria-hidden="true" />
      <BellIcon />
      <span className="wa-label">Avísame</span>
    </button>
  );
}
