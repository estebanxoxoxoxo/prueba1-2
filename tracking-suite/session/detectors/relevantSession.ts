import { Detector, SessionSources } from "../types";
import { OwnEvent } from "../../types";

// relevantSession: sesión relevante. Se evalúa AL CIERRE (flush) → true si hubo >8
// scrolls <2000px y >30s. Si no, no reporta (la key queda ausente = false).
const MIN_SECONDS = 30;
const MIN_COMMON = 8;

let src: SessionSources | null = null;

export const relevantSession: Detector = {
  start(sources) {
    src = sources;
  },
  flush() {
    if (!src) return;
    const common = src.get(OwnEvent.CommonScroll);
    const count = typeof common === "number" ? common : 0;
    if (src.getSeconds() > MIN_SECONDS && count > MIN_COMMON) {
      src.report(OwnEvent.RelevantSession, true);
    }
  },
  stop() {
    src = null;
  },
};
