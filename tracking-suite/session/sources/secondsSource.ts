// FUENTE de segundos. Cuenta segundos ACTIVOS de sesión, pausando cuando la pestaña
// no está visible. No sabe de métricas: solo expone getSeconds().

let activeMs = 0; // tiempo activo acumulado (ms)
let lastResume = 0; // inicio del tramo visible en curso
let visible = true;
let running = false;

function onVisibility(): void {
  const nowVisible = document.visibilityState === "visible";
  if (nowVisible === visible) return;
  if (nowVisible) {
    visible = true;
    lastResume = Date.now();
  } else {
    activeMs += Date.now() - lastResume;
    visible = false;
  }
}

export function startSeconds(): void {
  if (running || typeof window === "undefined") return;
  running = true;
  activeMs = 0;
  lastResume = Date.now();
  visible =
    typeof document === "undefined" || document.visibilityState === "visible";
  document.addEventListener("visibilitychange", onVisibility);
}

export function getSeconds(): number {
  let ms = activeMs;
  if (visible) ms += Date.now() - lastResume;
  return Math.round(ms / 1000);
}

export function stopSeconds(): void {
  if (!running) return;
  running = false;
  document.removeEventListener("visibilitychange", onVisibility);
}
