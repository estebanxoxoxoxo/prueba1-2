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

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        user_data: {
          client_ip_address:
            req.headers["x-forwarded-for"] ||
            req.socket?.remoteAddress,
          client_user_agent: req.headers["user-agent"],
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
    userId: req.user?.id,          // si tienes login
    email: req.user?.email,        // si la conoces
    fbp: req.cookies?._fbp,
    fbc: req.cookies?._fbc,
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
