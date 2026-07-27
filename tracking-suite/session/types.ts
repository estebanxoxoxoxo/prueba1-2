// Contratos de la sesión.

import { EventKey, EventValue } from "../types";

// Señal cruda de un gesto de scroll (ya agrupado con debounce de 150ms).
export interface ScrollGesture {
  delta: number; // px absolutos del gesto (|scrollY final - inicial|)
  ts: number; // epoch ms del fin del gesto
}

// Lo que el contexto EXPONE a los detectores: la señal de scroll, el reloj de segundos,
// `report` para mandar su evento al agregado y `get` para leer el agregado actual.
export interface SessionSources {
  onGesture(cb: (g: ScrollGesture) => void): () => void; // suscribirse a gestos → unsubscribe
  getSeconds(): number; // segundos activos de sesión hasta ahora
  report(key: EventKey, value?: EventValue): void; // reporta un evento al agregado
  get(key: EventKey): EventValue | undefined; // lee el valor actual de un evento
}

// Un detector: se suscribe a la señal y, cuando SU evento se dispara, lo manda con
// sources.report(...). No acumula (el agregado lo maneja el contexto). Los one-shot
// (readerScroll, secondsToInitialScroll) mueren al detectar. `flush` es opcional: una
// evaluación al cierre para clasificaciones que dependen de los totales (activeSession).
export interface Detector {
  start(sources: SessionSources): void; // se suscribe a las fuentes
  stop(): void; // se desuscribe
  flush?(): void; // opcional: evaluación al cierre de la sesión
}
