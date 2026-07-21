import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createHash } from "crypto";

export const config = {
  runtime: "nodejs",
};

// Meta exige SHA-256 (hex) para los datos personales (em, ph).
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

// Inicializa Firebase Admin una sola vez y reusa la instancia.
function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada");
    initializeApp({ credential: cert(JSON.parse(raw)) });
    // Ignora campos undefined (ej. userId/email/fbp si no existen).
    getFirestore().settings({ ignoreUndefinedProperties: true });
  }
  return getFirestore();
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { eventName, eventId } = req.body;

  if (!eventName || !eventId) {
    return res.status(400).json({
      error: "eventName y eventId son requeridos",
    });
  }

  //@ts-ignore
  const pixelId = process.env.META_PIXEL_ID;
  //@ts-ignore
  const accessToken = process.env.META_ACCESS_TOKEN;

  // Preferimos lo que manda el cliente (más confiable), con fallback a cookies.
  const fbp = req.body?.fbp || req.cookies?._fbp || undefined;
  const fbc = req.body?.fbc || req.cookies?._fbc || undefined;
  // event_source_url: SIEMPRE debe ir (Meta lo exige para atribución/optimización).
  // Cliente → referer → como último recurso lo armamos desde el host.
  const eventSourceUrl =
    req.body?.eventSourceUrl ||
    req.headers?.referer ||
    (req.headers?.host ? `https://${req.headers.host}/` : undefined);

  // Advanced Matching: normalizamos y hasheamos el contacto (email o teléfono).
  // Si tiene "@" → email (trim + minúsculas). Si no → teléfono (solo dígitos).
  const rawContact =
    typeof req.body?.contact === "string" ? req.body.contact.trim() : "";
  let emailHash: string | undefined;
  let phoneHash: string | undefined;
  let contactType: "email" | "phone" | null = null;

  if (rawContact) {
    if (rawContact.includes("@")) {
      contactType = "email";
      emailHash = sha256(rawContact.toLowerCase());
    } else {
      const digits = rawContact.replace(/\D/g, "");
      if (digits) {
        contactType = "phone";
        phoneHash = sha256(digits);
      }
    }
  }

  // external_id: identificador estable del lead (usamos el hash del contacto).
  const externalId = emailHash || phoneHash;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: {
          client_ip_address:
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress,
          client_user_agent: req.headers["user-agent"],
          // fbp (navegador) y fbc (clic del ad) → mejoran matching/atribución.
          fbp,
          fbc,
          // Advanced Matching (hasheado SHA-256). undefined se omite en el JSON.
          em: emailHash ? [emailHash] : undefined,
          ph: phoneHash ? [phoneHash] : undefined,
          external_id: externalId ? [externalId] : undefined,
        },
      },
    ],
  };

  const log = {
    eventId,
    eventName,
    eventTime: Date.now(),
    ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
    userAgent: req.headers["user-agent"],
    // Geolocalización por IP (headers que agrega Vercel en producción).
    country: req.headers["x-vercel-ip-country"] || null,        // ISO 2 letras: AR, CL, CO…
    region: req.headers["x-vercel-ip-country-region"] || null,
    city: req.headers["x-vercel-ip-city"]
      ? decodeURIComponent(String(req.headers["x-vercel-ip-city"]))
      : null,
    timezone: req.headers["x-vercel-ip-timezone"] || null,
    userId: req.user?.id,          // si tienes login
    email: req.user?.email,        // si la conoces
    fbp,
    fbc,
    // Advanced Matching: qué tipo de contacto y su hash (para cruzar con Meta si hace falta).
    contactType,
    emailHash,
    phoneHash,
    externalId,
    eventSourceUrl,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // También manda el evento a la colección "logs" de Firestore.
    // Best-effort: si falla el log, no rompe la respuesta al cliente.
    try {
      await getDb()
        .collection("logs")
        .add({
          ...log,
          metaOk: response.ok,
          meta: data,
          createdAt: FieldValue.serverTimestamp(),
        });
    } catch (logErr: any) {
      console.error("No se pudo guardar el log en Firestore:", logErr?.message);
    }

    if (!response.ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({
      success: true,
      meta: data,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}
