// Todo el tracking de sesión en un solo lugar y en React: un useEffect que cuenta
// gestos de scroll (debounce 150ms) y segundos, mini-lógicas que en cada actualización
// suman los scrolls por tipo y disparan activeSession/relevantSession, y al cerrar manda
// el doc a la DB. Las métricas son estado de React.

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { readTrackingParams, TrackingParams } from "./utils/readUrlParams";
import { FbEvent } from "./types";
import { newId, postBeacon, getFbp, getFbc } from "./utils";

// ---------- Eventos de Facebook: contador de módulo ----------
// pushEvent los dispara de forma imperativa desde cualquier lado (incluso
// registerWithGoogle, que no es React, y a veces antes de que monte el Provider) → un
// contador simple siempre disponible. Se mergean al doc en el flush.
const fbEvents: Record<string, number> = {};
// eslint-disable-next-line react-refresh/only-export-components
export function plusEventFrecuency(event: FbEvent): void {
  fbEvents[event] = (fbEvents[event] || 0) + 1;
}

// ---------- Contexto (campaign / variant / heroVariant de la URL) ----------
const DEFAULTS: TrackingParams = {
  campaign: "default",
  variant: "default",
  heroVariant: "default",
};
const TrackingContext = createContext<TrackingParams>(DEFAULTS);
// eslint-disable-next-line react-refresh/only-export-components
export function useTracking(): TrackingParams {
  return useContext(TrackingContext);
}

// ---------- Métricas de la sesión (todo estado de React) ----------
interface Metrics {
  seconds: number;
  commonScroll: number; // scrolls < 2000px
  masiveScroll: number; // scrolls > 2000px
  secondsToInitialScroll: number | null; // segundos hasta el 1er scroll > 500px
  readerScroll: boolean; // 3 scrolls < 300px en 60s
  activeSession: boolean; // seconds >= 5 && commonScroll >= 1
  relevantSession: boolean; // seconds > 30 && commonScroll > 8
}
const INITIAL: Metrics = {
  seconds: 0,
  commonScroll: 0,
  masiveScroll: 0,
  secondsToInitialScroll: null,
  readerScroll: false,
  activeSession: false,
  relevantSession: false,
};

// Recalcula las clasificaciones a partir de los valores actuales.
function classify(m: Metrics): Metrics {
  return {
    ...m,
    activeSession: m.seconds >= 5 && m.commonScroll >= 1,
    relevantSession: m.seconds > 30 && m.commonScroll > 8,
  };
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [params] = useState<TrackingParams>(() => readTrackingParams());
  const [metrics, setMetrics] = useState<Metrics>(INITIAL);

  // Espejo para leer las métricas al cierre sin closure viejo.
  const latest = useRef(metrics);
  latest.current = metrics;

  useEffect(() => {
    const sessionId = newId();
    const startedAt = Date.now();
    const smallScrolls: number[] = []; // timestamps de scrolls < 300px (para readerScroll)

    // mini-lógica: un gesto de scroll (delta en px)
    const onGesture = (delta: number) => {
      setMetrics((m) => {
        const next = { ...m };
        if (delta >= 300 && delta < 2000) next.commonScroll += 1;
        if (delta > 2000) next.masiveScroll += 1;
        if (delta > 500 && next.secondsToInitialScroll === null) {
          next.secondsToInitialScroll = next.seconds;
        }
        if (delta < 300) {
          const now = Date.now();
          smallScrolls.push(now);
          while (smallScrolls.length && smallScrolls[0] < now - 60000) {
            smallScrolls.shift();
          }
          if (smallScrolls.length >= 3) next.readerScroll = true;
        }
        return classify(next);
      });
    };

    // mini-lógica: pasó un segundo (solo cuenta con la pestaña visible)
    const onSecond = () => {
      if (document.visibilityState !== "visible") return;
      setMetrics((m) => classify({ ...m, seconds: m.seconds + 1 }));
    };

    // Scroll: agrupa el gesto con debounce de 150ms y llama onGesture(delta).
    let startY = window.scrollY;
    let lastY = startY;
    let inGesture = false;
    let idle: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (!inGesture) {
        startY = lastY;
        inGesture = true;
      }
      lastY = window.scrollY;
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => {
        inGesture = false;
        const delta = Math.abs(lastY - startY);
        if (delta >= 4) onGesture(delta);
      }, 150);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const timer = setInterval(onSecond, 1000);

    // flush: manda el doc (fijos + eventos fb + métricas) a la DB.
    const flush = () => {
      postBeacon("/api/set-session-in-db", {
        sessionId,
        campaign: params.campaign,
        variant: params.variant,
        heroVariant: params.heroVariant,
        ...fbEvents,
        ...latest.current,
        sessionStart: startedAt,
        sessionEnd: Date.now(),
        fbp: getFbp(),
        fbc: getFbc(),
      });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
      clearInterval(timer);
      if (idle) clearTimeout(idle);
      flush();
    };
  }, [params]);

  return (
    <TrackingContext.Provider value={params}>{children}</TrackingContext.Provider>
  );
}
