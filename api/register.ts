import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const config = {
  runtime: "nodejs",
};

// Inicializa Firebase Admin una sola vez y reusa la instancia.
function initAdmin() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada");
    initializeApp({ credential: cert(JSON.parse(raw)) });
    getFirestore().settings({ ignoreUndefinedProperties: true });
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idToken, source } = req.body || {};
  if (!idToken) {
    return res.status(400).json({ error: "idToken requerido" });
  }

  try {
    initAdmin();

    // Verifica el token de Google/Firebase (no confiamos en el cliente).
    const decoded = await getAuth().verifyIdToken(idToken);

    const lead = {
      uid: decoded.uid,
      email: decoded.email || null,
      emailVerified: decoded.email_verified || false,
      name: decoded.name || null,
      picture: decoded.picture || null,
      provider: "google",
      source: typeof source === "string" ? source : "unknown",
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      country: req.headers["x-vercel-ip-country"] || null,
      region: req.headers["x-vercel-ip-country-region"] || null,
      city: req.headers["x-vercel-ip-city"]
        ? decodeURIComponent(String(req.headers["x-vercel-ip-city"]))
        : null,
      fbp: req.cookies?._fbp || null,
      fbc: req.cookies?._fbc || null,
      createdAt: FieldValue.serverTimestamp(),
    };

    // Upsert por uid → no duplica si el mismo usuario se registra otra vez.
    await getFirestore().collection("leads").doc(decoded.uid).set(lead, { merge: true });

    return res.status(200).json({ success: true, email: lead.email });
  } catch (err: any) {
    return res.status(401).json({ success: false, error: err.message });
  }
}
