// Taxonomía de eventos de la suite. Todos los eventos —los de Facebook y los
// propios— se guardan como campos en la RAÍZ del doc de sesión (no en un array),
// tratados igual.

// Eventos de Facebook (Pixel + Conversions API): los dispara pushEvent.
export enum FbEvent {
  PageView = "PageView",
  ViewContent = "ViewContent",
  Search = "Search",
  Lead = "Lead",
  InitiateRegistration = "InitiateRegistration",
  CompleteRegistration = "CompleteRegistration",
  Contact = "Contact",
  InitiateCheckout = "InitiateCheckout",
  AddToCart = "AddToCart",
  AddPaymentInfo = "AddPaymentInfo",
  StartTrial = "StartTrial",
  Subscribe = "Subscribe",
  Purchase = "Purchase",
}

// Eventos propios (métricas de sesión): los produce el tracking de scroll/tiempo.
export enum OwnEvent {
  CommonScroll = "commonScroll",
  MasiveScroll = "masiveScroll",
  SecondsToInitialScroll = "secondsToInitialScroll",
  ReaderScroll = "readerScroll",
  Seconds = "seconds",
  // Clasificaciones de sesión (se evalúan al cierre, en sus detectores).
  ActiveSession = "activeSession",
  RelevantSession = "relevantSession",
}

// Nuclea ambos: la key de CUALQUIER evento que va a la raíz del doc de sesión.
export type EventKey = FbEvent | OwnEvent;

// Valor de un evento en el doc: contador (fb / scrolls), booleano (readerScroll) o
// null (secondsToInitialScroll sin datos).
export type EventValue = number | boolean | null;

// La sección de eventos del doc: la DB acepta cualquier EventKey en la raíz.
export type SessionEvents = Partial<Record<EventKey, EventValue>>;

// Todas las keys conocidas (para whitelistear en el server).
export const EVENT_KEYS: EventKey[] = [
  ...Object.values(FbEvent),
  ...Object.values(OwnEvent),
];
