import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "../tracking-suite/utils/db";
import { sanitizeCampaign } from "../tracking-suite/utils/sanitizeCampaign";
import { readRequest } from "../tracking-suite/utils/readRequest";
import { EVENT_KEYS, EventValue } from "../tracking-suite/types";

export const config = {
  runtime: "nodejs",
};

// Solo aceptamos valores escalares (contador / booleano / null) para las keys conocidas.
function cleanEventValue(v: unknown): EventValue | undefined {
  if (v === null) return null;
  if (typeof v === "boolean") return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

// Del body toma SOLO los eventos conocidos (whitelist), ya como campos planos.
function pickEvents(body: any): Record<string, EventValue> {
  const events: Record<string, EventValue> = {};
  for (const key of EVENT_KEYS) {
    const value = cleanEventValue(body[key]);
    if (value !== undefined) events[key] = value;
  }
  return events;
}

// String con default (variant / heroVariant).
function orDefault(v: unknown): string {
  return typeof v === "string" && v ? v : "default";
}

// Epoch ms del cliente, o null.
function epochOrNull(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

// Endpoint POST /api/set-session-in-db. Guarda el doc ÚNICO de la sesión en
// log-[campaign]. Upsert por sessionId (sendBeacon puede llamar varias veces:
// visibilitychange→hidden / pagehide / desmontaje) → siempre queda UN doc por sesión,
// con el último snapshot. TODOS los eventos (fb + propios, incl. activeSession/
// relevantSession que calcula el CLIENTE) van como campos en la RAÍZ. El server solo
// valida y guarda; no calcula nada.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body || {};
  const sessionId = typeof body.sessionId === "string" ? body.sessionId : null;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId es requerido" });
  }

  // Cada parte se arma por separado y limpia; el doc solo las COMPONE con spreads.
  const campaign = sanitizeCampaign(body.campaign);
  const events = pickEvents(body); // fb + propios → raíz
  const context = readRequest(req); // ip / geo / ua / cookies → raíz

  const doc = {
    sessionId,
    campaign,
    variant: orDefault(body.variant),
    heroVariant: orDefault(body.heroVariant),
    sessionStart: epochOrNull(body.sessionStart),
    sessionEnd: epochOrNull(body.sessionEnd),
    ...events,
    ...context,
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    await getDb()
      .collection(`log-${campaign}`)
      .doc(sessionId)
      .set(doc, { merge: true });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "error" });
  }
}
