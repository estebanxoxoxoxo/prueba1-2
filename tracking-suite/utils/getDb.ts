import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Inicializa Firebase Admin una sola vez y reusa la instancia.
export function getDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT no está configurada");
    initializeApp({ credential: cert(JSON.parse(raw)) });
    // Ignora campos undefined (ej. fbp/fbc/geo si no existen).
    getFirestore().settings({ ignoreUndefinedProperties: true });
  }
  return getFirestore();
}
