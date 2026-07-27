// FUENTE de scrolls. Escucha el scroll, AGRUPA el gesto hasta que termina (debounce
// de 150ms) y emite el gesto {delta, ts} a los suscriptores. No sabe nada de las
// métricas: solo produce la señal cruda. El tratamiento ad-hoc lo hace cada métrica.

import { ScrollGesture } from "../types";

const IDLE_MS = 150; // pausa que da por terminado el gesto
const MIN_PX = 4; // piso de ruido: por debajo no es un gesto real

const subscribers = new Set<(g: ScrollGesture) => void>();
let gestureStartY: number | null = null;
let lastY = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let running = false;

function onScroll(): void {
  const y = window.scrollY;
  if (gestureStartY === null) gestureStartY = lastY;
  lastY = y;
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(emitGesture, IDLE_MS);
}

function emitGesture(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  if (gestureStartY === null) return;
  const delta = Math.abs(lastY - gestureStartY);
  gestureStartY = null;
  if (delta < MIN_PX) return;
  const gesture: ScrollGesture = { delta, ts: Date.now() };
  subscribers.forEach((cb) => cb(gesture));
}

// Suscribe una métrica a los gestos. Devuelve la función para desuscribirse.
export function onGesture(cb: (g: ScrollGesture) => void): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

// Cierra el gesto en curso (antes de un flush/cierre) para no perder el último.
export function endPendingGesture(): void {
  emitGesture();
}

export function startScroll(): void {
  if (running || typeof window === "undefined") return;
  running = true;
  lastY = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
}

export function stopScroll(): void {
  if (!running) return;
  running = false;
  window.removeEventListener("scroll", onScroll);
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = null;
  gestureStartY = null;
}
