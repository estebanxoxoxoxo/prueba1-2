// Superficie pública de la suite (lado navegador).
export { pushEvent, sendFbBrowserEvent, sendFbServerEvent } from "./browserEvent";
export type { PushOptions } from "./browserEvent";
export { FbEvent, OwnEvent } from "./events";
export type { EventKey, EventValue, SessionEvents } from "./events";
export { TrackingProvider, useTracking } from "./session";
export { readTrackingParams } from "./utils/readUrlParams";
export type { TrackingParams } from "./utils/readUrlParams";
export { getFbp, getFbc, getCookie } from "./utils";
