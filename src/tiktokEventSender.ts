import { TikTokEvent } from "./tiktokEventsTypes";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

// ttclid (identificador de clic de TikTok): del cookie que setea el pixel, o
// del ?ttclid=... de la URL del ad.
function getTtclid(): string | undefined {
  const existing = getCookie("ttclid") || getCookie("_ttclid");
  if (existing) return existing;
  if (typeof window === "undefined") return undefined;
  return new URLSearchParams(window.location.search).get("ttclid") || undefined;
}

// Envía un evento a TikTok vía Events API (server-side, /api/tiktok-event).
// Mismo eventId que el ttq.track del navegador → TikTok deduplica.
export async function sendTikTokEvent(
  eventName: TikTokEvent,
  eventId: string,
  // Opcional: email o teléfono. Se hashea en el server (nunca en crudo a TikTok).
  contact?: string
): Promise<void> {
  const response = await fetch("/api/tiktok-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventId,
      contact,
      // ttp (cookie del pixel) y ttclid (clic del ad) → mejoran el matching.
      ttp: getCookie("_ttp"),
      ttclid: getTtclid(),
      eventSourceUrl:
        typeof window !== "undefined" ? window.location.href : undefined,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send TikTok event");
  }
}
