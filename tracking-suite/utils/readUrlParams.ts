// Lee campaign / variant / heroVariant de la URL inicial.
//
//   - `campaign`  → define el nombre de la colección de logs: log-[campaign].
//   - `variant` / `heroVariant` → propiedades del log. Si no llegan → "default".
//
// SIN browser storage: el valor se lee una sola vez y se sostiene en el contexto
// de React (TrackingProvider) y en el estado de sesión (memoria) hasta el flush
// del cleanup. La sanitización del campaign para el nombre de colección se hace
// en el server.

const DEFAULT = "default";

function readParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get(name);
  return v && v.trim() ? v.trim() : null;
}

export interface TrackingParams {
  campaign: string;
  variant: string;
  heroVariant: string;
}

export function readTrackingParams(): TrackingParams {
  return {
    campaign: readParam("campaign") || DEFAULT,
    variant: readParam("variant") || DEFAULT,
    heroVariant: readParam("heroVariant") || DEFAULT,
  };
}
