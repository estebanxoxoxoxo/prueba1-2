import { Detector, SessionSources } from "../types";
import { OwnEvent } from "../../events";

// activeSession: sesión con actividad mínima. Se evalúa AL CIERRE (flush), cuando los
// segundos y el conteo de commonScroll ya son finales → true si hubo ≥1 scroll <2000px
// y ≥5s. Si no, no reporta (la key queda ausente = false).
const MIN_SECONDS = 5;
const MIN_COMMON = 1;

let src: SessionSources | null = null;

export const activeSession: Detector = {
  start(sources) {
    src = sources;
  },
  flush() {
    if (!src) return;
    const common = src.get(OwnEvent.CommonScroll);
    const count = typeof common === "number" ? common : 0;
    if (src.getSeconds() >= MIN_SECONDS && count >= MIN_COMMON) {
      src.report(OwnEvent.ActiveSession, true);
    }
  },
  stop() {
    src = null;
  },
};
