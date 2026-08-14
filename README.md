# Smarty — Landing page

Landing page (solo Home) para **Smarty**, la app donde los niños disfrutan
imágenes, contenido y videos **100% moderados**. _Todo lo bueno de internet,
nada de lo malo._

Hecha con **React + Vite**.

## 🚀 Desarrollo

```bash
git submodule update --init --recursive   # trae events-suite (la analítica)
pnpm install     # instala dependencias
pnpm dev         # servidor de desarrollo (http://localhost:5173)
pnpm build       # build de producción en /dist
pnpm preview     # previsualiza el build
```

Al clonar de cero: `git clone --recurse-submodules <repo>` y te ahorrás el
primer comando.

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
index.html                 # meta tags, fuente Nunito, pixel de Meta, snippet de Hotjar
public/owl.svg             # favicon (búho Smarty)
events-suite/              # SUBMÓDULO: la analítica, repo aparte
src/
  config.js                # WhatsApp + marca + writeKey de analytics (edítalo aquí)
  index.css                # sistema de diseño y estilos
  App.jsx                  # composición de la Home
  eventsSuiteMirror.tsx    # el único archivo que importa de events-suite
  components/
    Owl.jsx                # mascota búho (SVG)
    icons.jsx              # iconos SVG
    RegisterButton.tsx     # registro con Google
```

## 📈 Analítica

Vive en el submódulo [`events-suite/`](./events-suite) — repo propio, con su
README. Acá solo está **el espejo** (`src/eventsSuiteMirror.tsx`) y su uso: el
Provider en `main.jsx`, el `startDelivery` en `App.jsx` y los eventos de
negocio en los componentes. El cableado que la suite necesita del host es una
línea en `vite.config.js`; el resto está documentado en
`events-suite/host/README.md`.

## 🎨 Secciones

Navbar · Hero · El problema · La solución (features) · Cómo funciona ·
Banda de confianza · CTA final · Footer · Botón flotante de WhatsApp.
