import { Detector } from "../types";
import { OwnEvent } from "../../events";

// secondsToInitialScroll: al PRIMER scroll > 500px reporta los segundos transcurridos
// y MUERE (se desuscribe). Si nunca pasa, no reporta nada (la key queda ausente).
let unsub: (() => void) | null = null;

function stop() {
  if (unsub) unsub();
  unsub = null;
}

export const secondsToInitialScroll: Detector = {
  start(sources) {
    unsub = sources.onGesture((g) => {
      if (g.delta <= 500) return;
      sources.report(OwnEvent.SecondsToInitialScroll, sources.getSeconds());
      stop(); // muere al detectar
    });
  },
  stop,
};
