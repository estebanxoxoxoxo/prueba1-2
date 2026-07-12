# Smarty — Landing page

Landing page (solo Home) para **Smarty**, la app donde los niños disfrutan
imágenes, contenido y videos **100% moderados**. _Todo lo bueno de internet,
nada de lo malo._

Hecha con **React + Vite**.

## 🚀 Desarrollo

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en /dist
npm run preview  # previsualiza el build
```

## ⚙️ Configuración (lo que tienes que cambiar)

### 1. Número de WhatsApp

Ya está puesto `+34 687 080 377`. Para cambiarlo edita
[`src/config.js`](src/config.js):

```js
export const WHATSAPP_NUMBER = '34687080377'; // sin "+" ni espacios
export const WHATSAPP_MESSAGE = '¡Hola! Quiero más información sobre Smarty...';
```

Todos los botones de WhatsApp (navbar, hero, CTA final y botón flotante) usan
esta configuración y abren un chat con el mensaje pre-cargado.

### 2. Hotjar

En [`index.html`](index.html) busca el bloque **Hotjar Tracking Code** y cambia
el `0` por tu **Site ID** real:

```js
window.HOTJAR_ID = 0; // 👈 pon aquí tu Hotjar Site ID
```

Mientras el ID sea `0`, Hotjar no se carga (así no da errores en desarrollo).
Los clics de WhatsApp ya se envían a Hotjar como eventos
(`whatsapp_click`, `whatsapp_click_float`).

## 📁 Estructura

```
index.html                 # meta tags, fuente Nunito, snippet de Hotjar
public/owl.svg             # favicon (búho Smarty)
src/
  config.js                # WhatsApp + marca (edítalo aquí)
  index.css                # sistema de diseño y estilos
  App.jsx                  # composición de la Home
  components/
    Owl.jsx                # mascota búho (SVG)
    icons.jsx              # iconos SVG
    WhatsAppButton.jsx     # botón y botón flotante de WhatsApp
```

## 🎨 Secciones

Navbar · Hero · El problema · La solución (features) · Cómo funciona ·
Banda de confianza · CTA final · Footer · Botón flotante de WhatsApp.
