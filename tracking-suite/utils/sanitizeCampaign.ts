// Sanitiza el campaign para usarlo como sufijo del nombre de colección de Firestore
// (log-[campaign]). Reglas de Firestore: sin "/", no vacío, no "__x__". Deja solo
// [a-z0-9_-], colapsa repetidos y cae a "default" si no queda nada.
export function sanitizeCampaign(raw: unknown): string {
  const s = (typeof raw === "string" ? raw : "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 100);
  if (!s || /^__.*__$/.test(s)) return "default";
  return s;
}
