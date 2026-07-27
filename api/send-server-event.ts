import { createHash } from "crypto";

export const config = {
  runtime: "nodejs",
};

// Endpoint POST /api/send-server-event. SELF-CONTAINED (importa solo `crypto`, cero
// imports relativos a la suite → Vercel lo resuelve sin ERR_MODULE_NOT_FOUND). TODO el
// camino del evento server-side a Facebook (CAPI): valida → extrae el request → hashea el
// contacto → arma el payload → POST a Graph API. NO escribe en la DB. Mismo eventId que el
// pixel del navegador → dedup.

// SHA-256 (hex) para los datos personales (em, ph, external_id).
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Normaliza + hashea el contacto (email o teléfono) para el Advanced Matching de Meta.
function hashContact(raw?: string): { emailHash?: string; phoneHash?: string } {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return {};
  if (value.includes("@")) return { emailHash: sha256(value.toLowerCase()) };
  const digits = value.replace(/\D/g, "");
  return digits ? { phoneHash: sha256(digits) } : {};
}

// Contexto del request que necesita la CAPI: ip, user-agent, cookies de Meta, url.
function readRequest(req: any) {
  const h = req.headers || {};
  return {
    ip: h["x-forwarded-for"] || req.socket?.remoteAddress || undefined,
    userAgent: h["user-agent"] || undefined,
    fbp: req.body?.fbp || req.cookies?._fbp || undefined,
    fbc: req.body?.fbc || req.cookies?._fbc || undefined,
    eventSourceUrl:
      req.body?.eventSourceUrl ||
      h.referer ||
      (h.host ? `https://${h.host}/` : undefined),
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { eventName, eventId } = req.body || {};
  if (!eventName || !eventId) {
    return res.status(400).json({ error: "eventName y eventId son requeridos" });
  }

  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!pixelId || !accessToken) {
    return res
      .status(500)
      .json({ error: "META_PIXEL_ID / META_ACCESS_TOKEN no están configuradas" });
  }

  const ctx = readRequest(req);
  const { emailHash, phoneHash } = hashContact(req.body?.contact);
  const externalId = emailHash || phoneHash;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: ctx.eventSourceUrl,
        user_data: {
          client_ip_address: ctx.ip,
          client_user_agent: ctx.userAgent,
          // fbp (navegador) y fbc (clic del ad) → mejoran matching/atribución.
          fbp: ctx.fbp,
          fbc: ctx.fbc,
          // Advanced Matching (hasheado SHA-256). undefined se omite en el JSON.
          em: emailHash ? [emailHash] : undefined,
          ph: phoneHash ? [phoneHash] : undefined,
          external_id: externalId ? [externalId] : undefined,
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const data = await response.json();
    if (!response.ok) return res.status(500).json(data);
    return res.status(200).json({ success: true, meta: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "error" });
  }
}
