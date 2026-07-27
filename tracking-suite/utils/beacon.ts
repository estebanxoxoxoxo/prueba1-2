// Manda un payload a un endpoint de forma resiliente al cierre de pestaña:
// navigator.sendBeacon, con fallback a fetch keepalive. Lo usa el flush de sesión.
export async function postBeacon(url: string, payload: unknown):  Promise<Response> {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return new Response(null, { status: 200 });
    }
  } catch {
    /* cae al fetch de abajo */
  }
  try {
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
  return new Response(null, { status: 500 });
}
