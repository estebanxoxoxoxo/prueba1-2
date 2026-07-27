// Toda la ORQUESTACIÓN de la sesión en un fichero: el agregado incremental, el armado
// del payload, y el contexto/Provider que arranca las fuentes + detectores y flushea.
// Las señales crudas (session/sources/) y los detectores (session/detectors/) viven
// aparte; acá se cablean.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { readTrackingParams, TrackingParams } from "./utils/readUrlParams";
import {
  startScroll,
  stopScroll,
  onGesture,
  endPendingGesture,
} from "./session/sources/scrollSource";
import {
  startSeconds,
  stopSeconds,
  getSeconds,
} from "./session/sources/secondsSource";
import { DETECTORS } from "./session/detectors";
import { SessionSources } from "./session/types";
import { EventKey, EventValue, OwnEvent } from "./events";
import { newId, postBeacon, getFbp, getFbc } from "./utils";

// ---------- Agregado: el payload que crece incremental ----------
// Cada evento (fb vía pushEvent, o propio vía un detector) reporta acá.
let aggregate: Record<string, EventValue> = {};

// Reporta un evento a la raíz del doc:
//   - sin `value` → contador (+1): fb events, commonScroll, masiveScroll, readerScroll.
//   - con `value` → lo setea: secondsToInitialScroll (segundos), seconds (duración).
// eslint-disable-next-line react-refresh/only-export-components
export function report(key: EventKey, value?: EventValue): void {
  if (value === undefined) {
    const current = aggregate[key];
    aggregate[key] = (typeof current === "number" ? current : 0) + 1;
  } else {
    aggregate[key] = value;
  }
}

// ---------- Snapshot: payload final (datos fijos + agregado) ----------
function buildPayload(
  sessionId: string,
  params: TrackingParams,
  startedAt: number
): Record<string, unknown> {
  return {
    sessionId,
    campaign: params.campaign,
    variant: params.variant,
    heroVariant: params.heroVariant,
    sessionStart: startedAt,
    sessionEnd: Date.now(),
    fbp: getFbp(),
    fbc: getFbc(),
    ...aggregate,
  };
}

// ---------- Contexto ----------
const DEFAULTS: TrackingParams = {
  campaign: "default",
  variant: "default",
  heroVariant: "default",
};

const TrackingContext = createContext<TrackingParams>(DEFAULTS);

// Lo consume cualquier componente para leer campaign/variant/heroVariant.
// eslint-disable-next-line react-refresh/only-export-components
export function useTracking(): TrackingParams {
  return useContext(TrackingContext);
}

// ---------- Provider ----------
export function TrackingProvider({ children }: { children: ReactNode }) {
  // La URL inicial se lee UNA vez al montar y queda fija en el contexto.
  const [params] = useState<TrackingParams>(() => readTrackingParams());

  // Fuente 1: cuenta segundos activos de sesión.
  useEffect(() => {
    startSeconds();
    return () => stopSeconds();
  }, []);

  // Fuente 2: agrupa el gesto de scroll (debounce 150ms) y lo emite.
  useEffect(() => {
    startScroll();
    return () => stopScroll();
  }, []);

  // Detectores + flush. Se les inyecta `report` en las fuentes: cada detector reporta
  // su evento al agregado. En el cleanup (o al ocultarse/cerrarse la pestaña) se setea
  // `seconds`, se arma el payload con el agregado y se manda a la DB.
  useEffect(() => {
    const sources: SessionSources = {
      onGesture,
      getSeconds,
      report,
      get: (key) => aggregate[key],
    };
    const sessionId = newId();
    const startedAt = Date.now();
    DETECTORS.forEach((d) => d.start(sources));

    const flush = () => {
      endPendingGesture(); // cierra el gesto en curso para no perder el último
      report(OwnEvent.Seconds, getSeconds()); // segundos actuales → agregado
      DETECTORS.forEach((d) => d.flush?.()); // clasificaciones al cierre (activeSession, ...)
      postBeacon("/api/session", buildPayload(sessionId, params, startedAt));
    };
    // Ocultarse es el momento más confiable en mobile para mandar el snapshot.
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      flush(); // respaldo del desmontaje
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      DETECTORS.forEach((d) => d.stop());
    };
  }, [params]);

  return (
    <TrackingContext.Provider value={params}>{children}</TrackingContext.Provider>
  );
}
