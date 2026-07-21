// utils/meta.ts

import { MetaEvent } from "./metaEventsTypes";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

// _fbc (identificador de clic): si el pixel ya lo seteó, lo usamos;
// si no, lo reconstruimos desde el ?fbclid=... de la URL.
function getFbc(): string | undefined {
  const existing = getCookie("_fbc");
  if (existing) return existing;
  if (typeof window === "undefined") return undefined;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

export async function sendMetaEvent(
  eventName: MetaEvent,
  eventId: string
): Promise<void> {
  const response = await fetch("/api/meta-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventName,
      eventId,
      fbp: getCookie("_fbp"),
      fbc: getFbc(),
      eventSourceUrl:
        typeof window !== "undefined" ? window.location.href : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send Meta event");
  }
}
