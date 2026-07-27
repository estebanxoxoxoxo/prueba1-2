import { Detector } from "../types";
import { OwnEvent } from "../../types";

// masiveScroll: por cada gesto > 2000px reporta el evento (fling/skim); el contexto lo cuenta.
let unsub: (() => void) | null = null;

export const masiveScroll: Detector = {
  start(sources) {
    unsub = sources.onGesture((g) => {
      if (g.delta > 2000) sources.report(OwnEvent.MasiveScroll);
    });
  },
  stop() {
    if (unsub) unsub();
    unsub = null;
  },
};
