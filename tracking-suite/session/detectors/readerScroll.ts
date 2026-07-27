import { Detector } from "../types";
import { OwnEvent } from "../../events";

// readerScroll: cuando hay 3 scrolls < 300px dentro de una ventana de 60s (patrón de
// lectura), reporta el evento y MUERE. Si nunca pasa, no reporta (la key queda ausente).
const WINDOW_MS = 60_000;
const NEEDED = 3;
const SMALL_PX = 300;

let smallTimestamps: number[] = [];
let unsub: (() => void) | null = null;

function stop() {
  if (unsub) unsub();
  unsub = null;
}

export const readerScroll: Detector = {
  start(sources) {
    smallTimestamps = [];
    unsub = sources.onGesture((g) => {
      if (g.delta >= SMALL_PX) return;
      smallTimestamps.push(g.ts);
      // dejar solo los de la última ventana de 60s
      smallTimestamps = smallTimestamps.filter((t) => t >= g.ts - WINDOW_MS);
      if (smallTimestamps.length >= NEEDED) {
        sources.report(OwnEvent.ReaderScroll);
        stop(); // muere al detectar
      }
    });
  },
  stop,
};
