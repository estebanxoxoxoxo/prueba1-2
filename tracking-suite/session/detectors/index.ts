import { Detector } from "../types";
import { commonScroll } from "./commonScroll";
import { masiveScroll } from "./masiveScroll";
import { secondsToInitialScroll } from "./secondsToInitialScroll";
import { readerScroll } from "./readerScroll";
import { activeSession } from "./activeSession";
import { relevantSession } from "./relevantSession";

// Detectores: cada uno detecta su evento y lo REPORTA al agregado (vía sources.report).
// Los de scroll reportan por gesto; los one-shot mueren al detectar; activeSession y
// relevantSession se evalúan al cierre (flush). Sumar uno = crear su archivo y agregarlo acá.
export const DETECTORS: Detector[] = [
  commonScroll,
  masiveScroll,
  secondsToInitialScroll,
  readerScroll,
  activeSession,
  relevantSession,
];
