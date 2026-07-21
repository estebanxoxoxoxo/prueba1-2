export const config = {
  runtime: "nodejs",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resuelve las credenciales de Firebase desde varias convenciones de nombre
// posibles en Vercel, para tolerar cómo se hayan cargado las variables.
function resolveFirebase() {
  const env = process.env;
  const projectId =
    env.FIREBASE_PROJECT_ID ||
    env.VITE_FIREBASE_PROJECT_ID ||
    env.projectId ||
    env.PROJECT_ID;
  const apiKey =
    env.FIREBASE_API_KEY ||
    env.VITE_FIREBASE_API_KEY ||
    env.apiKey ||
    env.API_KEY;
  return { projectId, apiKey };
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Email inválido" });
  }

  const { projectId, apiKey } = resolveFirebase();
  if (!projectId || !apiKey) {
    return res
      .status(500)
      .json({ error: "Firebase no está configurado en el servidor" });
  }

  // Escribe en Firestore vía REST (colección "waitlist"). No requiere SDK.
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/waitlist?key=${apiKey}`;
  const document = {
    fields: {
      email: { stringValue: email },
      source: { stringValue: "landing" },
      userAgent: { stringValue: String(req.headers["user-agent"] || "") },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(document),
    });
    const data = await response.json();

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "No se pudo guardar el email", detail: data });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
