// ============================================================
//  Configuración central de la landing de Smarty
//  Cambia aquí los datos sin tocar el resto del código.
// ============================================================

// Número de WhatsApp en formato internacional SIN "+" ni espacios.
export const WHATSAPP_NUMBER = '34687080377';

// Mensaje que se autocompleta al abrir el chat.
export const WHATSAPP_MESSAGE =
  '¡Hola! Quiero acceso anticipado a Smarty para mi hijo/a 🦉';

// Construye el enlace de WhatsApp (funciona en móvil y escritorio).
export const whatsappUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// writeKey del pipeline de analytics propio (RudderStack → Vector → S3).
// Es público por naturaleza (viaja en el navegador); la validación fuerte
// pasa en el edge (Caddy) cuando haya dominio. Debe coincidir con el de
// public/sourceConfig.json y el que valide Caddy.
export const ANALYTICS_WRITE_KEY = 'LTlHrScEJw3Xe47zz4tw3NjWLjS';

// Marca
export const BRAND = {
  name: 'Smarty',
  tagline: 'Todo lo bueno de internet, nada de lo malo',
};
