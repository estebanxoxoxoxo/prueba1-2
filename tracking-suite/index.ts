// Superficie pública de la suite (lado navegador).
export {
  handleEvent as pushEvent,
  sendFbBrowserEvent,
  sendFbServerEvent,
} from "./handleEvent";
export type { PushOptions } from "./handleEvent";
export { FbEvent, OwnEvent } from "./types";
export type { EventKey, EventValue, SessionEvents } from "./types";
export { TrackingProvider, useTracking } from "./TrackingProvider";
export { readTrackingParams } from "./utils/readUrlParams";
export type { TrackingParams } from "./utils/readUrlParams";
export { getFbp, getFbc, getCookie } from "./utils";
