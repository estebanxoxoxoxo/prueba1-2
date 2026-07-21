import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

export const config = {
  runtime: "nodejs",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Inicializa Firebase Admin una sola vez (reusa la instancia entre invocaciones).
function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada");
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
  }
  return getFirestore();
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Acepta un contacto que puede ser email o número de WhatsApp.
  // (Mantiene compatibilidad si llega como `email`.)
  const raw =
    typeof req.body?.contact === "string"
      ? req.body.contact
      : typeof req.body?.email === "string"
        ? req.body.email
        : "";
  const contact = raw.trim();

  if (!contact || contact.length > 200) {
    return res.status(400).json({ error: "Contacto inválido" });
  }

  // Si tiene "@" es un email → se valida. Si no, es un número → no se valida.
  const isEmail = contact.includes("@");
  if (isEmail && !EMAIL_RE.test(contact)) {
    return res.status(400).json({ error: "Email inválido" });
  }
  const type = isEmail ? "email" : "whatsapp";

  try {
    const db = getDb();
    await db.collection("waitlist").add({
      contact,
      type,
      source: "landing",
      userAgent: String(req.headers["user-agent"] || ""),
      ip:
        req.headers["x-forwarded-for"] ||
        req.socket?.remoteAddress ||
        null,
      createdAt: FieldValue.serverTimestamp(),
    });
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
