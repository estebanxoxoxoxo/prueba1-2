import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const config = {
  runtime: "nodejs",
};

// Endpoint POST /api/set-session-in-db. SELF-CONTAINED (importa solo `firebase-admin`,
// cero imports relativos a la suite → Vercel lo resuelve sin ERR_MODULE_NOT_FOUND). Guarda
// el doc ÚNICO de la sesión en log-[campaign], upsert por sessionId. TODOS los eventos
// (fb + propios, incl. activeSession/relevantSession que calcula el CLIENTE) van como
// campos en la RAÍZ. El server solo valida y guarda; no calcula nada.

// Inicializa Firebase Admin una sola vez y reusa la instancia.
function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada");
    initializeApp({ credential: cert(JSON.parse(raw)) });
    getFirestore().settings({ ignoreUndefinedProperties: true });
  }
  return getFirestore();
}

// Sanitiza el campaign para el nombre de colección (log-[campaign]).
function sanitizeCampaign(raw: unknown): string {
  const s = (typeof raw === "string" ? raw : "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 100);
  if (!s || /^__.*__$/.test(s)) return "default";
  return s;
}

// Contexto del request: ip, geo (headers de Vercel), user-agent, idioma, referer, cookies.
function readVercelMetadata(req: any) {
  const h = req.headers || {};
  const city = h["x-vercel-ip-city"];
  return {
    ip: h["x-forwarded-for"] || req.socket?.remoteAddress || null,
    userAgent: h["user-agent"] || null,
    language: h["accept-language"] || null,
    referer: h.referer || null,
    country: h["x-vercel-ip-country"] || null,
    region: h["x-vercel-ip-country-region"] || null,
    city: city ? decodeURIComponent(String(city)) : null,
    timezone: h["x-vercel-ip-timezone"] || null,
    latitude: h["x-vercel-ip-latitude"] || null,
    longitude: h["x-vercel-ip-longitude"] || null,
    fbp: req.body?.fbp || req.cookies?._fbp || null,
    fbc: req.body?.fbc || req.cookies?._fbc || null,
  };
}

type Scalar = number | boolean | null;

// Solo aceptamos valores escalares (contador / booleano / null).
function cleanEventValue(v: unknown): Scalar | undefined {
  if (v === null) return null;
  if (typeof v === "boolean") return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return undefined;
}

// Campos fijos del doc que NO son eventos (para no tratarlos como tales).
const RESERVED = new Set([
  "sessionId",
  "campaign",
  "variant",
  "heroVariant",
  "sessionStart",
  "sessionEnd",
  "fbp",
  "fbc",
]);

// Eventos = cualquier escalar del body que no sea un campo fijo (commonScroll, Lead, ...).
function pickEvents(body: any): Record<string, Scalar> {
  const events: Record<string, Scalar> = {};
  for (const key of Object.keys(body)) {
    if (RESERVED.has(key)) continue;
    const value = cleanEventValue(body[key]);
    if (value !== undefined) events[key] = value;
  }
  return events;
}

function orDefault(v: unknown): string {
  return typeof v === "string" && v ? v : "default";
}

function epochOrNull(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

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
  const context = readVercelMetadata(req); // ip / geo / ua / cookies → raíz

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
