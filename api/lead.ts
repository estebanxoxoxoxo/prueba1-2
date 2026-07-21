import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const config = {
  runtime: "nodejs",
};

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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const source =
      typeof req.body?.source === "string" ? req.body.source : "unknown";

    const lead = {
      source, // qué botón: navbar | hero | final-cta
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
      // Geolocalización por IP (headers que agrega Vercel en producción).
      country: req.headers["x-vercel-ip-country"] || null, // ISO 2 letras: AR, CL, CO…
      region: req.headers["x-vercel-ip-country-region"] || null,
      city: req.headers["x-vercel-ip-city"]
        ? decodeURIComponent(String(req.headers["x-vercel-ip-city"]))
        : null,
      timezone: req.headers["x-vercel-ip-timezone"] || null,
      // Identificadores de Meta (para cruzar con el evento Lead).
      fbp: req.cookies?._fbp || null,
      fbc: req.cookies?._fbc || null,
      referer: req.headers?.referer || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    await getDb().collection("leads").add(lead);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
