// Todo el "evento de browser" en un solo fichero: el disparo del evento de Facebook
// desde el navegador, en sus dos patas (pixel + aviso a nuestro server), y el
// orquestador pushEvent que las compone y lo reporta al agregado de la sesión.

import { FbEvent } from "./types";
import { newId, postBeacon, getFbp, getFbc } from "./utils";
import { plusEventFrecuency } from "./TrackingProvider";

// ---- fbq: el PIXEL (navegador → Facebook, directo) ----
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function sendFbBrowserEvent(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", eventName, params || {}, { eventID: eventId });
  }
}

// ---- CAPI: aviso a NUESTRO server (navegador → /api/send-server-event). Fire-and-forget con
// postBeacon (sobrevive a la navegación → ideal para el Lead antes del redirect). ----
export interface FbServerEventInput {
  event: string;
  eventId: string;
  // Email o teléfono. Se hashea en el server (SHA-256), nunca viaja en crudo.
  contact?: string;
}

export function sendFbServerEvent(input: FbServerEventInput): void {
  postBeacon("/api/send-server-event", {
    eventName: input.event,
    eventId: input.eventId,
    contact: input.contact,
    fbp: getFbp(),
    fbc: getFbc(),
    eventSourceUrl:
      typeof window !== "undefined" ? window.location.href : undefined,
  });
}

// ---- pushEvent: la línea que usa la landing ----
export interface PushOptions {
  // Atar el evento a un id externo (ej. el attemptId del registro) / dedup.
  eventId?: string;
  // Email o teléfono del lead. Se hashea en el server (SHA-256), nunca en crudo.
  contact?: string;
  // Dispara solo el pixel del navegador, sin CAPI (ej. PageView).
  browserOnly?: boolean;
  // Parámetros extra para el pixel del navegador.
  params?: Record<string, unknown>;
}

export function handleEvent(event: FbEvent, opts: PushOptions = {}): void {
  const eventId = opts.eventId || newId();

  sendFbBrowserEvent(event, eventId, opts.params); // 1) navegador (pixel)
  
  plusEventFrecuency(event); // 2) al agregado de la sesión (+1)

  if (opts.browserOnly) return;
  sendFbServerEvent({ event, eventId, contact: opts.contact }); // 3) aviso al server (CAPI)
}
