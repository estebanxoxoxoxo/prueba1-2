import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createHash } from "crypto";

export const config = {
  runtime: "nodejs",
};

// TikTok exige SHA-256 (hex) para los datos personales (email, phone, external_id).
function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

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

  const { eventName, eventId } = req.body || {};
  if (!eventName || !eventId) {
    return res
      .status(400)
      .json({ error: "eventName y eventId son requeridos" });
  }

  // El Pixel ID es público (va en el navegador); el Access Token es SECRETO (env).
  const pixelId = process.env.TIKTOK_PIXEL_ID || "D9HON73C77U9GBM27EJG";
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  if (!accessToken) {
    return res
      .status(500)
      .json({ error: "TIKTOK_ACCESS_TOKEN no está configurada" });
  }

  // ttp (cookie del pixel) y ttclid (clic del ad). Cliente → cookies como fallback.
  const ttp = req.body?.ttp || req.cookies?._ttp || undefined;
  const ttclid =
    req.body?.ttclid || req.cookies?.ttclid || req.cookies?._ttclid || undefined;
  const eventSourceUrl =
    req.body?.eventSourceUrl ||
    req.headers?.referer ||
    (req.headers?.host ? `https://${req.headers.host}/` : undefined);
  const referrer = req.body?.referrer || undefined;

  // Advanced matching: normaliza + hashea el contacto (email o teléfono).
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
  const externalId = emailHash || phoneHash;

  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress;
  const userAgent = req.headers["user-agent"];

  // user: solo campos con valor (TikTok rechaza strings vacíos).
  const user: Record<string, string> = {};
  if (emailHash) user.email = emailHash;
  if (phoneHash) user.phone = phoneHash;
  if (externalId) user.external_id = externalId;
  if (ttp) user.ttp = ttp;
  if (ttclid) user.ttclid = ttclid;
  if (ip) user.ip = String(ip);
  if (userAgent) user.user_agent = String(userAgent);

  const payload = {
    event_source: "web",
    event_source_id: pixelId,
    data: [
      {
        event: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        user,
        page: { url: eventSourceUrl, referrer },
      },
    ],
  };

  const log = {
    provider: "tiktok",
    eventId,
    eventName,
    eventTime: Date.now(),
    ip,
    userAgent,
    country: req.headers["x-vercel-ip-country"] || null,
    region: req.headers["x-vercel-ip-country-region"] || null,
    city: req.headers["x-vercel-ip-city"]
      ? decodeURIComponent(String(req.headers["x-vercel-ip-city"]))
      : null,
    timezone: req.headers["x-vercel-ip-timezone"] || null,
    ttp,
    ttclid,
    contactType,
    emailHash,
    phoneHash,
    externalId,
    eventSourceUrl,
  };

  try {
    const response = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Token": accessToken,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    // TikTok responde HTTP 200 con code=0 en éxito; code != 0 es error.
    const ok = response.ok && data?.code === 0;

    // Log best-effort a Firestore (no rompe la respuesta si falla).
    try {
      await getDb()
        .collection("logs")
        .add({
          ...log,
          tiktokOk: ok,
          tiktok: data,
          createdAt: FieldValue.serverTimestamp(),
        });
    } catch (logErr: any) {
      console.error("No se pudo guardar el log TikTok:", logErr?.message);
    }

    if (!ok) {
      return res.status(500).json(data);
    }

    return res.status(200).json({ success: true, tiktok: data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
