// ============================================================
//  Configuración central de la landing de Smarty
//  Cambia aquí los datos sin tocar el resto del código.
// ============================================================

// Número de WhatsApp en formato internacional SIN "+" ni espacios.
export const WHATSAPP_NUMBER = '34687080377';

// Mensaje que se autocompleta al abrir el chat.
export const WHATSAPP_MESSAGE =
  '¡Hola! Quiero más información sobre Smarty para mi hijo 🦉';

// Construye el enlace de WhatsApp (funciona en móvil y escritorio).
export const whatsappUrl = () =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

// Marca
export const BRAND = {
  name: 'Smarty',
  tagline: 'Todo lo bueno de internet, nada de lo malo',
};
