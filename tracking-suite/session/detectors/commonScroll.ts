import { Detector } from "../types";
import { OwnEvent } from "../../types";

// commonScroll: por cada gesto < 2000px reporta el evento; el contexto lo cuenta.
let unsub: (() => void) | null = null;

export const commonScroll: Detector = {
  start(sources) {
    unsub = sources.onGesture((g) => {
      if (g.delta < 2000) sources.report(OwnEvent.CommonScroll);
    });
  },
  stop() {
    if (unsub) unsub();
    unsub = null;
  },
};
