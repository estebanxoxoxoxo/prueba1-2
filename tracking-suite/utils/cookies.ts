// Lectura de cookies del navegador + helpers de Meta (_fbp / _fbc).

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getFbp(): string | undefined {
  return getCookie("_fbp");
}

// _fbc (identificador de clic del ad): si el pixel ya lo seteó lo usamos; si no,
// lo reconstruimos desde el ?fbclid=... de la URL.
export function getFbc(): string | undefined {
  const existing = getCookie("_fbc");
  if (existing) return existing;
  if (typeof window === "undefined") return undefined;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}
