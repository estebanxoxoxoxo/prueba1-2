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

// Lead de CLICK: se escribe apenas alguien toca "Registrarse", ANTES e
// independientemente del flujo de Google. Captura la intención aunque el
// usuario no complete el login (que es lo que estaba pasando). Si después
// completa Google, /api/register agrega el doc enriquecido con email/uid.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const source =
      typeof req.body?.source === "string" ? req.body.source : "unknown";

    await getDb().collection("leads").add({
      stage: "click", // intención: tocó Registrarse (aún sin login de Google)
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
    return res.status(500).json({ success: false, error: err?.message || "error" });
  }
}
