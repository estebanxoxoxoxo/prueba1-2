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

// Realtime Database donde la suite publica la presencia en vivo (un nodo por
// pestaña abierta bajo /activeSessions, que otra app lee para el panel de
// "visitantes ahora"). La URL es pública, igual que el writeKey. Vacío = el
// pusher no arranca.
// 2026-08-12: apunta a la plataforma nueva (proyecto sessions-ingest); la
// vieja (data-analyzer-1c0fe) queda para retirar con el resto de AWS.
export const ACTIVE_SESSIONS_DB = 'https://sessions-ingest-default-rtdb.firebaseio.com';

// Marca
export const BRAND = {
  name: 'Smarty',
  tagline: 'Todo lo bueno de internet, nada de lo malo',
};
