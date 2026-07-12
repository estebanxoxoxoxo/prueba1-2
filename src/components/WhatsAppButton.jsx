import { whatsappUrl } from '../config';
import { WhatsAppIcon } from './icons';

// Botón de WhatsApp reutilizable.
export default function WhatsAppButton({ children = 'Contactar por WhatsApp', className = '' }) {
  const track = () => {
    // Registra el clic en Hotjar si está cargado.
    if (typeof window !== 'undefined' && typeof window.hj === 'function') {
      window.hj('event', 'whatsapp_click');
    }
  };

  return (
    <a
      className={`btn btn-wa ${className}`}
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

// Botón flotante fijo (esquina inferior derecha).
export function WhatsAppFloat() {
  const track = () => {
    if (typeof window !== 'undefined' && typeof window.hj === 'function') {
      window.hj('event', 'whatsapp_click_float');
    }
  };

  return (
    <a
      className="wa-float"
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      onClick={track}
    >
      <span className="wa-pulse" aria-hidden="true" />
      <WhatsAppIcon />
      <span className="wa-label">Escríbenos</span>
    </a>
  );
}
