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

// Lead "temprano": se escribe apenas se toca Registrarse, antes del flujo de
// Google. Sin data del usuario (solo contexto del request). Prioriza dejar
// registro en la DB aunque Google falle o se cancele.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const source =
      typeof req.body?.source === "string" ? req.body.source : "unknown";

    await getDb().collection("leads").add({
      stage: "click", // aún sin registrarse con Google
      source,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"],
      country: req.headers["x-vercel-ip-country"] || null,
      region: req.headers["x-vercel-ip-country-region"] || null,
      city: req.headers["x-vercel-ip-city"]
        ? decodeURIComponent(String(req.headers["x-vercel-ip-city"]))
        : null,
      fbp: req.cookies?._fbp || null,
      fbc: req.cookies?._fbc || null,
      referer: req.headers?.referer || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
