import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "./utils/db";
import { sanitizeCampaign } from "./utils/sanitizeCampaign";
import { readRequest } from "./utils/readRequest";
import { EVENT_KEYS, EventValue } from "./types";

// Solo aceptamos valores escalares (contador / booleano / null) para las keys conocidas.
function cleanEventValue(v: unknown): EventValue | undefined {
  if (v === null) return null;
  if (typeof v === "boolean") return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

// Handler de POST /api/session. Guarda el doc ÚNICO de la sesión en log-[campaign].
// Upsert por sessionId: sendBeacon puede llamar varias veces (visibilitychange→hidden /
// pagehide / desmontaje) → siempre queda UN doc por sesión, con el último snapshot.
// TODOS los eventos (Facebook + propios, incluidas las clasificaciones activeSession/
// relevantSession que calcula el CLIENTE) van como campos en la RAÍZ. El server solo
// valida y guarda; no calcula nada.
export default async function handleSession(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId es requerido" });
    }

    // Eventos (Facebook + propios) → whitelist a las keys conocidas; cada uno a la raíz.
    const events: Record<string, EventValue> = {};
    for (const key of EVENT_KEYS) {
      const v = cleanEventValue(body[key]);
      if (v !== undefined) events[key] = v;
    }

    const campaign = sanitizeCampaign(body.campaign);
    const variant =
      typeof body.variant === "string" && body.variant ? body.variant : "default";
    const heroVariant =
      typeof body.heroVariant === "string" && body.heroVariant
        ? body.heroVariant
        : "default";

    const ctx = readRequest(req);

    const data: any = {
      sessionId,
      campaign,
      variant,
      heroVariant,

      // TODOS los eventos (fb + propios, incl. activeSession/relevantSession) a la raíz.
      ...events,

      // ip / geo / ua / cookies — extraídas del request en readRequest.
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      language: ctx.language,
      referer: ctx.referer,
      country: ctx.country,
      region: ctx.region,
      city: ctx.city,
      timezone: ctx.timezone,
      latitude: ctx.latitude,
      longitude: ctx.longitude,
      fbp: ctx.fbp,
      fbc: ctx.fbc,

      sessionStart:
        typeof body.sessionStart === "number" ? body.sessionStart : null,
      sessionEnd: typeof body.sessionEnd === "number" ? body.sessionEnd : null,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await getDb()
      .collection(`log-${campaign}`)
      .doc(sessionId)
      .set(data, { merge: true });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "error" });
  }
}

//